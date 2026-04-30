# Tests

## Commands

```bash
npm run test             # single run
npm run test:watch       # watch mode (re-runs on save)
npm run test:coverage    # single run with coverage report
```

## Files

| File                                     | Covers                                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/unit/offScores.test.ts`           | Score resolvers (`resolveNutriScore`, `resolveNova`, `resolveEcoScore`, `resolveCategory`, FOP warnings) and URL helpers -> `src/api/offScores.ts`, `src/api/offUrls.ts` |
| `tests/hooks/useOFF.test.ts`             | Fetch state machine and stale-response cancellation -> `src/hooks/useOFF.ts`                                                                                             |
| `tests/hooks/useBarcode.test.ts`         | Polling, retry, timeout, and cleanup -> `src/hooks/useBarcode.ts`                                                                                                        |
| `tests/hooks/useCurrentUrl.test.ts`      | Event listener wiring and cleanup -> `src/hooks/useCurrentUrl.ts`                                                                                                        |
| `tests/retailers/canada/metro.test.ts`   | URL and DOM extraction -> `MetroConfig`                                                                                                                                  |
| `tests/retailers/canada/superc.test.ts`  | URL and DOM extraction -> `SuperCConfig`                                                                                                                                 |
| `tests/retailers/canada/walmart.test.ts` | JSON-LD, attribute, label, and TreeWalker extraction -> `WalmartConfig`                                                                                                  |

## Coverage

Numbers from the last `npm run test:coverage` run (119 tests, 7 files).

| File                           | Statements | Branches | Functions | Lines |
| ------------------------------ | ---------- | -------- | --------- | ----- |
| `src/api/offScores.ts`         | 100%       | 100%     | 100%      | 100%  |
| `src/api/offUrls.ts`           | 100%       | 100%     | 100%      | 100%  |
| `src/hooks/useBarcode.ts`      | 100%       | 100%     | 100%      | 100%  |
| `src/hooks/useCurrentUrl.ts`   | 100%       | 100%     | 100%      | 100%  |
| `src/hooks/useOFF.ts`          | 100%       | 100%     | 100%      | 100%  |
| `src/retailers/.../metro.ts`   | 100%       | 100%     | 100%      | 100%  |
| `src/retailers/.../superc.ts`  | 100%       | 100%     | 100%      | 100%  |
| `src/retailers/.../walmart.ts` | 100%       | 89%      | 100%      | 100%  |

The 11% branch gap in `walmart.ts` is optional-chaining null paths (`?.` and `??`) that are unreachable through normal DOM setup in happy-dom; `textContent` is never `null` for real elements.

## Not covered

| File                           | Reason                                                           |
| ------------------------------ | ---------------------------------------------------------------- |
| `src/api/offApi.ts`            | Makes real HTTP requests; requires a live network or E2E harness |
| `src/hooks/useBannerSwitch.ts` | Requires live browser extension storage events                   |
| `src/hooks/useDarkMode.ts`     | Requires live browser extension storage                          |
| `src/retailers/storage.ts`     | Requires live browser extension storage                          |

No E2E tests are included. End-to-end testing (mounting the extension, navigating to a real store page, asserting the score card appears) requires a headless browser with extension-loading support such as Playwright with `chrome.loadExtension`. That belongs in a separate suite.

## Stack

| Package                                                                                | Version | Purpose                                   |
| -------------------------------------------------------------------------------------- | ------- | ----------------------------------------- |
| [Vitest](https://vitest.dev)                                                           | 4.x     | Test runner and assertion library         |
| [happy-dom](https://github.com/capricorn86/happy-dom)                                  | 20.x    | Lightweight DOM environment               |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro) | 16.x    | `renderHook` and `waitFor` for hook tests |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage)                               | 4.x     | V8-native code coverage                   |
