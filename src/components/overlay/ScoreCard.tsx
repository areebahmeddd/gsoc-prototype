import type { CSSProperties } from "react";
import {
  ecoScoreUrl,
  fopWarningUrl,
  novaGroupUrl,
  nutriScoreUrl,
  resolveEcoScore,
  resolveFopWarnings,
  resolveNova,
  resolveNutriScore,
} from "../../api/offScores";
import type { OFFProduct } from "../../api/offTypes";

interface ScoreCardProps {
  product: OFFProduct;
  barcode: string;
}

const CARD_W = 320;
const INNER_W = CARD_W - 14 * 2;

const GAP = 8;
const TILE_W = (INNER_W - GAP) / 2;
const TILE_H = 88;

const label: CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.7px",
  color: "#9ca3af",
  lineHeight: 1,
  fontFamily: "system-ui, sans-serif",
  whiteSpace: "nowrap",
  textAlign: "center",
};

const tileBox = (extra?: CSSProperties): CSSProperties => ({
  width: TILE_W,
  height: TILE_H,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f3f4f6",
  borderRadius: 10,
  flexShrink: 0,
  overflow: "hidden",
  ...extra,
});

const scoreItem: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 5,
  flexShrink: 0,
};

/** Score card showing Nutri-Score, NOVA, Eco-Score, and FOP warning badges. */
export function ScoreCard({ product, barcode }: ScoreCardProps) {
  const nutriScore = resolveNutriScore(product);
  const nova = resolveNova(product);
  const ecoScore = resolveEcoScore(product);
  const fopWarnings = resolveFopWarnings(product);

  return (
    <div
      className="hover-preview-animate"
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "14px 14px 12px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: CARD_W,
        maxWidth: "calc(100vw - 80px)",
      }}
    >
      <div style={{ display: "flex", gap: GAP }}>
        {fopWarnings.map((w) => (
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
        ))}

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
          <span style={label}>NOVA</span>
        </div>
      </div>

      <div style={{ height: 1, background: "#efefef" }} />

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

      <div
        style={{
          paddingTop: 8,
          borderTop: "1px solid #efefef",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <a
          href={
            product.url ?? `https://world.openfoodfacts.org/product/${barcode}`
          }
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#289b38",
            textDecoration: "none",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.2px",
            opacity: 0.85,
            transition: "opacity 120ms ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")
          }
        >
          View on Open Food Facts ↗
        </a>
      </div>
    </div>
  );
}
