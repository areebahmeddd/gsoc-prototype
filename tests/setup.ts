import { vi } from "vitest";

// fetchProduct is the only function that hits the network; always mock it.
vi.mock("../src/api/offApi", () => ({
  fetchProduct: vi.fn(),
}));
