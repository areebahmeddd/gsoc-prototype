import { useEffect, useState } from "react";

/** Returns the current page URL, updated on popstate and wxt:locationchange events. */
export function useCurrentUrl(): string {
  const [url, setUrl] = useState(window.location.href);

  useEffect(() => {
    const update = () => setUrl(window.location.href);

    window.addEventListener("popstate", update);
    window.addEventListener("wxt:locationchange", update);

    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("wxt:locationchange", update);
    };
  }, []);

  return url;
}
