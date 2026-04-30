import { useBannerSwitch } from "../../hooks/useBannerSwitch";

interface PopupStoreRowProps {
  name: string;
  /** Hostname shown as a link label. */
  address: string;
  href: string;
  /** Storage key for the per-store toggle. */
  storageKey: string;
  /** Logo image URL; falls back to avatar initials when omitted. */
  logoSrc?: string;
  /** Fallback initials/short text for the avatar. */
  avatarText?: string;
  /** Background colour for the avatar when no logo is available. */
  avatarColor?: string;
  /** Whether to disable the toggle regardless of the stored value. */
  disabledManually?: boolean;
  /** Visual state override when `disabledManually` is enabled. */
  enabledOverride?: boolean;
}

/** Single popup row showing a store's logo, address, and on/off toggle. */
export function PopupStoreRow({
  name,
  address,
  href,
  storageKey,
  logoSrc,
  avatarText,
  avatarColor,
  disabledManually,
  enabledOverride,
}: PopupStoreRowProps) {
  const { enabled, isReady, setEnabled } = useBannerSwitch(storageKey);
  const checked = disabledManually ? (enabledOverride ?? enabled) : enabled;

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-150 border-b border-gray-100 dark:border-zinc-800 last:border-0">
      {logoSrc ? (
        <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl overflow-hidden p-1 border border-gray-100 dark:border-zinc-700 shadow-sm">
          <img
            src={logoSrc}
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={avatarColor ? { background: avatarColor } : undefined}
          className={[
            "w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold border shadow-sm",
            avatarColor
              ? "text-white border-transparent"
              : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-600",
          ].join(" ")}
        >
          {avatarText ?? name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100 truncate leading-snug">
          {name}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#f39200] hover:underline truncate block leading-snug"
        >
          {address}
        </a>
      </div>

      {disabledManually ? (
        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">
          Soon
        </span>
      ) : (
        <button
          role="switch"
          aria-checked={checked}
          aria-label={`Toggle OpenFoodFacts for ${name}`}
          disabled={!isReady}
          onClick={() => setEnabled(!enabled)}
          className={[
            "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 cursor-pointer",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f39200] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            checked ? "bg-[#f39200]" : "bg-gray-200 dark:bg-zinc-600",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5",
              checked ? "translate-x-[22px]" : "translate-x-0.5",
            ].join(" ")}
          />
        </button>
      )}
    </div>
  );
}
