// Inline SVG schematic diagrams for Roviq Station.
//
// The brief for this site referenced eight already-built PNG diagrams
// (site_layout.png, interior_layout.png, socar_layout.png,
// portland_socar_layout.png, motor_court_layout.png, post_station_layout.png,
// vehicle_relay.png, master_roadmap.png). No such image files were provided
// in this repository, so rather than inventing fake image URLs, each one is
// rebuilt here as a real, legible inline SVG schematic covering the same
// content. Swap any of these out for a photographed/designed PNG later by
// editing this file — the layout below (labels, tiers, spatial relationships)
// reflects the site map's descriptions.

const label = (x, y, text, opts = {}) => {
  const { size = 13, weight = 600, fill = "var(--ink)", anchor = "middle" } = opts;
  return `<text x="${x}" y="${y}" font-family="Inter, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${text}</text>`;
};

export function siteLayoutDiagram() {
  return `<svg viewBox="0 0 820 480" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="820" height="480" fill="#F3EEDF" />
  <rect x="20" y="20" width="780" height="440" rx="10" fill="#fff" stroke="var(--line)" />
  ${label(410, 45, "ROVIQ STATION — SITE LAYOUT (TOP DOWN)", { size: 15, weight: 700, fill: "var(--navy)" })}

  <!-- Perimeter road -->
  <rect x="45" y="65" width="730" height="390" rx="6" fill="none" stroke="#C9C2A8" stroke-width="14" stroke-dasharray="2 14" stroke-linecap="round"/>
  ${label(90, 445, "ENTRY", { size: 11, fill: "#8a7f5f" })}
  ${label(760, 90, "EXIT", { size: 11, fill: "#8a7f5f" })}

  <!-- Fuel canopy -->
  <rect x="90" y="110" width="260" height="90" rx="6" fill="var(--gold)" opacity="0.25" stroke="var(--gold)" stroke-width="2"/>
  ${label(220, 100, "FUEL CANOPY", { weight: 700, fill: "var(--navy)" })}
  <rect x="115" y="140" width="30" height="40" fill="var(--navy)"/>
  <rect x="175" y="140" width="30" height="40" fill="var(--navy)"/>
  <rect x="235" y="140" width="30" height="40" fill="var(--navy)"/>
  <rect x="295" y="140" width="30" height="40" fill="var(--navy)"/>
  ${label(220, 195, "4 fueling islands", { size: 11, fill: "#555" })}

  <!-- EV bays -->
  <rect x="90" y="220" width="260" height="80" rx="6" fill="var(--teal)" opacity="0.18" stroke="var(--teal)" stroke-width="2"/>
  ${label(220, 213, "EV FAST-CHARGE BAYS", { weight: 700, fill: "var(--teal)" })}
  <rect x="115" y="245" width="26" height="34" fill="var(--teal)"/>
  <rect x="160" y="245" width="26" height="34" fill="var(--teal)"/>
  <rect x="205" y="245" width="26" height="34" fill="var(--teal)"/>
  <rect x="250" y="245" width="26" height="34" fill="var(--teal)"/>
  <rect x="295" y="245" width="26" height="34" fill="var(--teal)"/>

  <!-- Central building -->
  <rect x="400" y="120" width="260" height="220" rx="8" fill="var(--navy)" opacity="0.92"/>
  ${label(530, 155, "CAFÉ + WINE/RETAIL", { size: 15, weight: 700, fill: "#fff" })}
  ${label(530, 180, "central building — anchors foot traffic", { size: 11, fill: "#D9E2F3" })}
  <rect x="425" y="200" width="90" height="60" rx="4" fill="rgba(255,255,255,0.12)"/>
  ${label(470, 233, "Café seating", { size: 11, fill: "#fff" })}
  <rect x="545" y="200" width="90" height="60" rx="4" fill="rgba(255,255,255,0.12)"/>
  ${label(590, 233, "Wine / retail", { size: 11, fill: "#fff" })}
  <rect x="425" y="275" width="210" height="45" rx="4" fill="rgba(201,162,39,0.25)" stroke="var(--gold)"/>
  ${label(530, 302, "Shared counter / single queue", { size: 11, fill: "#fff" })}

  <!-- Wash at rear -->
  <rect x="420" y="365" width="180" height="70" rx="6" fill="var(--rust)" opacity="0.2" stroke="var(--rust)" stroke-width="2"/>
  ${label(510, 358, "CAR WASH (rear)", { weight: 700, fill: "var(--rust)" })}

  <!-- flow arrows -->
  <path d="M350 160 L400 200" stroke="#8a7f5f" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
  <path d="M350 260 L400 240" stroke="#8a7f5f" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
  <path d="M530 340 L510 365" stroke="#8a7f5f" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#8a7f5f"/>
    </marker>
  </defs>
</svg>`;
}

export function interiorLayoutDiagram() {
  return `<svg viewBox="0 0 820 420" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="820" height="420" fill="#fff"/>
  <rect x="20" y="20" width="780" height="380" rx="8" fill="#F8F5EA" stroke="var(--line)"/>
  ${label(410, 48, "INTERIOR LAYOUT — ONE COUNTER, ONE QUEUE, MULTIPLE LINES", { size: 14, weight: 700, fill: "var(--navy)" })}

  <!-- Entrance -->
  ${label(75, 90, "ENTRANCE", { size: 11, weight: 700, fill: "var(--teal)" })}
  <path d="M60 100 L60 200" stroke="var(--teal)" stroke-width="3" marker-end="url(#arrow2)"/>

  <!-- Queue path -->
  <path d="M60 200 L400 200 L400 260" stroke="#C9C2A8" stroke-width="10" fill="none" stroke-linecap="round"/>
  ${label(230, 190, "single guided queue", { size: 11, fill: "#8a7f5f" })}

  <!-- Counter -->
  <rect x="330" y="255" width="160" height="45" rx="4" fill="var(--gold)" opacity="0.3" stroke="var(--gold)" stroke-width="2"/>
  ${label(410, 283, "SHARED COUNTER", { weight: 700, fill: "var(--navy)", size: 12 })}

  <!-- Café seating -->
  <rect x="80" y="230" width="200" height="130" rx="6" fill="var(--navy)" opacity="0.08" stroke="var(--navy)"/>
  ${label(180, 222, "CAFÉ SEATING", { weight: 700, fill: "var(--navy)" })}
  <circle cx="130" cy="280" r="14" fill="var(--navy)" opacity="0.5"/>
  <circle cx="190" cy="280" r="14" fill="var(--navy)" opacity="0.5"/>
  <circle cx="250" cy="280" r="14" fill="var(--navy)" opacity="0.5"/>
  <circle cx="130" cy="330" r="14" fill="var(--navy)" opacity="0.5"/>
  <circle cx="190" cy="330" r="14" fill="var(--navy)" opacity="0.5"/>

  <!-- Wine / retail -->
  <rect x="540" y="90" width="220" height="180" rx="6" fill="var(--teal)" opacity="0.1" stroke="var(--teal)"/>
  ${label(650, 82, "WINE / CURATED RETAIL", { weight: 700, fill: "var(--teal)" })}
  <rect x="565" y="115" width="170" height="18" fill="var(--teal)" opacity="0.4"/>
  <rect x="565" y="145" width="170" height="18" fill="var(--teal)" opacity="0.4"/>
  <rect x="565" y="175" width="170" height="18" fill="var(--teal)" opacity="0.4"/>
  <rect x="565" y="205" width="170" height="18" fill="var(--teal)" opacity="0.4"/>
  ${label(650, 250, "shelving faces the queue path", { size: 11, fill: "#555" })}

  <!-- Restrooms / back of house -->
  <rect x="540" y="290" width="220" height="90" rx="6" fill="#eee" stroke="var(--line)"/>
  ${label(650, 340, "Restrooms / back of house", { size: 12, fill: "#555" })}

  <path d="M490 278 L540 200" stroke="#8a7f5f" stroke-width="2" marker-end="url(#arrow2)" fill="none"/>
  <path d="M400 300 L280 310" stroke="#8a7f5f" stroke-width="2" marker-end="url(#arrow2)" fill="none"/>
  <defs>
    <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#8a7f5f"/>
    </marker>
  </defs>
</svg>`;
}

export function socarLayoutDiagram() {
  return `<svg viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="820" height="360" fill="#fff"/>
  <rect x="20" y="20" width="780" height="320" rx="8" fill="#F8F5EA" stroke="var(--line)"/>
  ${label(410, 48, "REFERENCE MODEL — SOCAR-STYLE PREMIUM FORECOURT", { size: 14, weight: 700, fill: "var(--navy)" })}
  ${label(410, 68, "(strategic reference only — Roviq Station is an independent brand)", { size: 11, weight: 500, fill: "#8a7f5f" })}

  <rect x="90" y="110" width="280" height="90" rx="6" fill="var(--gold)" opacity="0.2" stroke="var(--gold)" stroke-width="2"/>
  ${label(230, 100, "PREMIUM FUEL CANOPY", { weight: 700, fill: "var(--navy)" })}
  <rect x="115" y="140" width="26" height="40" fill="var(--navy)"/>
  <rect x="165" y="140" width="26" height="40" fill="var(--navy)"/>
  <rect x="215" y="140" width="26" height="40" fill="var(--navy)"/>
  <rect x="265" y="140" width="26" height="40" fill="var(--navy)"/>
  <rect x="315" y="140" width="26" height="40" fill="var(--navy)"/>

  <rect x="430" y="120" width="300" height="150" rx="6" fill="var(--navy)" opacity="0.9"/>
  ${label(580, 155, "COMPACT KIOSK", { weight: 700, fill: "#fff" })}
  ${label(580, 178, "minimal retail, brand-forward fuel focus", { size: 11, fill: "#D9E2F3" })}

  ${label(410, 320, "Takeaway: premium positioning + acquisition-led rollout, not the food/retail depth of OKKO", { size: 12, fill: "#555" })}
</svg>`;
}

export function portlandSocarLayoutDiagram() {
  return `<svg viewBox="0 0 820 420" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="820" height="420" fill="#fff"/>
  <rect x="20" y="20" width="780" height="380" rx="8" fill="#F8F5EA" stroke="var(--line)"/>
  ${label(410, 48, "PORTLAND, OREGON ENTRY — SOCAR-STYLE ACQUISITION PATH", { size: 14, weight: 700, fill: "var(--navy)" })}

  <rect x="60" y="90" width="180" height="70" rx="6" fill="#eee" stroke="var(--line)"/>
  ${label(150, 130, "Existing site", { weight: 700 })}
  ${label(150, 148, "acquired / converted", { size: 11, fill: "#555" })}
  <path d="M240 125 L320 125" stroke="var(--gold)" stroke-width="3" marker-end="url(#arrow3)"/>
  <rect x="325" y="90" width="180" height="70" rx="6" fill="var(--gold)" opacity="0.25" stroke="var(--gold)"/>
  ${label(415, 122, "Converted to", { weight: 700, fill: "var(--navy)" })}
  ${label(415, 142, "Roviq Station format", { size: 11, fill: "var(--navy)" })}
  <path d="M505 125 L585 125" stroke="var(--gold)" stroke-width="3" marker-end="url(#arrow3)"/>
  <rect x="590" y="90" width="170" height="70" rx="6" fill="var(--teal)" opacity="0.2" stroke="var(--teal)"/>
  ${label(675, 122, "Faster time to", { weight: 700, fill: "var(--teal)" })}
  ${label(675, 142, "open vs. ground-up build", { size: 11, fill: "var(--teal)" })}

  <!-- constraints -->
  ${label(410, 210, "OPERATING CONSTRAINTS BUILT INTO THE PLAN", { weight: 700, fill: "var(--navy)", size: 13 })}

  <rect x="55" y="230" width="230" height="110" rx="6" fill="#fff" stroke="var(--rust)" stroke-width="1.5"/>
  ${label(170, 255, "Attendant-pump law", { weight: 700, size: 12 })}
  ${label(170, 278, "staffing designed for", { size: 11, fill: "#555" })}
  ${label(170, 295, "assisted fueling from day one", { size: 11, fill: "#555" })}

  <rect x="300" y="230" width="230" height="110" rx="6" fill="#fff" stroke="var(--rust)" stroke-width="1.5"/>
  ${label(415, 255, "OLCC retail rule", { weight: 700, size: 12 })}
  ${label(415, 278, "wine + beer only,", { size: 11, fill: "#555" })}
  ${label(415, 295, "no spirits on-site", { size: 11, fill: "#555" })}

  <rect x="545" y="230" width="220" height="110" rx="6" fill="#fff" stroke="var(--teal)" stroke-width="1.5"/>
  ${label(655, 255, "No state sales tax", { weight: 700, size: 12 })}
  ${label(655, 278, "modest margin/pricing", { size: 11, fill: "#555" })}
  ${label(655, 295, "edge on retail & food", { size: 11, fill: "#555" })}

  <defs>
    <marker id="arrow3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="var(--gold)"/>
    </marker>
  </defs>
</svg>`;
}

export function masterRoadmapDiagram() {
  return `<svg viewBox="0 0 900 380" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="900" height="380" fill="#fff"/>
  ${label(450, 34, "MASTER STAGED ROADMAP", { size: 16, weight: 700, fill: "var(--navy)" })}

  <line x1="60" y1="200" x2="840" y2="200" stroke="#C9C2A8" stroke-width="4"/>

  <!-- Tier 1 -->
  <circle cx="140" cy="200" r="12" fill="var(--navy)"/>
  <rect x="50" y="230" width="180" height="120" rx="8" fill="var(--navy)"/>
  ${label(140, 255, "TIER 1", { size: 12, weight: 800, fill: "var(--gold-light)" })}
  ${label(140, 278, "Core pilot", { size: 13, weight: 700, fill: "#fff" })}
  ${label(140, 300, "Fuel · EV · Café", { size: 11, fill: "#D9E2F3" })}
  ${label(140, 318, "Wine/Retail · Wash", { size: 11, fill: "#D9E2F3" })}
  ${label(140, 336, "first funded site", { size: 10, fill: "#9fb0d0" })}

  <!-- Tier 2 -->
  <circle cx="450" cy="200" r="12" fill="var(--teal)"/>
  <rect x="360" y="230" width="180" height="120" rx="8" fill="var(--teal)"/>
  ${label(450, 255, "TIER 2", { size: 12, weight: 800, fill: "#dff5f2" })}
  ${label(450, 278, "Low-capex layer", { size: 13, weight: 700, fill: "#fff" })}
  ${label(450, 300, "Loyalty · added", { size: 11, fill: "#E2F5F2" })}
  ${label(450, 318, "charging · retail SKUs", { size: 11, fill: "#E2F5F2" })}
  ${label(450, 336, "added to a live site", { size: 10, fill: "#bfe8e4" })}

  <!-- Tier 3 -->
  <circle cx="760" cy="200" r="12" fill="var(--rust)"/>
  <rect x="670" y="230" width="180" height="120" rx="8" fill="var(--rust)"/>
  ${label(760, 255, "TIER 3", { size: 12, weight: 800, fill: "#fbe9db" })}
  ${label(760, 278, "Moonshot", { size: 13, weight: 700, fill: "#fff" })}
  ${label(760, 300, "Motor court · Post", { size: 11, fill: "#FBE9DB" })}
  ${label(760, 318, "Station · Vehicle relay", { size: 11, fill: "#FBE9DB" })}
  ${label(760, 336, "concept, not committed", { size: 10, fill: "#efc9ab" })}

  ${label(140, 175, "now", { size: 11, weight: 700, fill: "var(--navy)" })}
  ${label(450, 175, "next", { size: 11, weight: 700, fill: "var(--teal)" })}
  ${label(760, 175, "later", { size: 11, weight: 700, fill: "var(--rust)" })}
</svg>`;
}

export function motorCourtLayoutDiagram() {
  return `<svg viewBox="0 0 820 380" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="820" height="380" fill="#fff"/>
  <rect x="20" y="20" width="780" height="340" rx="8" fill="#FBF1E8" stroke="var(--rust)" stroke-opacity="0.3"/>
  ${label(410, 48, "TIER 3 — MOTOR COURT (BOUTIQUE LODGING CONCEPT)", { size: 14, weight: 700, fill: "var(--rust)" })}

  <!-- courtyard -->
  <rect x="300" y="140" width="220" height="120" rx="6" fill="var(--rust)" opacity="0.12" stroke="var(--rust)"/>
  ${label(410, 205, "Shared courtyard", { weight: 700, fill: "var(--rust)" })}
  ${label(410, 225, "faces the forecourt", { size: 11, fill: "#8a5a3a" })}

  <!-- row of units left -->
  ${[0, 1, 2].map((i) => `<rect x="${90 + i * 70}" y="150" width="55" height="100" rx="4" fill="var(--rust)" opacity="0.35"/>`).join("")}
  ${label(200, 270, "Restored motor-court units", { size: 11, fill: "#8a5a3a" })}

  <!-- row of units right -->
  ${[0, 1, 2].map((i) => `<rect x="${640 + i * 30}" y="150" width="24" height="100" rx="4" fill="var(--rust)" opacity="0.35"/>`).join("")}
  ${label(680, 270, "Extendable rows", { size: 11, fill: "#8a5a3a" })}

  <!-- forecourt connection -->
  <rect x="300" y="300" width="220" height="35" rx="4" fill="var(--gold)" opacity="0.25" stroke="var(--gold)"/>
  ${label(410, 322, "Fuel / EV / café forecourt (Tier 1)", { size: 11, weight: 700, fill: "var(--navy)" })}
  <path d="M410 260 L410 300" stroke="#8a7f5f" stroke-width="2" marker-end="url(#arrow4)"/>
  <defs><marker id="arrow4" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#8a7f5f"/></marker></defs>
</svg>`;
}

export function postStationLayoutDiagram() {
  return `<svg viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="820" height="360" fill="#fff"/>
  <rect x="20" y="20" width="780" height="320" rx="8" fill="#FBF1E8" stroke="var(--rust)" stroke-opacity="0.3"/>
  ${label(410, 48, 'TIER 3 — "POST STATION" (BATTERY SWAP LAYER)', { size: 14, weight: 700, fill: "var(--rust)" })}
  ${label(410, 68, "inspired by NIO and Ample battery-swap infrastructure", { size: 11, fill: "#8a5a3a" })}

  <!-- entry lane -->
  <path d="M60 200 L250 200" stroke="#C9C2A8" stroke-width="10" stroke-linecap="round"/>
  ${label(150, 185, "Vehicle enters swap lane", { size: 11, fill: "#555" })}

  <!-- swap bay -->
  <rect x="260" y="150" width="150" height="100" rx="8" fill="var(--rust)" opacity="0.25" stroke="var(--rust)" stroke-width="2"/>
  ${label(335, 140, "SWAP BAY", { weight: 700, fill: "var(--rust)" })}
  <rect x="300" y="185" width="70" height="30" rx="3" fill="var(--rust)"/>
  ${label(335, 205, "depleted pack out", { size: 9, fill: "#fff" })}

  <path d="M410 200 L470 200" stroke="var(--gold)" stroke-width="3" marker-end="url(#arrow5)"/>

  <!-- battery rack -->
  <rect x="480" y="120" width="120" height="160" rx="6" fill="var(--navy)" opacity="0.1" stroke="var(--navy)"/>
  ${label(540, 112, "CHARGED PACK RACK", { weight: 700, fill: "var(--navy)", size: 12 })}
  ${[0, 1, 2, 3].map((i) => `<rect x="500" y="${140 + i * 32}" width="80" height="22" rx="3" fill="var(--navy)" opacity="0.4"/>`).join("")}

  <path d="M600 200 L660 200" stroke="var(--teal)" stroke-width="3" marker-end="url(#arrow5)"/>
  <path d="M660 200 L660 250 L740 250" stroke="var(--teal)" stroke-width="3" marker-end="url(#arrow5)" fill="none"/>
  ${label(700, 240, "vehicle exits", { size: 11, fill: "var(--teal)" })}
  ${label(700, 268, "in minutes, not a charge cycle", { size: 10, fill: "#555" })}

  <defs><marker id="arrow5" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#8a7f5f"/></marker></defs>
</svg>`;
}

export function vehicleRelayDiagram() {
  return `<svg viewBox="0 0 820 400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="820" height="400" fill="#fff"/>
  <rect x="20" y="20" width="780" height="360" rx="8" fill="#FBF1E8" stroke="var(--rust)" stroke-opacity="0.3"/>
  ${label(410, 48, "TIER 3 — VEHICLE RELAY (STATION NETWORK AS CUSTODY POINTS)", { size: 13, weight: 700, fill: "var(--rust)" })}

  <circle cx="140" cy="150" r="14" fill="var(--navy)"/>
  ${label(140, 120, "Origin", { weight: 700, size: 12 })}
  ${label(140, 190, "Roviq Station A", { size: 11, fill: "#555" })}

  <circle cx="410" cy="250" r="16" fill="var(--rust)"/>
  ${label(410, 215, "Custody hand-off", { weight: 700, size: 12, fill: "var(--rust)" })}
  ${label(410, 290, "ROVIC relay point", { size: 11, fill: "#8a5a3a" })}

  <circle cx="680" cy="150" r="14" fill="var(--teal)"/>
  ${label(680, 120, "Destination", { weight: 700, size: 12, fill: "var(--teal)" })}
  ${label(680, 190, "Roviq Station B", { size: 11, fill: "#555" })}

  <path d="M154 158 L400 245" stroke="var(--navy)" stroke-width="2.5" stroke-dasharray="6 5" fill="none" marker-end="url(#arrow6)"/>
  <path d="M420 245 L668 158" stroke="var(--teal)" stroke-width="2.5" stroke-dasharray="6 5" fill="none" marker-end="url(#arrow6)"/>

  ${label(410, 340, "Vehicle formally changes hands at a mapped station, logged in Roviq Core", { size: 12, fill: "#555" })}
  <defs><marker id="arrow6" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#888"/></marker></defs>
</svg>`;
}
