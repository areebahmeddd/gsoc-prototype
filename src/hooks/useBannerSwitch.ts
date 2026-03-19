import { useCallback, useEffect, useState } from "react";
import { storeToggles, type StoreToggleKey } from "../retailers/storage";

interface BannerSwitchState {
  enabled: boolean;
  isReady: boolean;
  setEnabled: (value: boolean) => void;
}

/** Manages a per-store on/off toggle persisted in extension storage, synced across tabs. */
export function useBannerSwitch(key: string): BannerSwitchState {
  const [enabled, setEnabledState] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!(key in storeToggles)) {
      setIsReady(true);
      return;
    }

    const item = storeToggles[key as StoreToggleKey];

    item.getValue().then((val) => {
      setEnabledState(val);
      setIsReady(true);
    });

    const unwatch = item.watch((newVal) => {
      setEnabledState(newVal);
    });

    return unwatch;
  }, [key]);

  const setEnabled = useCallback(
    (value: boolean) => {
      setEnabledState(value);
      if (key in storeToggles) {
        storeToggles[key as StoreToggleKey].setValue(value);
      }
    },
    [key],
  );

  return { enabled, isReady, setEnabled };
}
