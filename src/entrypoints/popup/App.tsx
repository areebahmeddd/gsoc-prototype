import { browser } from "#imports";
import { useEffect, useRef, useState } from "react";
import { PopupStoreRow } from "~/components/popup/PopupStoreRow";

import flagCA from "~/assets/flags/ca.svg";
import flagFR from "~/assets/flags/fr.svg";
import flagIN from "~/assets/flags/in.svg";

import costcoLogo from "~/assets/canada/costco_logo.svg";
import loblawLogo from "~/assets/canada/loblaw_logo.svg";
import metroLogo from "~/assets/canada/metro_logo.svg";
import sobeysLogo from "~/assets/canada/sobeys_logo.svg";
import walmartLogo from "~/assets/canada/walmart_logo.svg";

import auchanLogo from "~/assets/france/auchan_logo.svg";
import carrefourLogo from "~/assets/france/carrefour_logo.svg";
import intermarcheLogo from "~/assets/france/intermarche_logo.svg";
import leclerLogo from "~/assets/france/leclerc_logo.svg";
import monoprixLogo from "~/assets/france/monoprix_logo.svg";

import bigbasketLogo from "~/assets/india/bigbasket_logo.svg";
import blinkitLogo from "~/assets/india/blinkit_logo.svg";
import jiomartLogo from "~/assets/india/jiomart_logo.svg";
import swiggyLogo from "~/assets/india/swiggy_logo.svg";
import zeptoLogo from "~/assets/india/zepto_logo.svg";

type Country = "canada" | "france" | "india";

const COUNTRIES: { value: Country; label: string; flag: string }[] = [
  { value: "canada", label: "Canada", flag: flagCA },
  { value: "france", label: "France", flag: flagFR },
  { value: "india", label: "India", flag: flagIN },
];

interface StoreEntry {
  name: string;
  address: string;
  href: string;
  storageKey: string;
  logoSrc?: string;
  disabledManually?: boolean;
  enabledOverride?: boolean;
}

const STORES_BY_COUNTRY: Record<Country, StoreEntry[]> = {
  canada: [
    {
      name: "Loblaw",
      address: "loblaw.ca",
      href: "https://www.loblaw.ca/",
      storageKey: "loblaw",
      logoSrc: loblawLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Sobeys",
      address: "sobeys.com",
      href: "https://www.sobeys.com/",
      storageKey: "sobeys",
      logoSrc: sobeysLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Metro",
      address: "metro.ca",
      href: "https://www.metro.ca/",
      storageKey: "metro",
      logoSrc: metroLogo,
    },
    {
      name: "Costco",
      address: "costco.ca",
      href: "https://www.costco.ca/",
      storageKey: "costco",
      logoSrc: costcoLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Walmart",
      address: "walmart.ca",
      href: "https://www.walmart.ca/",
      storageKey: "walmart",
      logoSrc: walmartLogo,
    },
  ],
  france: [
    {
      name: "Carrefour",
      address: "carrefour.fr",
      href: "https://www.carrefour.fr/",
      storageKey: "carrefour",
      logoSrc: carrefourLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "E. Leclerc",
      address: "e.leclerc",
      href: "https://www.e.leclerc/",
      storageKey: "leclerc",
      logoSrc: leclerLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Intermarch\u00E9",
      address: "intermarche.com",
      href: "https://www.intermarche.com/",
      storageKey: "intermarche",
      logoSrc: intermarcheLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Auchan",
      address: "auchan.fr",
      href: "https://www.auchan.fr/",
      storageKey: "auchan",
      logoSrc: auchanLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Monoprix",
      address: "monoprix.fr",
      href: "https://www.monoprix.fr/",
      storageKey: "monoprix",
      logoSrc: monoprixLogo,
      disabledManually: true,
      enabledOverride: false,
    },
  ],
  india: [
    {
      name: "BigBasket",
      address: "bigbasket.com",
      href: "https://www.bigbasket.com/",
      storageKey: "bigbasket",
      logoSrc: bigbasketLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Blinkit",
      address: "blinkit.com",
      href: "https://blinkit.com/",
      storageKey: "blinkit",
      logoSrc: blinkitLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Zepto",
      address: "zeptonow.com",
      href: "https://www.zeptonow.com/",
      storageKey: "zepto",
      logoSrc: zeptoLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "JioMart",
      address: "jiomart.com",
      href: "https://www.jiomart.com/",
      storageKey: "jiomart",
      logoSrc: jiomartLogo,
      disabledManually: true,
      enabledOverride: false,
    },
    {
      name: "Swiggy",
      address: "swiggy.com",
      href: "https://www.swiggy.com/instamart",
      storageKey: "swiggy",
      logoSrc: swiggyLogo,
      disabledManually: true,
      enabledOverride: false,
    },
  ],
};

/** Popup root: country selector and per-store enabled/disabled toggles. */
export default function App() {
  const [country, setCountry] = useState<Country>("canada");
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = COUNTRIES.find((c) => c.value === country)!;
  const stores = STORES_BY_COUNTRY[country];

  return (
    <div className="w-full font-sans text-gray-800 bg-white select-none">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <img
            src={browser.runtime.getURL("icon/logo.svg")}
            alt=""
            className="w-8 h-8 flex-shrink-0"
          />
          <p className="text-[14px] font-bold text-gray-900 leading-snug truncate min-w-0">
            Open Food Facts
          </p>
        </div>

        <div className="relative flex-shrink-0" ref={dropRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <img
              src={selected.flag}
              alt={selected.label}
              className="w-4 h-auto rounded-[2px] flex-shrink-0"
            />
            <span className="text-xs font-semibold text-gray-600">
              {selected.label}
            </span>
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {COUNTRIES.filter((c) => c.value !== country).map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    setCountry(c.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors duration-100 text-sm font-semibold text-gray-700"
                >
                  <img
                    src={c.flag}
                    alt={c.label}
                    className="w-4 h-auto rounded-[2px] flex-shrink-0"
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Supported Stores
        </span>
      </div>

      <div className="px-3 pb-3">
        {stores.map((store) => (
          <PopupStoreRow key={store.storageKey} {...store} />
        ))}
      </div>
    </div>
  );
}
