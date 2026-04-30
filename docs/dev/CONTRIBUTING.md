# Contributing

Thanks for wanting to contribute. This guide covers everything you need to get the project running, write tests, follow the code conventions, and open a pull request.

By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Prerequisites

- Node.js 22+
- npm 11+
- Chrome or Firefox for manual testing

## Setup

```bash
git clone https://github.com/openfoodfacts/estore-extension.git
cd estore-extension
npm install
```

## Development

```bash
npm run dev:chrome    # Vite dev server targeting Chrome (MV3)
npm run dev:firefox   # Vite dev server targeting Firefox
```

Load the extension in Chrome: open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and select `.output/chrome-mv3/`.

## Testing

```bash
npm run test             # Run all tests once
npm run test:coverage    # Run with V8 coverage report
```

Tests run in [happy-dom](https://github.com/capricorn86/happy-dom) via Vitest, so no real browser or extension context is needed. The `tests/__mocks__/wxt-imports.ts` stub replaces WXT's `#imports` barrel, which means any code that calls `browser.*` APIs can still be tested without extra setup.

New code should include tests. Pure functions (score resolvers, barcode extraction) are the easiest to cover. For hooks or utilities that touch extension storage, follow the pattern in the existing hook tests.

See [tests/README.md](../../tests/README.md) for the full test map and coverage scope.

## Code style

Formatting is handled by Prettier:

```bash
npm run format
```

A few conventions beyond formatting:

- Use `>=`, `<=`, and `->` in comments. No Unicode math or arrow symbols.
- Prefer `const` and early returns over nested conditionals.
- Do not remove commented-out `console.*` lines; they serve as debug markers.
- No em dashes in comments or documentation.

## Branching

- `master` is the stable branch.
- Use `feature/{short-description}` or `fix/{short-description}` for your branch.
- Keep commits focused. One logical change per commit.

## Pull requests

1. Fork the repository and create your branch from `master`.
2. Make your changes and ensure `npm run test` passes.
3. Run `npm run format` before committing.
4. Open a pull request with a clear title and a description of what changed and why.
5. Reference any related issue with `Closes #NNN`.

## Sign-off

All commits must include a `Signed-off-by` trailer. Use `git commit -s` to add it automatically:

```
Signed-off-by: Your Name <your@email.com>
```

This certifies that you agree to the [Developer Certificate of Origin](https://developercertificate.org) — that you wrote the contribution or have the right to submit it under this project's license.

## Adding a store

See [ARCHITECTURE.md](ARCHITECTURE.md#adding-a-new-store) for the full step-by-step checklist. The existing Canadian store configs in `src/retailers/configs/canada/` are good references for how to structure a new one.
