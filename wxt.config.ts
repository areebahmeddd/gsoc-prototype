import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],

  vite: () => ({
    plugins: [tailwindcss()],
  }),

  manifest: {
    name: "OpenFoodFacts eStore",
    description: "Browser extension for OpenFoodFacts (Canada)",
    version: "0.5.0",
    permissions: ["storage"],
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      128: "icon/128.png",
    },
    action: {
      default_icon: {
        16: "icon/16.png",
        32: "icon/32.png",
        48: "icon/48.png",
        128: "icon/128.png",
      },
    },
    web_accessible_resources: [
      {
        resources: [
          "score/nutriscore/*.svg",
          "score/nova/*.svg",
          "score/ecoscore/*.svg",
          "fop/*.svg",
          "icon/*.png",
          "icon/*.svg",
        ],
        matches: ["<all_urls>"],
      },
    ],
  },
});
