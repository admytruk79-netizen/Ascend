import { richText, renderList, renderBullets, mediaBlock, escapeHtml } from "../layout.js";

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
    <span class="eyebrow">How it works</span>
    <h2>${escapeHtml(c["roviq.dispatch_heading"])}</h2>
    <div class="grid grid--2" style="align-items:start;">
      <div>
        ${richText(c["roviq.dispatch_body"])}
        ${renderList(c["roviq.dispatch_steps"])}
      </div>
      ${mediaBlock(c["roviq.dispatch_image"], "Roviq dispatch flow", "Dispatch map / routing UI mockup")}
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
    <span class="eyebrow">${escapeHtml(c["roviq.assetlight_heading"])}</span>
    <h2>The same shape as Uber — without owning the fleet</h2>
    ${renderBullets(c["roviq.assetlight_body"])}
    <p class="pullquote">&ldquo;${escapeHtml(c["roviq.pullquote"])}&rdquo;</p>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">How Roviq makes money</span>
    <h2>${escapeHtml(c["roviq.revenue_heading"])}</h2>
    ${richText(c["roviq.revenue_body"])}
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">The opportunity</span>
    <h2>${escapeHtml(c["roviq.market_heading"])}</h2>
    ${richText(c["roviq.market_body"])}
    <div class="callout">
      <span class="eyebrow">${escapeHtml(c["roviq.whynow_heading"])}</span>
      ${renderBullets(c["roviq.whynow_body"])}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">A distinct product line</span>
    <h2>${escapeHtml(c["roviq.dealership_heading"])}</h2>
    ${richText(c["roviq.dealership_body"])}
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Not one borrowed model — six, recombined</span>
    <h2>${escapeHtml(c["roviq.playbook_heading"])}</h2>
    ${renderBullets(c["roviq.playbook_body"])}
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">Why this works</span>
    <h2>${escapeHtml(c["roviq.competitors_heading"])}</h2>
    ${richText(c["roviq.competitors_body"])}
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">How it's actually built</span>
    <h2>${escapeHtml(c["roviq.stack_heading"])}</h2>
    ${renderBullets(c["roviq.stack_body"])}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Investment case</span>
    <h2>${escapeHtml(c["roviq.ask_heading"])}</h2>
    ${richText(c["roviq.ask_body"])}
    <div class="grid grid--2" style="margin-top:1.5rem; align-items:start;">
      <div>
        <h3>Use of funds</h3>
        ${renderBullets(c["roviq.ask_funds"])}
      </div>
      <div>
        <h3>Milestones this unlocks</h3>
        ${renderBullets(c["roviq.ask_milestones"])}
      </div>
    </div>
  </div>
</section>
`;
}
