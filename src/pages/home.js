import { richText, mediaBlock, escapeHtml } from "../layout.js";

export function homePage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <span class="eyebrow">${escapeHtml(c["home.eyebrow"])}</span>
    <h1>${escapeHtml(c["home.headline"])}</h1>
    <p class="lead">${escapeHtml(c["home.subheadline"])}</p>
    ${richText(c["home.intro"])}
  </div>
</section>

<section class="split-hero">
  <a href="/qremyn" class="split-card split-card--qremyn">
    <span class="tag">The platform</span>
    <h2>Qremyn</h2>
    <p>${escapeHtml(c["home.qremyn_tagline"])}</p>
    <p>${escapeHtml(c["home.qremyn_body"])}</p>
    <div class="cta-row"><span class="btn btn--gold">Explore the platform &rarr;</span></div>
  </a>
  <a href="/station" class="split-card split-card--station">
    <span class="tag">The physical hub</span>
    <h2>Qremyn Station</h2>
    <p>${escapeHtml(c["home.station_tagline"])}</p>
    <p>${escapeHtml(c["home.station_body"])}</p>
    <div class="cta-row"><span class="btn btn--gold">Explore the station &rarr;</span></div>
  </a>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">The throughline</span>
    <h2>${escapeHtml(c["home.throughline_heading"])}</h2>
    <div class="grid grid--2" style="align-items:center; margin-top:2rem;">
      <div>${richText(c["home.throughline_body"])}
        <div class="cta-row">
          <a href="/qremyn-x-station" class="btn btn--outline">See how they connect &rarr;</a>
        </div>
      </div>
      <div class="grid grid--2" style="gap:1rem;">
        ${mediaBlock(c["home.image_qremyn"], "Qremyn platform", "Dispatch / app mockup photo")}
        ${mediaBlock(c["home.image_station"], "Qremyn Station", "Station forecourt photo")}
      </div>
    </div>
  </div>
</section>
`;
}
