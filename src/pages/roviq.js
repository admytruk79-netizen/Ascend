import { richText, renderList, mediaBlock, escapeHtml } from "../layout.js";

const FRONT_ENDS = [
  { key: "customer", title: "Customer App", accent: "navy" },
  { key: "diagnostic", title: "Diagnostic App", accent: "teal" },
  { key: "shop", title: "Shop Partner App", accent: "gold" },
  { key: "vendor", title: "Parts Vendor App", accent: "navy" },
  { key: "tow", title: "Tow Truck App", accent: "teal" }
];

export function roviqPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <span class="eyebrow">${escapeHtml(c["roviq.hero_eyebrow"])}</span>
    <h1>${escapeHtml(c["roviq.hero_heading"])}</h1>
    <p class="lead">${escapeHtml(c["roviq.hero_sub"])}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>${escapeHtml(c["roviq.core_heading"])}</h2>
    ${richText(c["roviq.core_body"])}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Flagship example</span>
    <h2>${escapeHtml(c["roviq.dispatch_heading"])}</h2>
    <div class="grid grid--2" style="align-items:start;">
      <div>
        ${richText(c["roviq.dispatch_body"])}
        ${renderList(c["roviq.dispatch_steps"])}
      </div>
      ${mediaBlock(c["roviq.dispatch_image"], "Tow dispatch map view", "Dispatch map / routing UI mockup")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">One backend, five doors in</span>
    <h2>Role-based front ends</h2>
    <div class="grid grid--3">
      ${FRONT_ENDS.map(
        (f) => `<div class="card card--accent-${f.accent}">
          <h3>${f.title}</h3>
          <p>${escapeHtml(c[`roviq.frontend_${f.key}_body`])}</p>
        </div>`
      ).join("\n")}
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">Why this works</span>
    <h2>${escapeHtml(c["roviq.playbook_heading"])}</h2>
    ${richText(c["roviq.playbook_body"])}
  </div>
</section>
`;
}
