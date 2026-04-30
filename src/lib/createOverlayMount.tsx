import { createShadowRootUi, type ContentScriptContext } from "#imports";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FloatingApp } from "~/components/overlay/FloatingApp";
import type { StoreConfig } from "~/retailers/configs/types";
import "~/styles/content.css";

/** Creates the Shadow DOM content script mount function for the given store. */
export function createOverlayMount(config: StoreConfig, name: string) {
  return async function main(ctx: ContentScriptContext) {
    const ui = await createShadowRootUi(ctx, {
      name,
      position: "overlay",
      zIndex: 2147483647,

      onMount(container) {
        const wrapper = document.createElement("div");
        container.append(wrapper);
        const root = createRoot(wrapper);
        root.render(
          <StrictMode>
            <FloatingApp config={config} />
          </StrictMode>,
        );
        return root;
      },

      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();
  };
}
