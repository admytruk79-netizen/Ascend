import { richText, mediaBlock, diagramImage, renderBullets, escapeHtml } from "../layout.js";

const SERVICES = [
  { key: "fuel", title: "Fuel", accent: "gold" },
  { key: "ev", title: "EV Charging", accent: "teal" },
  { key: "cafe", title: "Café", accent: "navy" },
  { key: "wine", title: "Wine & Retail", accent: "gold" },
  { key: "wash", title: "Car Wash", accent: "teal" }
];

export function stationPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <div class="grid grid--2" style="align-items:center;">
      <div>
        <span class="eyebrow">${escapeHtml(c["station.hero_eyebrow"])}</span>
        <h1>${escapeHtml(c["station.hero_heading"])}</h1>
        <p class="lead" style="font-family:'Cinzel', serif; color: var(--gold-light); font-size:1.2rem;">${escapeHtml(c["station.tagline"])}</p>
        <p class="lead">${escapeHtml(c["station.hero_sub"])}</p>
      </div>
      ${mediaBlock(c["station.image_hero"], "Roviq Station forecourt", "Station forecourt hero photo")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">The concept</span>
    <h2>${escapeHtml(c["station.concept_heading"])}</h2>
    <div class="grid grid--2" style="align-items:start;">
      <div>${richText(c["station.concept_body"])}</div>
      ${mediaBlock(c["station.image_okko"], "Reference board: OKKO, café hospitality, forecourt, motor court, and swap-station influences", "Reference mood board")}
    </div>
    <div style="margin-top:2rem;">
      ${diagramImage("/diagrams/socar_layout.png", "SOCAR-style premium forecourt reference layout", "Reference model: SOCAR-style premium forecourt — mechanics only, not the brand.")}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Why now</span>
    <h2>${escapeHtml(c["station.market_heading"])}</h2>
    ${richText(c["station.market_body"])}
    <div class="callout">
      <span class="eyebrow">${escapeHtml(c["station.proof_heading"])}</span>
      ${richText(c["station.proof_body"])}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Where Roviq Station fits</span>
    <h2>${escapeHtml(c["station.benchmark_heading"])}</h2>
    ${renderBullets(c["station.benchmark_body"])}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Product &amp; service mix</span>
    <h2>Five services, one visit</h2>
    <div class="grid grid--5">
      ${SERVICES.map(
        (s) => `<div class="card card--accent-${s.accent}">
          <h3>${s.title}</h3>
          <p>${escapeHtml(c[`station.service_${s.key}_body`])}</p>
        </div>`
      ).join("\n")}
    </div>
    <div class="grid grid--3" style="margin-top:2rem;">
      ${mediaBlock(c["station.image_fuel"], "Fuel canopy", "Fuel canopy / forecourt photo")}
      ${mediaBlock(c["station.image_ev"], "EV charging", "EV charging bay photo")}
      ${mediaBlock(c["station.image_cafe"], "Café interior", "Café / wine interior photo")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Site &amp; interior</span>
    <h2>${escapeHtml(c["station.layout_heading"])}</h2>
    ${richText(c["station.layout_body"])}
    <div class="grid grid--2" style="margin-top:1.5rem;">
      ${diagramImage("/diagrams/site_layout.png", "Roviq Station site layout schematic", "Site layout — fuel/EV canopy at the perimeter, café + retail anchoring the center, wash at the rear.")}
      ${diagramImage("/diagrams/interior_layout.png", "Roviq Station interior zoning schematic", "Interior layout — fast lane kept separate from sit-down café flow.")}
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">Market entry</span>
    <h2>${escapeHtml(c["station.portland_heading"])}</h2>
    ${richText(c["station.portland_body"])}
    <div style="margin-top:1.5rem;">
      ${diagramImage("/diagrams/portland_socar_layout.png", "Portland, Oregon entry site layout", "Portland entry path and the regulatory/tax constraints designed into the plan from day one: attendant-pump law, OLCC wine-and-beer-only retail, no state sales tax.")}
    </div>
    ${mediaBlock(c["station.image_portland"], "Portland streetscape", "Portland, Oregon streetscape / coffee culture photo")}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <div class="grid grid--2" style="align-items:start;">
      <div>
        <span class="eyebrow">Planning frame</span>
        <h2>${escapeHtml(c["station.financials_heading"])}</h2>
        ${richText(c["station.financials_body"])}
      </div>
      <div>
        <span class="eyebrow">Named directly</span>
        <h2>${escapeHtml(c["station.risks_heading"])}</h2>
        ${richText(c["station.risks_body"])}
      </div>
    </div>
  </div>
</section>

<section class="section" id="roadmap">
  <div class="container">
    <span class="eyebrow">The roadmap</span>
    <h2>${escapeHtml(c["station.roadmap_heading"])}</h2>
    ${richText(c["station.roadmap_body"])}
    <div style="margin: 1.5rem 0 2rem;">
      ${diagramImage("/diagrams/master_roadmap.png", "Roviq Station master staged roadmap", "Master staged roadmap — Tier 1 core pilot, Tier 2 low-capex layer, Tier 3 moonshot, laid out month by month.")}
    </div>
    <div class="tier-columns">
      <div class="tier tier--1">
        <span class="tier-label">Tier 1 &middot; Core pilot</span>
        <h3>${escapeHtml(c["station.tier1_heading"].replace(/^Tier 1\s*—\s*/, ""))}</h3>
        <p>${escapeHtml(c["station.tier1_body"])}</p>
      </div>
      <div class="tier tier--2">
        <span class="tier-label">Tier 2 &middot; Low-capex layer</span>
        <h3>${escapeHtml(c["station.tier2_heading"].replace(/^Tier 2\s*—\s*/, ""))}</h3>
        <p>${escapeHtml(c["station.tier2_body"])}</p>
      </div>
      <div class="tier tier--3">
        <span class="tier-label">Tier 3 &middot; Moonshot</span>
        <h3>${escapeHtml(c["station.tier3_heading"].replace(/^Tier 3\s*—\s*/, ""))}</h3>
        <p>${escapeHtml(c["station.tier3_body"])}</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Beyond the first site</span>
    <h2>${escapeHtml(c["station.expansion_heading"])} <span class="tag-inline tag-inline--tier3">Tier 3 &middot; Later stage</span></h2>
    ${richText(c["station.expansion_body"])}

    <div class="card card--accent-rust" style="margin-top:2rem;">
      <h3>Motor Court <span class="tag-inline tag-inline--tier3">Tier 3</span></h3>
      <p>${escapeHtml(c["station.expansion_motor_court_body"])}</p>
      ${diagramImage("/diagrams/motor_court_layout.png", "Motor court expansion module layout", "Motor court concept — boutique lodging arranged around the shared forecourt.")}
      ${mediaBlock(c["station.image_motor_court"], "Motor court reference", "Route 66 boutique motor-court revival photo")}
    </div>

    <div class="card card--accent-rust" style="margin-top:1.5rem;">
      <h3>Post Station <span class="tag-inline tag-inline--tier3">Tier 3</span></h3>
      <p>${escapeHtml(c["station.expansion_post_station_body"])}</p>
      ${diagramImage("/diagrams/post_station_layout.png", "Post Station battery-swap module layout", "Post Station concept — a battery-swap bay layered onto the existing forecourt, named for the 19th-century relay stations that swapped a tired horse for a fresh one.")}
      ${mediaBlock(c["station.image_battery_swap"], "Battery swap reference", "NIO / Ample battery-swap station photo")}
    </div>

    <div class="card card--accent-rust" style="margin-top:1.5rem;">
      <h3>Vehicle Relay <span class="tag-inline tag-inline--tier3">Tier 3</span></h3>
      <p>${escapeHtml(c["station.expansion_vehicle_relay_body"])}</p>
      ${diagramImage("/diagrams/vehicle_relay.png", "Vehicle relay concept diagram", "Vehicle relay concept — a corridor of 3+ stations acting as custody hand-off points, logged in Roviq Core.")}
      ${mediaBlock(c["station.image_vehicle_relay"], "Relay station reference", "Relay-station reference — a modern take on the 19th-century post/relay stagecoach stop")}
    </div>
  </div>
</section>
`;
}
