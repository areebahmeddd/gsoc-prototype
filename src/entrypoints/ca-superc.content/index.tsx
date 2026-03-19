import { defineContentScript } from "#imports";
import { createOverlayMount } from "~/lib/createOverlayMount";
import { SuperCConfig } from "~/retailers/configs/canada/superc";

export default defineContentScript({
  matches: SuperCConfig.matches,
  runAt: "document_idle",
  cssInjectionMode: "ui",
  main: createOverlayMount(SuperCConfig, "nutribanner-superc"),
});
