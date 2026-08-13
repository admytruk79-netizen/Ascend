import { richText, escapeHtml } from "../layout.js";

const TIEINS = [
  { key: "tow", title: "Tow dispatch staging point", accent: "navy" },
  { key: "parts", title: "Parts-locker pickup", accent: "gold" },
  { key: "diagnostic", title: "Diagnostic drop-off + café wait", accent: "teal" },
  { key: "custody", title: "ROVIC vehicle custody hand-off", accent: "rust" }
];

export function connectionPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <span class="eyebrow">${escapeHtml(c["connection.hero_eyebrow"])}</span>
    <h1>${escapeHtml(c["connection.hero_heading"])}</h1>
    <p class="lead">${escapeHtml(c["connection.hero_sub"])}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>${escapeHtml(c["connection.parallel_heading"])}</h2>
    ${richText(c["connection.parallel_body"])}
    <div class="grid grid--2" style="margin-top:2rem;">
      <div class="card card--accent-navy">
        <span class="eyebrow">Digital</span>
        <h3>Qremyn Core</h3>
        <p>One backend routes every job — tow, diagnostic, parts — to the right role-based front end in real time.</p>
      </div>
      <div class="card card--accent-teal">
        <span class="eyebrow">Physical</span>
        <h3>Qremyn Station</h3>
        <p>One hub routes every visitor — fuel, EV, café, retail, wash — to the right service under one roof.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">On the ground</span>
    <h2>What this looks like in practice</h2>
    <div class="grid grid--2">
      ${TIEINS.map(
        (t) => `<div class="card card--accent-${t.accent}" style="background:#fff;">
          <h3>${t.title}</h3>
          <p>${escapeHtml(c[`connection.tiein_${t.key}_body`])}</p>
        </div>`
      ).join("\n")}
    </div>
  </div>
</section>
`;
}
