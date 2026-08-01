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
const INTRO_SEEN_KEY = 'ascend_intro_seen';
function introAlreadySeen() {
  try { return localStorage.getItem(INTRO_SEEN_KEY) === 'true'; } catch (e) { return false; }
}
function markIntroSeen() {
  try { localStorage.setItem(INTRO_SEEN_KEY, 'true'); } catch (e) {}
}

let subscribed = false;
let screen = introAlreadySeen() ? 'home' : 'intro'; // intro | home | reading | synthesis
let expandedKey = null; // which spread row is expanded inline on Home
let pendingUnlockKey = null; // spread waiting on a verified purchase before drawing
let spreadKey = null;
let drawnCards = [];
let cardIndex = 0;
let activeTab = 'grounded';

function isSubscribed() { return subscribed; }

function goHome() {
  screen = 'home'; spreadKey = null; drawnCards = []; cardIndex = 0; expandedKey = null;
  render();
}

function beginFromIntro() {
  markIntroSeen();
  goHome();
}

function toggleSpread(key) {
  expandedKey = expandedKey === key ? null : key;
  render();
}

function drawFor(key) {
  if (CARDS.length === 0) return;
  const s = spreadByKey(key);
  const pool = [...CARDS];
  const picked = [];
  for (let i = 0; i < s.count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  spreadKey = key; drawnCards = picked; screen = 'reading'; cardIndex = 0; activeTab = 'grounded'; expandedKey = null;
  render();
}

// Unlocking is a single membership covering every spread, not a per-spread
// purchase. Never flip `subscribed` optimistically on tap — only the
// verified onStatusChange(true) callback below does that, then this resumes
// straight into the spread the user was trying to unlock.
function requestUnlock(key) {
  pendingUnlockKey = key;
  const btn = document.getElementById('unlockBtn-' + key);
  const original = btn ? btn.textContent : null;
  if (btn) { btn.disabled = true; btn.textContent = 'Processing…'; }
  window.AscendBilling.subscribe()
    .catch(err => {
      pendingUnlockKey = null;
      alert(err && err.message ? err.message : 'Purchase could not be started. Please try again.');
    })
    .finally(() => {
      const b = document.getElementById('unlockBtn-' + key);
      if (b && original) { b.disabled = false; b.textContent = original; }
    });
}

// Deliberately does NOT call render() — a full re-render would tear down
// and restart the breath timer's DOM/animation every time the user just
// switches tabs. Only the tab panel + button classes are touched.
function switchTab(tab) {
  activeTab = tab;
  const current = drawnCards[cardIndex];
  document.getElementById('tabGrounded').classList.toggle('active', tab === 'grounded');
  document.getElementById('tabSpirit').classList.toggle('active', tab === 'spirit');
  document.getElementById('tabPanel').innerHTML = tab === 'grounded' ? groundedPanelHtml(current) : spiritPanelHtml(current);
}

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
  // A full re-render always tears down and rebuilds the current screen's
  // DOM, including a running breath timer's circle element — stop it
  // first so its setTimeout chain doesn't keep firing against detached
  // nodes. renderReading() below starts a fresh one if the new screen is
  // still 'reading' (e.g. moving to the next card).
  stopBreathTimer();
  document.getElementById('memberPill').style.display = isSubscribed() ? 'block' : 'none';
  const root = document.getElementById('screen');
  if (screen === 'intro') return renderIntro(root);
  if (screen === 'home') return renderHome(root);
  if (screen === 'reading') return renderReading(root);
  if (screen === 'synthesis') return renderSynthesis(root);
}

function renderIntro(root) {
  root.innerHTML = `
    <div class="screen intro">
      <div class="intro-logo"><img src="ascend-logo.png" alt=""></div>
      <div class="intro-mark">ASCEND KEYS</div>
      <div class="intro-tagline">A structured practice of self-reflection, built from 108 keys across five phases of growth.</div>
      <div class="intro-body">Practice, not prediction. Each reading pairs a grounded, plain-language reflection with an optional symbolic layer.</div>
      <button class="btn-gold" id="beginBtn">BEGIN</button>
    </div>`;
  document.getElementById('beginBtn').addEventListener('click', beginFromIntro);
}

function renderHome(root) {
  const price = (window.AscendBilling && window.AscendBilling.getPriceString()) || '$5.99/month';
  const priceAmount = price.split('/')[0].trim();

  const rows = SPREADS.map(s => {
    const locked = !s.free && !isSubscribed();
    const expanded = expandedKey === s.key;
    const tag = s.free ? 'FREE' : (isSubscribed() ? 'INCLUDED' : 'MEMBERSHIP');
    const tagColor = s.free ? 'var(--gold)' : (isSubscribed() ? 'rgba(196,168,74,.6)' : 'rgba(243,236,217,.35)');
    const dots = Array.from({ length: s.count }).map(() => '<span></span>').join('');
    const plural = s.count > 1 ? 'S' : '';

    const expandContent = locked ? `
        <div class="spread-expand-content locked">
          <div class="spread-expand-rule"></div>
          <div class="locked-glyph">&#128274;</div>
          <div class="locked-body">Part of ASCEND Keys membership.</div>
          <div class="locked-price">${priceAmount}<small> / month, unlocks everything</small></div>
          <button class="btn-gold-block" id="unlockBtn-${s.key}" data-key="${s.key}">UNLOCK MEMBERSHIP</button>
          <div class="locked-fineprint">via Google Play Billing</div>
        </div>` : `
        <div class="spread-expand-content">
          <div class="spread-expand-rule"></div>
          <button class="btn-gold-block" id="drawBtn-${s.key}" data-key="${s.key}" ${CARDS.length === 0 ? 'disabled' : ''}>DRAW ${s.count} CARD${plural}</button>
          ${CARDS.length === 0 ? '<div class="locked-fineprint" style="color:#e0a0a0;margin-top:8px;">Card data failed to load.</div>' : ''}
        </div>`;

    return `
      <div class="spread-card ${expanded ? 'expanded' : ''}" data-key="${s.key}">
        <div class="spread-row" data-toggle="${s.key}">
          <div class="spread-dots">${dots}</div>
          <div class="spread-row-body">
            <div class="spread-row-title">${s.label}</div>
            <div class="spread-row-sub">${s.sub}</div>
          </div>
          <div class="spread-tag" style="color:${tagColor}">${tag}</div>
        </div>
        <div class="spread-expand ${expanded ? 'open' : ''}">
          <div class="spread-expand-inner">${expandContent}</div>
        </div>
      </div>`;
  }).join('');

  root.innerHTML = `
    <div class="screen home">
      <div class="tagline">Practice, not prediction.</div>
      <div class="section-label">Choose a spread</div>
      <div class="spread-list">${rows}</div>
      ${!isSubscribed() ? '<div style="text-align:center;margin-top:22px;"><button class="link-dim" id="restoreBtn">Already a member? Restore purchase</button></div>' : ''}
    </div>`;

  root.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => toggleSpread(el.getAttribute('data-toggle')));
  });
  root.querySelectorAll('[id^="drawBtn-"]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); drawFor(el.getAttribute('data-key')); });
  });
  root.querySelectorAll('[id^="unlockBtn-"]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); requestUnlock(el.getAttribute('data-key')); });
  });
  const restoreBtn = document.getElementById('restoreBtn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      const original = restoreBtn.textContent;
      restoreBtn.textContent = 'Checking…'; restoreBtn.disabled = true;
      window.AscendBilling.restore()
        .then(() => { if (!isSubscribed()) alert('No active subscription found for this Google account.'); })
        .catch(err => { alert(err && err.message ? err.message : 'Could not restore purchases.'); })
        .finally(() => { restoreBtn.textContent = original; restoreBtn.disabled = false; });
    });
  }
}

function groundedPanelHtml(current) {
  const phaseColor = colorFor(current.phase);
  return `
    <div class="grounded-panel">
      <div class="grounded-phase-edge" style="background:${phaseColor}"></div>
      <div class="grounded-quality">${current.tested_quality || ''}</div>
      <div class="grounded-where">${current.grounded_where || ''}</div>
      <div class="grounded-rule"></div>
      <div class="grounded-sublabel grounded-supported-label">&#10003; When it's supported</div>
      <div class="grounded-subtext">${current.grounded_supported || ''}</div>
      <div class="grounded-sublabel grounded-resisted-label">&#10005; When it's resisted</div>
      <div class="grounded-subtext" style="margin-bottom:0;">${current.grounded_resisted || ''}</div>
    </div>`;
}
function spiritPanelHtml(current) {
  return `
    <div class="spirit-panel">
      <div class="spirit-glyph">&#10018;</div>
      <div class="spirit-phrase">"${current.phrase}"</div>
      <div class="spirit-interp">${current.interpretation}</div>
      <div class="spirit-rule"></div>
      <div class="spirit-med-label">Meditation</div>
      <div class="spirit-med-text">${current.meditation}</div>
    </div>`;
}

// ── BREATH TIMER (Stage 1) ──────────────────────────────────────────────
// Cards 36/77/79/83/90/108 describe breath in natural language, not counts
// — they get a soft, unstructured pulse with no visible numbers instead.
const NATURAL_BREATH_CARDS = new Set([36, 77, 79, 83, 90, 108]);
const BREATH_AUTO_CYCLES = 3; // full cycles played automatically before settling into "replay"

function parseBreathPhases(card) {
  if (NATURAL_BREATH_CARDS.has(card.num)) return null;
  const m = (card.breathing || '').match(/^([\d-]+)\s*count/i);
  if (!m) return null;
  const nums = m[1].split('-').map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0);
  if (nums.length < 2) return null;
  let names;
  if (nums.length === 2) names = ['Inhale', 'Exhale'];
  else if (nums.length === 3) names = ['Inhale', 'Hold', 'Exhale'];
  else if (nums.length === 4) names = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  else names = nums.map((_, i) => (i === nums.length - 1 ? 'Exhale' : (i % 2 === 0 ? 'Inhale' : 'Hold')));
  return nums.map((seconds, i) => ({ name: names[i] || 'Hold', seconds }));
}

let breathStopFn = null;
function stopBreathTimer() {
  if (breathStopFn) { breathStopFn(); breathStopFn = null; }
}

function startBreathTimer(card) {
  const circle = document.getElementById('breathCircle');
  const label = document.getElementById('breathPhaseLabel');
  const skipBtn = document.getElementById('breathSkipBtn');
  const replayBtn = document.getElementById('breathReplayBtn');
  if (!circle) return;

  function showPlayingState() {
    if (skipBtn) skipBtn.style.display = '';
    if (replayBtn) replayBtn.style.display = 'none';
  }
  function showStoppedState() {
    if (skipBtn) skipBtn.style.display = 'none';
    if (replayBtn) replayBtn.style.display = '';
  }

  const phases = parseBreathPhases(card);

  if (!phases) {
    circle.className = 'breath-circle natural';
    circle.style.transition = ''; circle.style.transform = ''; circle.style.opacity = '';
    if (label) label.textContent = 'BREATHE NATURALLY';
    showPlayingState();
    breathStopFn = () => { circle.className = 'breath-circle'; };
    if (skipBtn) skipBtn.onclick = () => { stopBreathTimer(); showStoppedState(); };
    if (replayBtn) replayBtn.onclick = () => startBreathTimer(card);
    return;
  }

  circle.className = 'breath-circle';
  let phaseIndex = 0, cycleCount = 0, stopped = false;

  function step() {
    if (stopped) return;
    const phase = phases[phaseIndex];
    if (label) label.textContent = phase.name.toUpperCase() + ' · ' + phase.seconds + 's';
    circle.style.transition = `transform ${phase.seconds}s ease-in-out, opacity ${phase.seconds}s ease-in-out`;
    if (phase.name === 'Inhale') { circle.style.transform = 'scale(1.55)'; circle.style.opacity = '1'; }
    else if (phase.name === 'Exhale') { circle.style.transform = 'scale(0.72)'; circle.style.opacity = '.65'; }
    // Hold: leave transform/opacity where they are, just wait out the duration.
    setTimeout(() => {
      if (stopped) return;
      phaseIndex = (phaseIndex + 1) % phases.length;
      if (phaseIndex === 0) {
        cycleCount += 1;
        if (cycleCount >= BREATH_AUTO_CYCLES) { stopped = true; showStoppedState(); return; }
      }
      step();
    }, phase.seconds * 1000);
  }

  showPlayingState();
  step();

  breathStopFn = () => {
    stopped = true;
    circle.style.transition = ''; circle.style.transform = 'scale(1)'; circle.style.opacity = '1';
  };
  if (skipBtn) skipBtn.onclick = () => { stopBreathTimer(); showStoppedState(); };
  if (replayBtn) replayBtn.onclick = () => startBreathTimer(card);
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

  const phaseColor = colorFor(current.phase);

  root.innerHTML = `
    <div class="screen reading">
      ${showThread ? `<div class="thread-row">${threadDots}</div>` : ''}
      <div class="reading-meta">
        ${position ? `<div class="reading-position">${position}</div>` : ''}
        <div class="reading-num-row">
          <span class="reading-num-dot" style="background:${phaseColor}"></span>
          <div class="reading-num">№ ${current.num} &middot; ${phaseNameFor(current.phase)}</div>
        </div>
        <div class="reading-title">${current.title}</div>
        <div class="reading-title-rule"></div>
      </div>
      <div class="breath-timer">
        <div class="breath-circle-wrap"><div class="breath-circle" id="breathCircle"></div></div>
        <div class="breath-phase-label" id="breathPhaseLabel">BREATHE</div>
        <div class="breath-controls">
          <button class="breath-ctrl-btn" id="breathSkipBtn">Skip</button>
          <button class="breath-ctrl-btn" id="breathReplayBtn" style="display:none;">Replay</button>
        </div>
      </div>
      <div class="tab-switch">
        <button class="tab-btn ${activeTab === 'grounded' ? 'active' : ''}" id="tabGrounded">GROUNDED</button>
        <button class="tab-btn ${activeTab === 'spirit' ? 'active' : ''}" id="tabSpirit">SPIRIT</button>
      </div>
      <div id="tabPanel">${activeTab === 'grounded' ? groundedPanelHtml(current) : spiritPanelHtml(current)}</div>
      <div class="reading-nav">
        ${cardIndex > 0 ? '<button class="btn-outline" id="backCardBtn">BACK</button>' : ''}
        <button class="btn-next" id="nextCardBtn">${nextLabel}</button>
      </div>
    </div>`;

  document.getElementById('tabGrounded').addEventListener('click', () => switchTab('grounded'));
  document.getElementById('tabSpirit').addEventListener('click', () => switchTab('spirit'));
  document.getElementById('nextCardBtn').addEventListener('click', nextCard);
  const backCardBtn = document.getElementById('backCardBtn');
  if (backCardBtn) backCardBtn.addEventListener('click', prevCard);

  startBreathTimer(current);
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
    if (val && !wasSubscribed && pendingUnlockKey) {
      // A purchase just completed (or was restored) — resume straight into
      // the spread the user was trying to unlock. Never flip `subscribed`
      // optimistically on button tap; only this verified callback does.
      const key = pendingUnlockKey;
      pendingUnlockKey = null;
      drawFor(key);
      return;
    }
    render();
  });
  window.AscendBilling.init();
} catch (e) {
  console.error('AscendBilling setup failed:', e);
}

render();
