// content/station-images.js
// Single source of truth for /station image placement.
// Every section pulls its image from here — no inline <img> tags anywhere else.

export const STATION_IMAGES = {
  "hero-forecourt": {
    file: "/images/roviq-hero-forecourt.png",       // navy canopy, "ROVIQ STATION", FUEL·EV CHARGE·CAFE·MARKET·RESTROOMS sign
    alt: "Qremyn Station forecourt at dusk",
    section: "Hero / top of page",
  },
  "forecourt-secondary": {
    file: "/images/roviq-forecourt-secondary.png",  // "FORECOURT REFERENCE", price board, CAFE·MARKET strip
    alt: "Qremyn Station pump islands and canopy",
    section: "Concept section, secondary forecourt shot",
  },
  "ev-charging": {
    file: "/images/roviq-ev-charging.png",           // EV bay, teal accents, ULTRA FAST DC / 100% RENEWABLE strip
    alt: "Qremyn Station EV charging bay",
    section: "Product mix — EV charging subsection",
  },
  "interior-cafe": {
    file: "/images/roviq-interior-cafe.png",          // coffee bar, grab-and-go, "GOOD FOOD GOOD COFFEE GOOD JOURNEYS"
    alt: "Qremyn Station café and market interior",
    section: "Interior zoning section, below interior_layout.png diagram",
  },
  "motorcourt": {
    file: "/images/roviq-motorcourt.png",             // "MOTORCOURT REFERENCE", courtyard, cars, neon sign
    alt: "Qremyn Motorcourt boutique lodging",
    section: "Motor Court module (Tier 3) ONLY",
  },
  "swap-station": {
    file: "/images/roviq-swap-station.png",           // "ROVIQ SWAP STATION", 5-step DRIVE IN/POSITION/RELEASE/LIFT/OUT
    alt: "Qremyn Swap Station battery swap bay",
    section: "Post Station battery swap (Tier 3) ONLY",
  },
  "relay-station": {
    file: "/images/roviq-relay-station.png",          // "RELAY STATION", BAY 01-03, 6-step HOW IT WORKS
    alt: "Qremyn Relay Station vehicle swap",
    section: "Vehicle relay (Tier 3) ONLY",
  },
  // Composite reference board (5-panel grid w/ real OKKO logo) — INTERNAL REFERENCE ONLY,
  // never imported on the public site. Kept at /images/roviq-reference-composite.png for
  // internal use; deliberately has no key wired into any public page.
};
