import { useCallback, useEffect, useState } from "react";
import { darkMode as darkModeStorage } from "../retailers/storage";

/** Persisted dark-mode preference synced via extension storage. */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    darkModeStorage.getValue().then((val) => {
      setIsDark(val);
    });

    const unwatch = darkModeStorage.watch((newVal) => {
      setIsDark(newVal);
    });

    return unwatch;
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      darkModeStorage.setValue(next);
      return next;
    });
  }, []);

  return { isDark, toggle };
}
