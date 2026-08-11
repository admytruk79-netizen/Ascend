export const CSS = `
:root {
  --navy: #0B2545;
  --navy-light: #14356e;
  --gold: #C9A227;
  --gold-light: #e0c25a;
  --teal: #0E7C7B;
  --rust: #A85C32;
  --cream: #FAF7F0;
  --ink: #14213D;
  --paper: #FFFFFF;
  --line: #E4DCC8;
  --max: 1180px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--ink);
  background: var(--cream);
  line-height: 1.6;
}
h1, h2, h3, h4, .wordmark {
  font-family: 'Cinzel', Georgia, serif;
  color: var(--navy);
  line-height: 1.25;
  margin: 0 0 0.5em;
}
h1 { font-size: clamp(2.1rem, 4vw, 3.4rem); }
h2 { font-size: clamp(1.6rem, 3vw, 2.3rem); }
h3 { font-size: 1.3rem; }
p { margin: 0 0 1em; }
a { color: var(--teal); }
img { max-width: 100%; display: block; }

.container { max-width: var(--max); margin: 0 auto; padding: 0 1.5rem; }
.section { padding: 4.5rem 0; }
.section--tight { padding: 2.5rem 0; }
.section--navy { background: var(--navy); color: #EAF0FB; }
.section--navy h2, .section--navy h3 { color: #fff; }
.section--cream-alt { background: #F3EEDF; }

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--teal);
  margin-bottom: 0.6em;
  display: inline-block;
}
.section--navy .eyebrow { color: var(--gold-light); }

/* Nav */
.site-header {
  position: sticky; top: 0; z-index: 50;
  background: var(--navy);
  border-bottom: 3px solid var(--gold);
}
.site-header .container {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 0.9rem; padding-bottom: 0.9rem;
}
.wordmark {
  color: #fff; font-size: 1.3rem; text-decoration: none; margin: 0;
  letter-spacing: 0.03em;
  display: inline-flex; align-items: center; gap: 0.5rem;
}
.wordmark span { color: var(--gold); }
.wordmark-icon { width: 28px; height: 28px; border-radius: 7px; display: block; }
nav.site-nav { display: flex; gap: 1.6rem; align-items: center; flex-wrap: wrap; }
nav.site-nav a {
  color: #D9E2F3; text-decoration: none; font-size: 0.92rem; font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0.4rem 0;
  border-bottom: 2px solid transparent;
}
nav.site-nav a:hover, nav.site-nav a.active { color: #fff; border-bottom-color: var(--gold); }
.nav-toggle { display: none; }

/* Hero */
.hero {
  background: linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 55%, #0a1f3d 100%);
  color: #fff;
  padding: 4.5rem 0 3.5rem;
}
.hero p.lead { color: #C9D4EA; font-size: 1.15rem; max-width: 46rem; }
.hero h1 { color: #fff; }

.split-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.split-card {
  padding: 3.5rem 2.5rem;
  display: flex; flex-direction: column; justify-content: center;
  text-decoration: none;
  position: relative;
  transition: filter 0.2s ease;
}
.split-card:hover { filter: brightness(1.06); }
.split-card--roviq { background: var(--navy); color: #fff; }
.split-card--station { background: var(--teal); color: #fff; }
.split-card h2 { color: #fff; }
.split-card .tag {
  display: inline-block; align-self: flex-start;
  background: rgba(255,255,255,0.14); color: #fff;
  padding: 0.3rem 0.8rem; border-radius: 999px;
  font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase;
  margin-top: 1.2rem; font-weight: 700;
}

/* Cards / grids */
.grid { display: grid; gap: 1.75rem; }
.grid--2 { grid-template-columns: repeat(2, 1fr); }
.grid--3 { grid-template-columns: repeat(3, 1fr); }
.grid--5 { grid-template-columns: repeat(5, 1fr); }
.card {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 1.75rem;
}
.card h3 { margin-bottom: 0.5rem; }
.card--accent-navy { border-top: 4px solid var(--navy); }
.card--accent-teal { border-top: 4px solid var(--teal); }
.card--accent-gold { border-top: 4px solid var(--gold); }
.card--accent-rust { border-top: 4px solid var(--rust); }

/* Tier roadmap */
.tier-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; align-items: stretch; }
.tier {
  border-radius: 12px;
  padding: 1.75rem;
  color: #fff;
  display: flex; flex-direction: column;
}
.tier .tier-label {
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(255,255,255,0.2); display: inline-block;
  padding: 0.25rem 0.7rem; border-radius: 999px; margin-bottom: 0.9rem; font-weight: 700;
  align-self: flex-start;
}
.tier h3 { color: #fff; }
.tier--1 { background: linear-gradient(160deg, var(--navy), #0a1f3d); }
.tier--2 { background: linear-gradient(160deg, var(--teal), #0a5453); }
.tier--3 { background: linear-gradient(160deg, var(--rust), #7c4322); }

/* Image placeholder (used until a real URL is set via /admin) */
.media {
  border-radius: 10px; overflow: hidden; background: #E9E2CC;
  border: 1px solid var(--line);
}
.media img { width: 100%; height: 100%; object-fit: cover; }
.media-placeholder {
  aspect-ratio: 4 / 3;
  display: flex; align-items: center; justify-content: center; text-align: center;
  padding: 1.5rem;
  background: repeating-linear-gradient(135deg, #EFE9D8, #EFE9D8 10px, #E7DFC8 10px, #E7DFC8 20px);
  color: #8a7f5f; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.02em;
}

/* Diagram frame */
.diagram-frame {
  background: #fff; border: 1px solid var(--line); border-radius: 10px;
  padding: 1.25rem; overflow-x: auto;
}
.diagram-frame svg, .diagram-frame img { display: block; margin: 0 auto; max-width: 100%; height: auto; }
.diagram-caption { text-align: center; font-size: 0.85rem; color: #555; margin-top: 0.75rem; }

.bullets { list-style: none; margin: 1rem 0 0; padding: 0; }
.bullets li {
  padding-left: 1.3rem; position: relative; margin-bottom: 0.85rem;
}
.bullets li::before {
  content: ""; position: absolute; left: 0; top: 0.55em;
  width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
}
.callout {
  background: #fff; border-left: 4px solid var(--teal);
  border-radius: 6px; padding: 1.5rem; margin-top: 1.5rem;
}
.pullquote {
  font-family: 'Cinzel', serif; font-size: 1.5rem; line-height: 1.4;
  color: var(--gold-light); text-align: center; margin: 2rem auto 0;
  max-width: 40rem; font-style: italic;
}

/* Stat tiles — headline numbers pulled out of paragraphs, pitch-deck style.
   Value is always the sans body face at display size, never the serif. */
.stat-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem; margin-top: 1.5rem;
}
.stat-tile {
  background: #fff; border: 1px solid var(--line); border-left: 4px solid var(--gold);
  border-radius: 8px; padding: 1.25rem 1.35rem;
}
.stat-tile:nth-child(3n+2) { border-left-color: var(--teal); }
.stat-tile:nth-child(3n+3) { border-left-color: var(--rust); }
.stat-value {
  font-family: 'Inter', sans-serif; font-weight: 800; font-size: 2rem;
  color: var(--navy); line-height: 1.1; letter-spacing: -0.01em;
}
.stat-label { font-size: 0.85rem; color: #555; margin-top: 0.4rem; }
.section--navy .stat-tile { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.18); }
.section--navy .stat-tile:nth-child(3n+1) { border-left-color: var(--gold-light); }
.section--navy .stat-value { color: #fff; }
.section--navy .stat-label { color: #C9D4EA; }

/* Scroll-reveal — progressive enhancement only; .js is added by an inline
   script, so content stays fully visible with JS disabled or slow to load. */
.js main section:not(.hero) {
  opacity: 0; transform: translateY(18px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.js main section.is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .js main section:not(.hero) { opacity: 1; transform: none; transition: none; }
}

.steps { counter-reset: step; list-style: none; margin: 0; padding: 0; }
.steps li {
  counter-increment: step;
  position: relative; padding-left: 3rem; margin-bottom: 1.25rem;
}
.steps li::before {
  content: counter(step);
  position: absolute; left: 0; top: -0.15rem;
  width: 2.1rem; height: 2.1rem; border-radius: 50%;
  background: var(--gold); color: var(--navy);
  font-family: 'Cinzel', serif; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.cta-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
.btn {
  display: inline-block; text-decoration: none; font-weight: 700;
  padding: 0.8rem 1.6rem; border-radius: 6px; font-size: 0.95rem;
  letter-spacing: 0.02em;
}
.btn--gold { background: var(--gold); color: var(--navy); }
.btn--outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.6); }
.btn--outline:hover { border-color: #fff; }
.btn--navy { background: var(--navy); color: #fff; }

.tag-inline {
  display: inline-block; font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 0.08em; font-weight: 800; padding: 0.2rem 0.6rem;
  border-radius: 4px; margin-left: 0.5rem; vertical-align: middle;
}
.tag-inline--tier3 { background: var(--rust); color: #fff; }

.site-footer {
  background: var(--navy); color: #B9C6E0; padding: 2.5rem 0; margin-top: 2rem;
}
.site-footer a { color: #EAF0FB; }
.site-footer .container { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; }

/* Admin */
.admin-shell { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem; }
.admin-field { margin-bottom: 1.5rem; }
.admin-field label { display: block; font-weight: 700; margin-bottom: 0.4rem; color: var(--navy); }
.admin-field .field-key { color: #999; font-weight: 400; font-size: 0.78rem; }
.admin-field input[type=text], .admin-field input[type=email], .admin-field textarea {
  width: 100%; padding: 0.65rem; border: 1px solid var(--line); border-radius: 6px;
  font-family: inherit; font-size: 0.95rem;
}
.admin-field textarea { min-height: 5rem; resize: vertical; }
.admin-section-title {
  margin-top: 2.5rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--gold);
}
.admin-login { max-width: 380px; margin: 6rem auto; padding: 2rem; }
.flash { padding: 0.8rem 1rem; border-radius: 6px; margin-bottom: 1.2rem; font-size: 0.9rem; }
.flash--ok { background: #DEF3E5; color: #14532d; }
.flash--err { background: #FBE1DC; color: #7f1d1d; }
.save-bar {
  position: sticky; bottom: 0; background: #fff; border-top: 2px solid var(--gold);
  padding: 1rem 0; margin-top: 2rem;
}

@media (max-width: 900px) {
  .split-hero { grid-template-columns: 1fr; }
  .grid--2, .grid--3, .grid--5 { grid-template-columns: 1fr; }
  .tier-columns { grid-template-columns: 1fr; }
  nav.site-nav { display: none; }
  nav.site-nav.open { display: flex; flex-direction: column; width: 100%; padding: 1rem 0; }
  .site-header .container { flex-wrap: wrap; }
  .nav-toggle {
    display: inline-block; background: none; border: 1px solid #345; color: #fff;
    padding: 0.4rem 0.7rem; border-radius: 6px; cursor: pointer;
  }
}
`;
