import { CSS } from "./styles.js";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/roviq", label: "Roviq" },
  { href: "/station", label: "Roviq Station" },
  { href: "/roviq-x-station", label: "Roviq × Station" },
  { href: "/about", label: "About" }
];

export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Renders a paragraph body that may contain blank-line-separated paragraphs.
export function richText(str) {
  return String(str ?? "")
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

export function renderList(str) {
  const lines = String(str ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return `<ol class="steps">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ol>`;
}

// Renders "VALUE | label" entries (one per line) as a stat-tile grid —
// the pulled-out-of-the-paragraph headline numbers pattern used throughout
// pitch decks: bold sans value, sentence-case label underneath.
export function renderStats(str) {
  const lines = String(str ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return `<div class="stat-grid">${lines
    .map((l) => {
      const idx = l.indexOf("|");
      const value = idx === -1 ? l : l.slice(0, idx).trim();
      const label = idx === -1 ? "" : l.slice(idx + 1).trim();
      return `<div class="stat-tile"><div class="stat-value">${escapeHtml(value)}</div><div class="stat-label">${escapeHtml(label)}</div></div>`;
    })
    .join("")}</div>`;
}

// Renders "Label — rest of line" entries (one per line) as a bulleted list
// with the label bolded, e.g. a competitor benchmark or a glossary.
export function renderBullets(str) {
  const lines = String(str ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return `<ul class="bullets">${lines
    .map((l) => {
      const idx = l.indexOf("—");
      if (idx === -1) return `<li>${escapeHtml(l)}</li>`;
      const label = l.slice(0, idx).trim();
      const rest = l.slice(idx + 1).trim();
      return `<li><strong>${escapeHtml(label)}</strong> — ${escapeHtml(rest)}</li>`;
    })
    .join("")}</ul>`;
}

// An image block backed by a KV-editable URL. Falls back to a labeled
// placeholder so the site always renders something meaningful before an
// admin has supplied a real photo.
export function mediaBlock(url, alt, placeholderLabel) {
  if (url) {
    return `<div class="media"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"></div>`;
  }
  return `<div class="media"><div class="media-placeholder">${escapeHtml(placeholderLabel)}<br><small>Add a real photo URL in /admin</small></div></div>`;
}

// A diagram backed by a real static asset (served from /public via the
// Worker's ASSETS binding) rather than a hand-drawn inline SVG.
export function diagramImage(src, alt, caption) {
  return `<div class="diagram-frame"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy"></div><p class="diagram-caption">${escapeHtml(caption)}</p>`;
}

// A pre-composed branded image (its own baked-in text/signage) shown at
// its native aspect ratio — no object-fit crop-box, so nothing gets cut off.
export function mediaFull(url, alt) {
  if (!url) return "";
  return `<div class="media-full"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"></div>`;
}

export function renderPage({ title, description, activePath, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description || "")}">
<link rel="icon" href="/brand/roviq-icon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<header class="site-header">
  <div class="container">
    <a href="/" class="wordmark"><img src="/brand/roviq-icon.png" alt="" class="wordmark-icon">ROVIQ</a>
    <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">&#9776;</button>
    <nav class="site-nav" id="siteNav">
      ${NAV_LINKS.map(
        (l) => `<a href="${l.href}" class="${l.href === activePath ? "active" : ""}">${l.label}</a>`
      ).join("\n")}
    </nav>
  </div>
</header>
<main>
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <div>&copy; ${new Date().getFullYear()} Roviq. Roviq Station is an independent brand — not affiliated with or licensed by OKKO or SOCAR.</div>
    <div><a href="/about">Contact</a> &middot; <a href="/admin">Admin</a></div>
  </div>
</footer>
<script>
document.getElementById('navToggle').addEventListener('click', function () {
  document.getElementById('siteNav').classList.toggle('open');
});
if ('IntersectionObserver' in window) {
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('main section:not(.hero)').forEach(function (el) {
    revealObserver.observe(el);
  });
} else {
  document.querySelectorAll('main section').forEach(function (el) {
    el.classList.add('is-visible');
  });
}
</script>
</body>
</html>`;
}
