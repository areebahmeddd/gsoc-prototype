import { useMemo, type CSSProperties } from "react";
import {
  resolveCategory,
  resolveEcoScore,
  resolveFopWarnings,
  resolveNova,
  resolveNutriScore,
} from "../../api/offScores";
import type { OFFProduct } from "../../api/offTypes";
import {
  ecoScoreUrl,
  fopUnknownUrl,
  fopWarningUrl,
  novaGroupUrl,
  nutriScoreUrl,
} from "../../api/offUrls";

interface ScoreCardProps {
  product: OFFProduct | null;
  barcode: string;
  isDark?: boolean;
}

const CARD_W = 360;
const INNER_W = CARD_W - 14 * 2;

const GAP = 8;
const TILE_W = Math.floor((INNER_W - GAP * 2) / 3);
const TILE_H = 88;

const scoreItem: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 5,
  flexShrink: 0,
};

/** Score card showing Nutri-Score, NOVA, Eco-Score, and FOP warning badges. */
export function ScoreCard({
  product,
  barcode,
  isDark = false,
}: ScoreCardProps) {
  const safeProduct: OFFProduct = product ?? {};
  const nutriScore = resolveNutriScore(safeProduct);
  const nova = resolveNova(safeProduct);
  const ecoScore = resolveEcoScore(safeProduct);
  const fopResult = resolveFopWarnings(safeProduct);
  const allUnknown =
    nutriScore === "unknown" && nova === "unknown" && ecoScore === "unknown";
  const confidence =
    product !== null
      ? !allUnknown && fopResult.status === "computed"
        ? "verified"
        : allUnknown && fopResult.status === "computed"
          ? "fop-only"
          : "partial"
      : null;
  const category = resolveCategory(safeProduct.categories_tags);
  const cardBg = isDark ? "#18181b" : "#ffffff";
  const cardBorder = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = isDark
    ? "0 12px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)"
    : "0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.07)";
  const tileBg = isDark ? "#27272a" : "#f3f4f6";
  const dividerColor = isDark ? "#3f3f46" : "#efefef";

  const badgeColor =
    confidence === "verified"
      ? isDark
        ? "#4ade80"
        : "#289b38"
      : confidence === "fop-only"
        ? isDark
          ? "#60a5fa"
          : "#2563eb"
        : isDark
          ? "#fbbf24"
          : "#d97706";
  const badgeBg =
    confidence === "verified"
      ? isDark
        ? "rgba(74,222,128,0.1)"
        : "rgba(40,155,56,0.08)"
      : confidence === "fop-only"
        ? isDark
          ? "rgba(96,165,250,0.1)"
          : "rgba(37,99,235,0.08)"
        : isDark
          ? "rgba(251,191,36,0.1)"
          : "rgba(217,119,6,0.08)";
  const badgeBorder =
    confidence === "verified"
      ? `1px solid ${isDark ? "rgba(74,222,128,0.2)" : "rgba(40,155,56,0.18)"}`
      : confidence === "fop-only"
        ? `1px solid ${isDark ? "rgba(96,165,250,0.2)" : "rgba(37,99,235,0.18)"}`
        : `1px solid ${isDark ? "rgba(251,191,36,0.2)" : "rgba(217,119,6,0.18)"}`;
  const badgeDividerColor =
    confidence === "verified"
      ? isDark
        ? "rgba(74,222,128,0.3)"
        : "rgba(40,155,56,0.25)"
      : confidence === "fop-only"
        ? isDark
          ? "rgba(96,165,250,0.3)"
          : "rgba(37,99,235,0.25)"
        : isDark
          ? "rgba(251,191,36,0.3)"
          : "rgba(217,119,6,0.25)";
  const badgeLabel =
    confidence === "verified"
      ? "Verified"
      : confidence === "fop-only"
        ? "FOP Only"
        : "Partial Data";
  const badgeTitle =
    confidence === "verified"
      ? "All nutrition scores and Health Canada FOP data are available"
      : confidence === "fop-only"
        ? "Health Canada FOP computed; Nutri-Score, NOVA, and Eco-Score not in Open Food Facts"
        : "Product found but some nutritional data is missing in Open Food Facts";

  const label = useMemo<CSSProperties>(
    () => ({
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.7px",
      color: isDark ? "#6b7280" : "#9ca3af",
      lineHeight: 1,
      fontFamily: "system-ui, sans-serif",
      whiteSpace: "nowrap",
      textAlign: "center",
    }),
    [isDark],
  );

  const tileBox = useMemo(
    () =>
      (extra?: CSSProperties): CSSProperties => ({
        width: TILE_W,
        height: TILE_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: tileBg,
        borderRadius: 10,
        flexShrink: 0,
        overflow: "hidden",
        ...extra,
      }),
    [tileBg],
  );

  const sectionLabel: CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    color: isDark ? "#6b7280" : "#9ca3af",
    fontFamily: "system-ui, sans-serif",
  };

  return (
    <div
      className="hover-preview-animate"
      style={{
        background: cardBg,
        borderRadius: 16,
        padding: "14px 14px 12px",
        boxShadow: cardShadow,
        border: cardBorder,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: CARD_W,
        maxWidth: "calc(100vw - 80px)",
      }}
    >
      {confidence && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <span
              title={category ?? "Category not available in Open Food Facts"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 9,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.3px",
                color: category
                  ? isDark
                    ? "#a1a1aa"
                    : "#71717a"
                  : isDark
                    ? "#71717a"
                    : "#9ca3af",
                background: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                borderRadius: 20,
                padding: "3px 8px",
                maxWidth: 180,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <span style={{ opacity: 0.55, flexShrink: 0 }}>Category</span>
              <span
                style={{
                  width: 1,
                  height: 9,
                  background: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.12)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                  opacity: category ? 1 : 0.6,
                }}
              >
                {category ?? "Not Found"}
              </span>
            </span>
            <span
              title={badgeTitle}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 9,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.3px",
                flexShrink: 0,
                color: badgeColor,
                background: badgeBg,
                border: badgeBorder,
                borderRadius: 20,
                padding: "3px 8px",
                cursor: "default",
              }}
            >
              <span style={{ opacity: 0.55 }}>Data</span>
              <span
                style={{
                  width: 1,
                  height: 9,
                  background: badgeDividerColor,
                  flexShrink: 0,
                }}
              />
              {badgeLabel}
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                fill="none"
                style={{ width: 9, height: 9, flexShrink: 0, opacity: 0.6 }}
              >
                <circle
                  cx="6"
                  cy="6"
                  r="5.25"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M6 5.25v3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="6" cy="3.75" r="0.6" fill="currentColor" />
              </svg>
            </span>
          </div>
          <div style={{ height: 1, background: dividerColor }} />
        </>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={sectionLabel}>Health Canada Front-of-Package</span>
        <div style={{ display: "flex", justifyContent: "center", gap: GAP }}>
          {fopResult.status === "unavailable" ? (
            <div style={scoreItem}>
              <div style={tileBox()}>
                <img
                  src={fopUnknownUrl()}
                  alt="FOP data unavailable"
                  style={{
                    maxWidth: "82%",
                    maxHeight: TILE_H - 12,
                    objectFit: "contain",
                  }}
                  loading="eager"
                />
              </div>
              <span style={label}>FOP Warning</span>
            </div>
          ) : fopResult.warnings.length === 0 ? (
            <div style={scoreItem}>
              <div style={tileBox()}>
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  style={{ width: 36, height: 36 }}
                  aria-label="No FOP warnings"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="#289b38"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M12 20l6 6 10-12"
                    stroke="#289b38"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span style={label}>No Warnings</span>
            </div>
          ) : (
            fopResult.warnings.map((w) => (
              <div key={w.key} style={scoreItem}>
                <div style={tileBox()}>
                  <img
                    src={fopWarningUrl(w.key)}
                    alt={w.label}
                    style={{
                      maxWidth: "82%",
                      maxHeight: TILE_H - 12,
                      objectFit: "contain",
                    }}
                    loading="eager"
                  />
                </div>
                <span style={label}>FOP Warning</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ height: 1, background: dividerColor }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={sectionLabel}>Nutritional Scores</span>
        <div style={{ display: "flex", gap: GAP }}>
          <div style={scoreItem}>
            <div style={tileBox()}>
              <img
                src={nutriScoreUrl(nutriScore)}
                alt={`Nutri-Score ${nutriScore.toUpperCase()}`}
                style={{
                  maxWidth: "88%",
                  maxHeight: TILE_H - 8,
                  objectFit: "contain",
                }}
                loading="eager"
              />
            </div>
            <span style={label}>Nutri-Score</span>
          </div>

          <div style={scoreItem}>
            <div style={tileBox()}>
              <img
                src={novaGroupUrl(nova)}
                alt={`NOVA group ${nova}`}
                style={{
                  maxWidth: "82%",
                  maxHeight: TILE_H - 12,
                  objectFit: "contain",
                }}
                loading="eager"
              />
            </div>
            <span style={label}>Nova Group</span>
          </div>

          <div style={scoreItem}>
            <div style={tileBox()}>
              <img
                src={ecoScoreUrl(ecoScore)}
                alt={`Eco-Score ${String(ecoScore).toUpperCase()}`}
                style={{
                  maxWidth: "82%",
                  maxHeight: TILE_H - 8,
                  objectFit: "contain",
                }}
                loading="eager"
              />
            </div>
            <span style={label}>Eco-Score</span>
          </div>
        </div>
      </div>

      <div
        style={{
          paddingTop: 8,
          borderTop: `1px solid ${dividerColor}`,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {product === null ? (
          <a
            href={`https://world.openfoodfacts.org/cgi/product.pl?type=add&code=${barcode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="off-link"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#e67e22",
              textDecoration: "none",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.2px",
            }}
          >
            <span style={{ textDecoration: "underline" }}>
              Add this product
            </span>{" "}
            to Open Food Facts ↗
          </a>
        ) : allUnknown ? (
          <a
            href={`https://world.openfoodfacts.org/cgi/product.pl?type=add&code=${barcode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="off-link"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#e67e22",
              textDecoration: "none",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.2px",
            }}
          >
            <span style={{ textDecoration: "underline" }}>
              Help complete this product
            </span>{" "}
            on Open Food Facts ↗
          </a>
        ) : (
          <a
            href={
              safeProduct.url ??
              `https://world.openfoodfacts.org/product/${barcode}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="off-link"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: isDark ? "#4ade80" : "#289b38",
              textDecoration: "none",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.2px",
            }}
          >
            <span style={{ textDecoration: "underline" }}>Learn more</span> on
            Open Food Facts ↗
          </a>
        )}
      </div>
    </div>
  );
}
