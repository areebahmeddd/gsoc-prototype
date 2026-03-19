import { defineContentScript } from "#imports";
import { createOverlayMount } from "~/lib/createOverlayMount";
import { MetroConfig } from "~/retailers/configs/canada/metro";

export default defineContentScript({
  matches: MetroConfig.matches,
  runAt: "document_idle",
  cssInjectionMode: "ui",
  main: createOverlayMount(MetroConfig, "nutribanner-metro"),
});
