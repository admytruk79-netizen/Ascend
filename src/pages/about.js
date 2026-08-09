import { richText, mediaBlock, escapeHtml } from "../layout.js";

export function aboutPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <h1>${escapeHtml(c["about.hero_heading"])}</h1>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="grid grid--2" style="align-items:start;">
      <div>
        <span class="eyebrow">Founder story</span>
        <h2>${escapeHtml(c["about.founder_heading"])}</h2>
        ${richText(c["about.founder_body"])}
      </div>
      ${mediaBlock(c["about.image_founder"], "Founder", "Founder / story photo")}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Team</span>
    <h2>${escapeHtml(c["about.team_heading"])}</h2>
    ${richText(c["about.team_body"])}
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Contact</span>
    <h2>${escapeHtml(c["about.contact_heading"])}</h2>
    ${richText(c["about.contact_body"])}
    <p>
      <a href="mailto:${escapeHtml(c["about.contact_email"])}" class="btn btn--navy">${escapeHtml(c["about.contact_email"])}</a>
      ${c["about.contact_phone"] ? `<span style="margin-left:1rem; font-weight:600;">${escapeHtml(c["about.contact_phone"])}</span>` : ""}
    </p>
  </div>
</section>
`;
}
