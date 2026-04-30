# Architecture

This document describes how the extension is structured, how data flows through it, and the reasoning behind the key design choices.

## Overview

The extension is built with [WXT](https://wxt.dev) (Chrome MV3 / Firefox), React 19, and TypeScript 5. When you visit a supported grocery store page, a content script activates and mounts a floating UI directly on the page. That UI pulls product data live from the [Open Food Facts](https://world.openfoodfacts.org) API and shows nutritional scores without leaving the store.

## Directory structure

```
src/
  api/              # Data access layer: API client, types, score resolvers, asset URLs
  components/
    overlay/        # Floating button + score card rendered into the Shadow DOM
    popup/          # Popup store-list row component
  entrypoints/
    background.ts   # MV3 service worker (required by WXT; no logic)
    ca-*.content/   # One content script per supported store
    popup/          # Popup page (HTML + React root)
  hooks/            # React hooks: barcode polling, data fetching, storage, dark mode
  lib/              # Shared utilities (Shadow DOM mount factory)
  retailers/
    configs/        # Per-store StoreConfig implementations
    storage.ts      # WXT storage item definitions
  styles/
    content.css     # Styles injected into the Shadow DOM
```

## Data flow

```
Store page (e.g. metro.ca)
      |
      v
Content script  (ca-metro.content/index.tsx)
      |  createOverlayMount()
      v
Shadow DOM root  ──────────────────────────────────────────────
|  (CSS-isolated from the host page)                          |
|                                                             |
|  FloatingApp.tsx  (orchestration layer)                     |
|    ├── useCurrentUrl()    -> tracks SPA navigation          |
|    ├── useBarcode()       -> polls DOM for barcode (500ms)  |
|    ├── useOFF()           -> fetches OFF API v2             |
|    ├── useBannerSwitch()  -> per-store on/off from storage  |
|    ├── useDarkMode()      -> dark mode from storage         |
|    ├── FloatingButton.tsx -> draggable right-edge button    |
|    └── ScoreCard.tsx      -> score panel                    |
|                                                             |
└─────────────────────────────────────────────────────────────

Extension popup  (popup/App.tsx)
  └── country selector + PopupStoreRow per store (on/off toggle)
```

## Key modules

### `src/api/`

| File           | Responsibility                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `offTypes.ts`  | Shared TypeScript types for OFF API responses and FOP results                                                                            |
| `offApi.ts`    | `fetchProduct(barcode)`: one GET to the OFF API v2, cached with `force-cache` to avoid re-fetching the same product on every page reload |
| `offScores.ts` | Pure resolvers: grade normalization, category extraction, Health Canada FOP computation                                                  |
| `offUrls.ts`   | `browser.runtime.getURL()` wrappers for bundled score and FOP SVG assets                                                                 |

`offScores.ts` contains no browser API calls, which keeps all the scoring logic testable in a plain Node environment without any extension setup. `offUrls.ts` is the only file in `src/api/` that needs an extension context, so it is separated out on purpose.

### `src/retailers/configs/`

Each store implements the `StoreConfig` interface:

```ts
interface StoreConfig {
  name: string;
  storageKey: string;
  matches: string[]; // WXT manifest match patterns
  isProductPage: () => boolean;
  extractBarcode: () => string | null;
}
```

Barcode extraction works through a priority chain of strategies: URL path, JSON-LD, DOM attributes, then a text-node scan. If the first strategy fails (for example, because the store changed its URL format), the next one takes over. This makes the extension resilient to store markup changes without requiring a full rewrite.

### `src/hooks/`

| Hook              | Purpose                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `useBarcode`      | Polls `config.extractBarcode()` every 500 ms, up to 30 attempts, to handle SPAs that render product data after the initial page load |
| `useOFF`          | Fetches from the OFF API and cancels stale responses when the barcode changes mid-navigation                                         |
| `useBannerSwitch` | Reads and watches the per-store on/off toggle from extension storage                                                                 |
| `useCurrentUrl`   | Listens to `popstate` and `wxt:locationchange` for SPA navigation                                                                    |
| `useDarkMode`     | Persisted dark-mode preference via extension storage                                                                                 |

### `src/lib/createOverlayMount.tsx`

A factory that returns a WXT `main` function. Each content script calls it once. It creates a Shadow DOM root via `createShadowRootUi`, renders `<FloatingApp>` inside `StrictMode`, and injects `content.css` into the shadow root so the store page's styles cannot interfere with the overlay.

## Design decisions

### Shadow DOM isolation

The overlay lives inside a Shadow DOM. Store pages often ship aggressive global CSS that would otherwise break the overlay's layout or fonts. Mounting inside a shadow root prevents that entirely: the store's styles cannot reach the overlay, and the overlay's styles cannot leak back into the store page.

The `cssInjectionMode: "ui"` setting in each content script tells WXT to inject `content.css` into the shadow root rather than the main document, so the `.off-link` hover styles are also correctly scoped.

### Health Canada FOP

Front-of-package warnings are computed locally from the `nutriments` data already returned by the OFF API. No extra network call is needed.

The computation follows Canada's Food and Drug Regulations (B.01.350-B.01.357):

- The % Daily Value threshold depends on serving size: 10% for portions up to 30 g, 15% for standard portions, and 30% for portions of 200 g or more.
- Nutrients are checked in the order set by the regulations: saturated fat, sugars, sodium.
- If the OFF data is missing nutriments or per-serving values, the status is set to `"unavailable"`. No estimates or approximations are used.

## Adding a new store

1. Create `src/retailers/configs/{country}/{store}.ts` implementing `StoreConfig`.
2. Add a toggle item to `src/retailers/storage.ts`.
3. Create `src/entrypoints/{cc}-{store}.content/index.tsx` calling `createOverlayMount`.
4. Add the store row to `src/entrypoints/popup/App.tsx`.
5. Add unit tests under `tests/retailers/{country}/{store}.test.ts`.
