import { storage } from "#imports";

export const buttonY = storage.defineItem<number | null>("local:buttonY", {
  defaultValue: null,
});

export const storeToggles = {
  metro: storage.defineItem<boolean>("local:metro", { defaultValue: true }),
  superc: storage.defineItem<boolean>("local:superc", { defaultValue: true }),
  walmart: storage.defineItem<boolean>("local:walmart", { defaultValue: true }),
};

export type StoreToggleKey = keyof typeof storeToggles;
