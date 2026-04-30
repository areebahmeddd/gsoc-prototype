import { browser } from "#imports";

interface FloatingButtonProps {
  loading: boolean;
  pinned?: boolean;
  isDark?: boolean;
}

/** Floating action button on the right viewport edge; shows a spinner while data loads. */
export function FloatingButton({
  loading,
  pinned = false,
  isDark = false,
}: FloatingButtonProps) {
  const bg = pinned
    ? isDark
      ? "#052e0d"
      : "#f0fdf4"
    : isDark
      ? "#18181b"
      : "#ffffff";

  const borderColor = pinned ? "#1a6b27" : "#289b38";

  const shadow = pinned
    ? isDark
      ? "-4px 2px 20px rgba(40,155,56,0.18), -1px 1px 4px rgba(0,0,0,0.4)"
      : "-4px 2px 20px rgba(40,155,56,0.22), -1px 1px 4px rgba(0,0,0,0.08)"
    : isDark
      ? "-4px 2px 16px rgba(0,0,0,0.55), -1px 1px 4px rgba(0,0,0,0.35)"
      : "-4px 2px 16px rgba(0,0,0,0.14), -1px 1px 4px rgba(0,0,0,0.08)";

  return (
    <button
      aria-label="View nutrition scores"
      aria-pressed={pinned}
      title="Open Food Facts"
      className="btn-animate focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      style={{
        width: 68,
        height: 52,
        borderRadius: "12px 0 0 12px",
        background: bg,
        border: "none",
        borderLeft: `3px solid ${borderColor}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: shadow,
        transition:
          "background 150ms ease, border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease",
        outline: "none",
        padding: 0,
      }}
    >
      {loading ? (
        <svg
          style={{ width: 22, height: 22, color: "#289b38" }}
          className="animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            style={{ opacity: 0.8 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
          />
        </svg>
      ) : (
        <img
          src={browser.runtime.getURL("icon/logo.svg")}
          alt=""
          style={{ width: 36, height: 36, objectFit: "contain" }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
