// content/station-images.js
// Single source of truth for /station image placement.
// Every section pulls its image from here — no inline <img> tags anywhere else.

export const STATION_IMAGES = {
  "hero-forecourt": {
    file: "/photos/qremyn_forecourt_flagship.png",   // Qremyn-branded flagship forecourt exterior at dusk
    alt: "Qremyn Station forecourt at dusk",
    section: "Hero / top of page",
  },
  "forecourt-secondary": {
    file: "/photos/qremyn_forecourt_design_language.png", // multi-angle forecourt + design-language reference sheet
    alt: "Qremyn Station pump islands and canopy",
    section: "Concept section, secondary forecourt shot",
  },
  "ev-charging": {
    file: "/photos/qremyn_forecourt_lounge.png",     // forecourt w/ teal-accented EV charging stalls, lounge seating
    alt: "Qremyn Station EV charging bay",
    section: "Product mix — EV charging subsection",
  },
  "interior-cafe": {
    file: "/photos/qremyn_coffee_interior.png",       // Qremyn Coffee interior, Krays Coffee reference
    alt: "Qremyn Station café and market interior",
    section: "Interior zoning section, below interior_layout.png diagram",
  },
  "motorcourt": {
    file: "/photos/qremyn_motorcourt_reference.png",  // "MOTORCOURT REFERENCE", boutique motor-lodge revival
    alt: "Qremyn Motorcourt boutique lodging",
    section: "Motor Court module (Tier 3) ONLY",
  },
  "swap-station": {
    file: "/photos/qremyn_swap_station.png",          // "QREMYN SWAP STATION", 5-step DRIVE IN/ALIGN/RELEASE/SWAP/OUT
    alt: "Qremyn Swap Station battery swap bay",
    section: "Post Station battery swap (Tier 3) ONLY",
  },
  "relay-station": {
    file: "/photos/qremyn_relay_station.png",         // "QREMYN RELAY STATION", ARRIVE/PREPARE/SWAP/CONTINUE/LOUNGE
    alt: "Qremyn Relay Station vehicle swap",
    section: "Vehicle relay (Tier 3) ONLY",
  },
  // Composite reference board (5-panel grid w/ real competitor branding) — INTERNAL REFERENCE
  // ONLY, never imported on the public site. Kept at /photos/qremyn_reference_board.png for
  // internal use; deliberately has no key wired into any public page.
};
