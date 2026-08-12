import { richText, escapeHtml } from "../layout.js";

export function aboutPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <h1>${escapeHtml(c["about.hero_heading"])}</h1>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Founder story</span>
    <h2>${escapeHtml(c["about.founder_heading"])}</h2>
    ${richText(c["about.founder_body"])}
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

    <form id="contactForm" style="max-width:32rem; margin-top:2rem;">
      <div class="admin-field">
        <label for="cf-name">Name</label>
        <input type="text" id="cf-name" name="name" required>
      </div>
      <div class="admin-field">
        <label for="cf-email">Your email</label>
        <input type="email" id="cf-email" name="email" required>
      </div>
      <div class="admin-field">
        <label for="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows="5" required></textarea>
      </div>
      <button type="submit" class="btn btn--navy">Send</button>
      <p id="cf-fallback" style="font-size:0.85rem; color:#666; margin-top:0.75rem; display:none;">
        Your device didn't open a mail app. Email us directly at
        <a href="mailto:${escapeHtml(c["about.contact_email"])}">${escapeHtml(c["about.contact_email"])}</a>.
      </p>
    </form>
    <noscript>
      <p style="margin-top:1.5rem;">This form needs JavaScript to open your mail client. Email us directly at
        <a href="mailto:${escapeHtml(c["about.contact_email"])}">${escapeHtml(c["about.contact_email"])}</a>.
      </p>
    </noscript>
  </div>
</section>

<script>
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();
    var subject = encodeURIComponent('Message from ' + name + ' via the Qremyn site');
    var body = encodeURIComponent(message + '\\n\\n— ' + name + ' (' + email + ')');
    window.location.href = ${JSON.stringify(`mailto:${c["about.contact_email"]}`)} + '?subject=' + subject + '&body=' + body;
    document.getElementById('cf-fallback').style.display = 'block';
  });
})();
</script>
`;
}
