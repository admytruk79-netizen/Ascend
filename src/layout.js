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

// An image block backed by a KV-editable URL. Falls back to a labeled
// placeholder so the site always renders something meaningful before an
// admin has supplied a real photo.
export function mediaBlock(url, alt, placeholderLabel) {
  if (url) {
    return `<div class="media"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"></div>`;
  }
  return `<div class="media"><div class="media-placeholder">${escapeHtml(placeholderLabel)}<br><small>Add a real photo URL in /admin</small></div></div>`;
}

export function diagramFrame(svg, caption) {
  return `<div class="diagram-frame">${svg}</div><p class="diagram-caption">${escapeHtml(caption)}</p>`;
}

export function renderPage({ title, description, activePath, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description || "")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<header class="site-header">
  <div class="container">
    <a href="/" class="wordmark">ROVI<span>Q</span></a>
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
</script>
</body>
</html>`;
}
