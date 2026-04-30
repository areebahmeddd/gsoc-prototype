/**
 * Stub for WXT's `#imports` barrel.
 * Tests never load extension-specific APIs, so everything resolves to safe no-ops.
 */
export const browser = {
  runtime: {
    getURL: (path: string) => `chrome-extension://test-id/${path}`,
    getManifest: () => ({ name: "test", version: "0.0.0" }),
  },
};
