// ── CARD DATA — loaded synchronously from cards_data.js (a plain <script> ──
// tag, see index.html), NOT fetch(). fetch() to the bundled JSON was
// observed to hang indefinitely in some on-device WebViews (never
// resolving, never rejecting — no error, just permanently stuck), even
// though it worked instantly in a desktop browser. A <script> tag uses the
// browser's normal resource-loading pipeline instead of the Fetch API, and
// that path is proven to work on-device since app.js/billing.js load the
// same way.
let CARDS = [];
let PHASES = [];
try {
  const data = window.ASCEND_CARDS_DATA;
  if (!data || !Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error('Card data missing or malformed');
  }
  CARDS = data.cards;
  PHASES = data.phases;
} catch (e) {
  console.error('Card data load failed:', e);
}

// ── SPREADS — "One Card" is always free (no daily limit). Everything ───────
// else requires membership.
const SPREADS = [
  { key: 'one', count: 1, label: 'One Card', sub: 'A single key, drawn plain.', free: true },
  { key: 'stand', count: 1, label: 'Where You Stand', sub: 'A focused single-card check-in.', free: false },
  { key: 'three', count: 3, label: 'Three Card Draw', sub: 'Grounded in / moving through / opening toward', free: false },
  { key: 'five', count: 5, label: 'Five Card Draw', sub: 'A fuller arc across the phases.', free: false },
  { key: 'nine', count: 9, label: 'Nine Card Draw', sub: 'The full ascent, phase by phase.', free: false },
];
const POSITIONS = {
  three: ['Grounded In', 'Moving Through', 'Opening Toward'],
  five: ['Foundation', 'Friction', 'Turning Point', 'Integration', 'Emerging Direction'],
};
const HUES = { 1: 238, 2: 266, 3: 294, 4: 322, 5: 38 };

function hueFor(phaseNum) { return HUES[phaseNum] ?? 264; }
function colorFor(phaseNum) { return `oklch(0.65 0.1 ${hueFor(phaseNum)})`; }
function phaseNameFor(phaseNum) { const p = PHASES.find(x => x.num === phaseNum); return p ? p.name : ''; }
function spreadByKey(key) { return SPREADS.find(s => s.key === key); }

// ── STATE ────────────────────────────────────────────────────────────────
let subscribed = false;
let screen = 'home'; // home | drawing | paywall | reading | synthesis
let spreadKey = null;
let paywallSpread = null;
let drawnCards = [];
let cardIndex = 0;
let activeTab = 'grounded';

function isSubscribed() { return subscribed; }

function goHome() {
  screen = 'home'; spreadKey = null; drawnCards = []; cardIndex = 0;
  render();
}

function selectSpread(key) {
  const s = spreadByKey(key);
  if (isSubscribed() || s.free) {
    screen = 'drawing'; spreadKey = key; drawnCards = []; cardIndex = 0; activeTab = 'grounded';
    render();
    return;
  }
  screen = 'paywall'; paywallSpread = key;
  render();
}

function drawCards() {
  if (CARDS.length === 0) return;
  const s = spreadByKey(spreadKey);
  const pool = [...CARDS];
  const picked = [];
  for (let i = 0; i < s.count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  drawnCards = picked; screen = 'reading'; cardIndex = 0; activeTab = 'grounded';
  render();
}

function setTab(tab) { activeTab = tab; render(); }

function nextCard() {
  if (cardIndex < drawnCards.length - 1) { cardIndex += 1; activeTab = 'grounded'; }
  else { screen = 'synthesis'; }
  render();
}
function prevCard() {
  if (cardIndex > 0) { cardIndex -= 1; activeTab = 'grounded'; render(); }
}

function composeSynthesis(cards) {
  if (!cards.length) return { headline: '', sub: null, takeaway: '' };
  if (cards.length === 1) {
    return { headline: `This card is testing: ${cards[0].tested_quality}.`, sub: null, takeaway: cards[0].grounded_where_v2 || cards[0].grounded_where };
  }
  const phaseNames = [...new Set(cards.map(c => phaseNameFor(c.phase)))];
  const qualities = [...new Set(cards.map(c => c.tested_quality))];
  const headline = qualities.length === 1
    ? `Every card is testing the same thing: ${qualities[0]}.`
    : `The thread running through this draw: ${qualities.join(', ')}.`;
  const sub = phaseNames.length > 1 ? `This reading moves through ${phaseNames.join(' → ')}.` : `This reading stays within ${phaseNames[0]}.`;
  const last = cards[cards.length - 1];
  return { headline, sub, takeaway: last.grounded_where_v2 || last.grounded_where };
}

// ── RENDER ───────────────────────────────────────────────────────────────
function render() {
  document.getElementById('memberPill').style.display = isSubscribed() ? 'block' : 'none';
  const root = document.getElementById('screen');
  if (screen === 'home') return renderHome(root);
  if (screen === 'drawing') return renderDrawing(root);
  if (screen === 'paywall') return renderPaywall(root);
  if (screen === 'reading') return renderReading(root);
  if (screen === 'synthesis') return renderSynthesis(root);
}

function renderHome(root) {
  const rows = SPREADS.map(s => {
    const tag = s.free ? 'FREE' : (isSubscribed() ? 'INCLUDED' : 'MEMBERSHIP');
    const tagColor = s.free ? 'var(--gold)' : (isSubscribed() ? 'rgba(196,168,74,.6)' : 'rgba(243,236,217,.35)');
    const dots = Array.from({ length: s.count }).map(() => '<span></span>').join('');
    return `
      <div class="spread-row" data-key="${s.key}">
        <div class="spread-dots">${dots}</div>
        <div class="spread-row-body">
          <div class="spread-row-title">${s.label}</div>
          <div class="spread-row-sub">${s.sub}</div>
        </div>
        <div class="spread-tag" style="color:${tagColor}">${tag}</div>
      </div>`;
  }).join('');

  root.innerHTML = `
    <div class="screen home">
      <div class="tagline">Practice, not prediction.</div>
      <div class="section-label">Choose a spread</div>
      <div class="spread-list">${rows}</div>
    </div>`;

  root.querySelectorAll('.spread-row').forEach(el => {
    el.addEventListener('click', () => selectSpread(el.getAttribute('data-key')));
  });
}

function renderDrawing(root) {
  const s = spreadByKey(spreadKey);
  const plural = s.count > 1 ? 'S' : '';
  root.innerHTML = `
    <div class="screen drawing">
      <div class="card-back"><div class="card-back-mono">AK</div></div>
      <div>
        <div class="drawing-title">${s.label}</div>
        <div class="drawing-sub">${s.sub}</div>
      </div>
      <button class="btn-gold" id="drawBtn" ${CARDS.length === 0 ? 'disabled' : ''}>DRAW ${s.count} CARD${plural}</button>
      ${CARDS.length === 0 ? '<div class="drawing-sub" style="color:#e0a0a0;">Card data failed to load. Try reinstalling the app.</div>' : ''}
      <button class="link-dim" id="backBtn">Back</button>
    </div>`;
  document.getElementById('drawBtn').addEventListener('click', drawCards);
  document.getElementById('backBtn').addEventListener('click', goHome);
}

function renderPaywall(root) {
  const label = paywallSpread ? spreadByKey(paywallSpread).label : '';
  const price = (window.AscendBilling && window.AscendBilling.getPriceString()) || '$5.99/month';
  root.innerHTML = `
    <div class="screen paywall">
      <div class="paywall-glyph">&#128274;</div>
      <div class="paywall-title">${label}</div>
      <div class="paywall-body">Multi-card spreads and Where You Stand are part of ASCEND Keys membership. One card is always free.</div>
      <div class="paywall-price">${price.split('/')[0].trim()}<small> / month</small></div>
      <button class="btn-gold" id="unlockBtn">UNLOCK MEMBERSHIP</button>
      <div class="paywall-fineprint">via Google Play Billing</div>
      <button class="link-dim" id="restoreBtn">Already a member? Restore purchase</button>
      <button class="link-dim" id="notNowBtn">Not now</button>
    </div>`;

  document.getElementById('unlockBtn').addEventListener('click', () => {
    const btn = document.getElementById('unlockBtn');
    const original = btn.textContent;
    btn.disabled = true; btn.textContent = 'Processing…';
    window.AscendBilling.subscribe()
      .catch(err => { alert(err && err.message ? err.message : 'Purchase could not be started. Please try again.'); })
      .finally(() => { btn.disabled = false; btn.textContent = original; });
  });
  document.getElementById('restoreBtn').addEventListener('click', () => {
    const btn = document.getElementById('restoreBtn');
    const original = btn.textContent;
    btn.textContent = 'Checking…'; btn.disabled = true;
    window.AscendBilling.restore()
      .then(() => { if (!isSubscribed()) alert('No active subscription found for this Google account.'); })
      .catch(err => { alert(err && err.message ? err.message : 'Could not restore purchases.'); })
      .finally(() => { btn.textContent = original; btn.disabled = false; });
  });
  document.getElementById('notNowBtn').addEventListener('click', goHome);
}

function renderReading(root) {
  const current = drawnCards[cardIndex];
  const positions = POSITIONS[spreadKey];
  const position = positions ? positions[cardIndex] : null;
  const showThread = drawnCards.length > 1;

  const threadDots = showThread ? drawnCards.map((c, i) => {
    const opacity = i <= cardIndex ? 1 : 0.3;
    return `<span style="background:${colorFor(c.phase)};opacity:${opacity}"></span>`;
  }).join('') : '';

  const isLast = cardIndex === drawnCards.length - 1;
  const nextLabel = isLast ? 'SEE SYNTHESIS' : 'NEXT CARD';

  root.innerHTML = `
    <div class="screen reading">
      ${showThread ? `<div class="thread-row">${threadDots}</div>` : ''}
      <div class="reading-meta">
        ${position ? `<div class="reading-position">${position}</div>` : ''}
        <div class="reading-num">№ ${current.num} &middot; ${phaseNameFor(current.phase)}</div>
        <div class="reading-title">${current.title}</div>
      </div>
      <div class="breathe-strip">
        <div class="breathe-label">BREATHE</div>
        <div class="breathe-text">${current.breathing}</div>
      </div>
      <div class="tab-switch">
        <button class="tab-btn ${activeTab === 'grounded' ? 'active' : ''}" id="tabGrounded">GROUNDED</button>
        <button class="tab-btn ${activeTab === 'spirit' ? 'active' : ''}" id="tabSpirit">SPIRIT</button>
      </div>
      ${activeTab === 'grounded' ? `
        <div class="grounded-panel">
          <div class="grounded-quality">${current.tested_quality || ''}</div>
          <div class="grounded-where">${current.grounded_where || ''}</div>
          <div class="grounded-sublabel grounded-supported-label">When it's supported</div>
          <div class="grounded-subtext">${current.grounded_supported || ''}</div>
          <div class="grounded-sublabel grounded-resisted-label">When it's resisted</div>
          <div class="grounded-subtext" style="margin-bottom:0;">${current.grounded_resisted || ''}</div>
        </div>` : `
        <div class="spirit-panel">
          <div class="spirit-phrase">"${current.phrase}"</div>
          <div class="spirit-interp">${current.interpretation}</div>
          <div class="spirit-med-label">Meditation</div>
          <div class="spirit-med-text">${current.meditation}</div>
        </div>`}
      <div class="reading-nav">
        ${cardIndex > 0 ? '<button class="btn-outline" id="backCardBtn">BACK</button>' : ''}
        <button class="btn-next" id="nextCardBtn">${nextLabel}</button>
      </div>
    </div>`;

  document.getElementById('tabGrounded').addEventListener('click', () => setTab('grounded'));
  document.getElementById('tabSpirit').addEventListener('click', () => setTab('spirit'));
  document.getElementById('nextCardBtn').addEventListener('click', nextCard);
  const backCardBtn = document.getElementById('backCardBtn');
  if (backCardBtn) backCardBtn.addEventListener('click', prevCard);
}

function renderSynthesis(root) {
  const synth = composeSynthesis(drawnCards);
  const dots = drawnCards.map(c => `<span class="dot" style="background:${colorFor(c.phase)}"></span><span class="line"></span>`).join('');

  root.innerHTML = `
    <div class="screen synthesis">
      <div class="synth-label-top">The synthesis</div>
      <div class="synth-thread">${dots}</div>
      <div class="synth-headline">${synth.headline}</div>
      ${synth.sub ? `<div class="synth-sub">${synth.sub}</div>` : ''}
      <div class="synth-takeaway">${synth.takeaway || ''}</div>
      <button class="btn-outline-gold" id="newReadingBtn">NEW READING</button>
    </div>`;
  document.getElementById('newReadingBtn').addEventListener('click', goHome);
}

// ── Google Play Billing wiring ──────────────────────────────────────────
// Wired up last and fully isolated: if window.AscendBilling is missing or
// throws for any reason (plugin bridge not ready, script load failure),
// it must never block card data or rendering above.
try {
  window.AscendBilling.onStatusChange(val => {
    const wasSubscribed = subscribed;
    subscribed = val;
    if (val && !wasSubscribed) {
      // A purchase just completed (or was restored) — resume into the
      // spread the user was trying to unlock, if any. Never flip this
      // optimistically on button click; only on the verified callback.
      if (screen === 'paywall' && paywallSpread) {
        screen = 'drawing'; spreadKey = paywallSpread; drawnCards = []; cardIndex = 0; activeTab = 'grounded';
      }
    }
    render();
  });
  window.AscendBilling.init();
} catch (e) {
  console.error('AscendBilling setup failed:', e);
}

render();
