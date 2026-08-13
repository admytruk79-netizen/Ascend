import { richText, renderList, renderBullets, renderStats, mediaBlock, escapeHtml } from "../layout.js";

const FRONT_ENDS = [
  { key: "customer", title: "Customer App", accent: "navy" },
  { key: "diagnostic", title: "Diagnostic App", accent: "teal" },
  { key: "shop", title: "Shop Partner App", accent: "gold" },
  { key: "vendor", title: "Parts Vendor App", accent: "navy" },
  { key: "tow", title: "Tow Truck App", accent: "teal" }
];

export function qremynPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <div class="grid grid--2" style="align-items:center;">
      <div>
        <span class="eyebrow">${escapeHtml(c["qremyn.hero_eyebrow"])}</span>
        <h1>${escapeHtml(c["qremyn.hero_heading"])}</h1>
        <p class="lead">${escapeHtml(c["qremyn.hero_sub"])}</p>
      </div>
      <div style="text-align:center;">
        <img src="/brand/qremyn-lockup.png" alt="Qremyn — Auto repair, made simple." style="max-width:280px; width:100%; margin:0 auto; border-radius:12px;">
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>${escapeHtml(c["qremyn.core_heading"])}</h2>
    ${richText(c["qremyn.core_body"])}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">How it works</span>
    <h2>${escapeHtml(c["qremyn.dispatch_heading"])}</h2>
    <div class="grid grid--2" style="align-items:start;">
      <div>
        ${richText(c["qremyn.dispatch_body"])}
        ${renderList(c["qremyn.dispatch_steps"])}
      </div>
      ${mediaBlock(c["qremyn.dispatch_image"], "Qremyn dispatch flow", "Dispatch map / routing UI mockup")}
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
          <p>${escapeHtml(c[`qremyn.frontend_${f.key}_body`])}</p>
        </div>`
      ).join("\n")}
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">${escapeHtml(c["qremyn.assetlight_heading"])}</span>
    <h2>The same shape as Uber — without owning the fleet</h2>
    ${renderBullets(c["qremyn.assetlight_body"])}
    <p class="pullquote">&ldquo;${escapeHtml(c["qremyn.pullquote"])}&rdquo;</p>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">How Qremyn makes money</span>
    <h2>${escapeHtml(c["qremyn.revenue_heading"])}</h2>
    ${renderStats(c["qremyn.revenue_stats"])}
    ${richText(c["qremyn.revenue_body"])}
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">The opportunity</span>
    <h2>${escapeHtml(c["qremyn.market_heading"])}</h2>
    ${renderStats(c["qremyn.market_stats"])}
    ${richText(c["qremyn.market_body"])}
    <div class="callout">
      <span class="eyebrow">${escapeHtml(c["qremyn.whynow_heading"])}</span>
      ${renderBullets(c["qremyn.whynow_body"])}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">A distinct product line</span>
    <h2>${escapeHtml(c["qremyn.dealership_heading"])}</h2>
    ${richText(c["qremyn.dealership_body"])}
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Not one borrowed model — six, recombined</span>
    <h2>${escapeHtml(c["qremyn.playbook_heading"])}</h2>
    ${renderBullets(c["qremyn.playbook_body"])}
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">Why this works</span>
    <h2>${escapeHtml(c["qremyn.competitors_heading"])}</h2>
    ${richText(c["qremyn.competitors_body"])}
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">How it's actually built</span>
    <h2>${escapeHtml(c["qremyn.stack_heading"])}</h2>
    ${renderBullets(c["qremyn.stack_body"])}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Investment case</span>
    <h2>${escapeHtml(c["qremyn.ask_heading"])}</h2>
    ${renderStats(c["qremyn.ask_stats"])}
    ${richText(c["qremyn.ask_body"])}
    <div class="grid grid--2" style="margin-top:1.5rem; align-items:start;">
      <div>
        <h3>Use of funds</h3>
        ${renderBullets(c["qremyn.ask_funds"])}
      </div>
      <div>
        <h3>Milestones this unlocks</h3>
        ${renderBullets(c["qremyn.ask_milestones"])}
      </div>
    </div>
  </div>
</section>
`;
}
