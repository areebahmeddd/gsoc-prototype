import { defineContentScript } from "#imports";
import { createOverlayMount } from "~/lib/createOverlayMount";
import { WalmartConfig } from "~/retailers/configs/canada/walmart";

export default defineContentScript({
  matches: WalmartConfig.matches,
  runAt: "document_idle",
  cssInjectionMode: "ui",
  main: createOverlayMount(WalmartConfig, "nutribanner-walmart"),
});
