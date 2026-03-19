import { browser } from "#imports";

interface FloatingButtonProps {
  loading: boolean;
}

/** Floating action button on the right viewport edge; shows a spinner while data loads. */
export function FloatingButton({ loading }: FloatingButtonProps) {
  return (
    <button
      aria-label="View nutrition scores"
      title="Open Food Facts"
      className="btn-animate focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      style={{
        width: 68,
        height: 52,
        borderRadius: "12px 0 0 12px",
        background: "#ffffff",
        border: "none",
        borderLeft: "3px solid #289b38",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "-4px 2px 16px rgba(0,0,0,0.14), -1px 1px 4px rgba(0,0,0,0.08)",
        transition: "transform 150ms ease, box-shadow 150ms ease",
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
