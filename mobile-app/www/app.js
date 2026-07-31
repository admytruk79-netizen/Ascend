// ── SUBSCRIPTION STATE (backed by Google Play Billing via billing.js) ──────
const PREMIUM_SPREADS = new Set([3, 5, 9, "ladder"]);

let subscribed = false;

function isSubscribed() {
  return subscribed;
}

function renderSubStatus() {
  document.getElementById("sub-status").textContent = isSubscribed() ? "✦ MEMBER — FULL SPREADS UNLOCKED" : "";
}

function openPaywall() {
  const priceEl = document.getElementById("paywall-price");
  if (priceEl) priceEl.textContent = window.AscendBilling.getPriceString();
  document.getElementById("paywall-overlay").classList.add("active");
}
function closePaywall() { document.getElementById("paywall-overlay").classList.remove("active"); }

function stripTestingPrefix(str) {
  const s = (str || '').replace(/^This is testing\s*/i, '');
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// ── AI "Weave It In" personalize backend (Cloudflare Worker) ───────────────
// Off until there's a real, working backend to call — flip this on once
// PERSONALIZE_API_URL points at a deployed Worker with the /api/personalize
// route. Until then the feature stays fully built but hidden, rather than
// shipping a button that just fails.
const PERSONALIZE_ENABLED = false;

// Must be an absolute URL: the app runs from a different origin than the
// Worker (capacitor://localhost, not the Worker's domain), so a relative
// "/api/personalize" path won't reach it. Replace with your deployed
// Worker's URL — see mobile-app/README.md.
const PERSONALIZE_API_URL = "https://REPLACE-WITH-YOUR-WORKER-URL.workers.dev/api/personalize";

function renderPersonalizeBox(card, containerId) {
  if (!PERSONALIZE_ENABLED) return;
  const box = document.createElement('div');
  box.className = 'personalize-box';
  box.innerHTML = `
    <div class="synth-label">Weave In Your Situation <span class="optional-tag">(optional)</span></div>
    <textarea class="personalize-input" placeholder="What's actually going on?" rows="3"></textarea>
    <button class="personalize-btn">Weave It In</button>
    <div class="personalize-result"></div>
  `;
  document.getElementById(containerId).appendChild(box);

  box.querySelector('.personalize-btn').addEventListener('click', async () => {
    if (!isSubscribed()) { openPaywall(); return; }
    const text = box.querySelector('.personalize-input').value.trim();
    const resultEl = box.querySelector('.personalize-result');
    if (!text) { resultEl.textContent = 'Add a bit about your situation first.'; return; }
    const btn = box.querySelector('.personalize-btn');
    const original = btn.textContent;
    btn.textContent = 'Weaving…';
    btn.disabled = true;
    resultEl.textContent = '';
    try {
      const res = await fetch(PERSONALIZE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: card.title,
          tested_quality: card.tested_quality,
          grounded_supported: card.grounded_supported,
          grounded_resisted: card.grounded_resisted,
          grounded_where: card.grounded_where_v2 || card.grounded_where,
          situation: text
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      resultEl.textContent = data.text || 'No response.';
    } catch (e) {
      resultEl.textContent = "Couldn't connect right now — try again in a moment.";
      console.error(e);
    }
    btn.textContent = original;
    btn.disabled = false;
  });
}

let CARDS = [];
let PHASES = [];

const SPREADS = {
  1: {
    label: "Single Card",
    desc: "One card to glimpse what wants your attention right now.",
    positions: [
      { label: "The Card", meaning: "" }
    ]
  },
  3: {
    label: "Daily Practice",
    desc: "The classic three-card draw: what today holds, what you can shape, and what lies beyond your control.",
    positions: [
      { label: "General Overview", meaning: "A general overview of the day or situation ahead." },
      { label: "Action Available", meaning: "What action you can take to alter the path." },
      { label: "Beyond Your Control", meaning: "What is beyond your control in this moment." }
    ]
  },
  5: {
    label: "Past · Present · Future",
    desc: "Understanding the pattern behind a situation, and what can and cannot be changed.",
    positions: [
      { label: "Current Situation", meaning: "The current situation in a snapshot." },
      { label: "Root Cause", meaning: "The causes behind the current situation." },
      { label: "Likely Development", meaning: "The most likely way the situation develops if unchanged." },
      { label: "Available Action", meaning: "What action, if any, can change the most likely future." },
      { label: "Fixed Factor", meaning: "A factor that cannot be altered." }
    ]
  },
  9: {
    label: "The Full Mandala",
    desc: "A nine-position situational analysis crossing three domains of being across past, present, and future.",
    positions: [
      { label: "Body — Past", meaning: "What the body has carried from before." },
      { label: "Mind — Past", meaning: "What patterns of thought have shaped this." },
      { label: "Spirit — Past", meaning: "What deeper current set this in motion." },
      { label: "Body — Present", meaning: "What the body holds right now." },
      { label: "Mind — Present", meaning: "What the mind is currently working through." },
      { label: "Spirit — Present", meaning: "What deeper truth is active right now." },
      { label: "Body — Emerging", meaning: "How the body is being called to move forward." },
      { label: "Mind — Emerging", meaning: "What new understanding is arriving." },
      { label: "Spirit — Emerging", meaning: "What the situation is ultimately moving you toward." }
    ]
  },
  ladder: {
    label: "Where You Stand",
    desc: "A single-card reading of where you currently sit on the five-phase evolutionary ladder — and what this rung is asking of you.",
    isLadder: true
  }
};

const PHASE_THEMES = {
  1: "settling into safety and nervous-system coherence",
  2: "activating and organizing subtle energy",
  3: "integrating and harmonizing multiple forces",
  4: "expanding into cosmic and archetypal pattern",
  5: "embodying mastery and completion"
};

let currentSpread = 3;

function initSelector() {
  const sel = document.getElementById('selector');
  sel.innerHTML = '';
  Object.keys(SPREADS).forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'spread-btn' + (k === String(currentSpread) ? ' active' : '');
    const s = SPREADS[k];
    const glyph = s.isLadder ? '<span class="n">☖</span>' : `<span class="n">${k}</span>`;
    btn.innerHTML = `${glyph}${s.label}`;
    btn.onclick = () => {
      currentSpread = s.isLadder ? 'ladder' : Number(k);
      initSelector();
      updateDesc();
      renderManualInputs();
      document.getElementById('spreadArea').innerHTML = '';
      document.getElementById('synthesisArea').style.display = 'none';
      document.getElementById('synthesisArea').innerHTML = '';
      document.getElementById('manualError').textContent = '';
    };
    sel.appendChild(btn);
  });
}

function spreadCount() {
  return currentSpread === 'ladder' ? 1 : currentSpread;
}

function renderManualInputs() {
  const wrap = document.getElementById('manualInputs');
  wrap.innerHTML = '';
  const n = spreadCount();
  const spread = SPREADS[currentSpread];
  for (let i = 0; i < n; i++) {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.max = CARDS.length || 108;
    input.placeholder = (!spread.isLadder && spread.positions) ? String(i + 1) : '#';
    input.title = (!spread.isLadder && spread.positions) ? spread.positions[i].label : 'Card number';
    wrap.appendChild(input);
  }
}

function readManualCards() {
  const inputs = Array.from(document.querySelectorAll('#manualInputs input'));
  const errorEl = document.getElementById('manualError');
  errorEl.textContent = '';

  const raw = inputs.map(inp => inp.value.trim());
  if (raw.some(v => v === '')) {
    errorEl.textContent = 'Enter a number in every box, or use Draw Randomly instead.';
    return null;
  }
  const nums = raw.map(v => parseInt(v, 10));
  const max = CARDS.length || 108;
  if (nums.some(n => isNaN(n) || n < 1 || n > max)) {
    errorEl.textContent = `Card numbers must be between 1 and ${max}.`;
    return null;
  }
  if (new Set(nums).size !== nums.length) {
    errorEl.textContent = 'Each card can only appear once in a spread.';
    return null;
  }
  const cards = nums.map(n => CARDS.find(c => c.num === n));
  if (cards.some(c => !c)) {
    errorEl.textContent = 'One or more card numbers could not be found.';
    return null;
  }
  return cards;
}

function updateDesc() {
  document.getElementById('spreadDesc').textContent = SPREADS[currentSpread].desc;
}

function shuffleDraw(n) {
  const pool = [...CARDS];
  const drawn = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    drawn.push(pool.splice(idx, 1)[0]);
  }
  return drawn;
}

function layoutClass(n) {
  return { 1: 'n1', 3: 'n3', 5: 'n5', 9: 'n9' }[n];
}

function renderSpread(drawnCards) {
  const spread = SPREADS[currentSpread];
  const area = document.getElementById('spreadArea');
  const grid = document.createElement('div');
  grid.className = 'layout ' + layoutClass(currentSpread);

  drawnCards.forEach((card, i) => {
    const pos = spread.positions[i];
    const slot = document.createElement('div');
    slot.className = 'position-slot';

    const label = document.createElement('div');
    label.className = 'pos-label';
    label.innerHTML = `${pos.label}${pos.meaning ? '<br><span style="opacity:.7;font-family:\'EB Garamond\',serif;text-transform:none;letter-spacing:0;font-size:12.5px;font-style:italic;">' + pos.meaning + '</span>' : ''}`;
    slot.appendChild(label);

    const c = document.createElement('div');
    c.className = 'card';
    c.style.animationDelay = (i * 0.08) + 's';
    c.innerHTML = `
      <span class="card-num">№ ${card.num}</span>
      <div class="card-phase">Phase ${card.phase} — ${PHASES.find(p => p.num === card.phase).name}</div>
      <div class="card-title">${card.title}</div>
      <div class="card-phrase">${card.phrase}</div>
      <div class="card-field">
        <span class="flabel">Breathing</span>
        <span class="fval">${card.breathing}</span>
      </div>
      ${card.grounded_supported ? `
      <div class="card-grounded">
        <div class="section-label">Grounded</div>
        <div class="grounded-row"><span class="flabel gsupported">Supported</span><span class="fval">${card.grounded_supported}</span></div>
        <div class="grounded-row"><span class="flabel gresisted">Resisted</span><span class="fval">${card.grounded_resisted}</span></div>
        <div class="grounded-row"><span class="flabel gwhere">Tested Quality — ${card.tested_quality || ''}</span><span class="fval">${stripTestingPrefix(card.grounded_where_v2 || card.grounded_where)}</span></div>
      </div>` : ''}
      <div class="card-soul">
        <div class="section-label">Spirit / Soul</div>
        <div class="card-interp">
          <span class="fval">${card.interpretation}</span>
        </div>
        <div class="card-field">
          <span class="flabel">Meditation</span>
          <span class="fval">${card.meditation}</span>
        </div>
      </div>
    `;
    slot.appendChild(c);
    grid.appendChild(slot);
  });

  area.innerHTML = '';
  area.appendChild(grid);
}

function buildSynthesis(drawnCards) {
  const spread = SPREADS[currentSpread];
  const positions = spread.positions;

  if (drawnCards.length === 1) {
    const card = drawnCards[0];
    const phaseInfo = PHASES.find(p => p.num === card.phase);
    const fieldTextSingle = `This card sits within Phase ${card.phase} — ${phaseInfo.name}. The whole situation is ${PHASE_THEMES[card.phase]}.`;
    const meetText = `Supported looks like this: ${card.grounded_supported} Resisted looks like this: ${card.grounded_resisted}`;

    const area = document.getElementById('synthesisArea');
    area.style.display = 'block';
    area.innerHTML = `
      <div class="synth-header">
        <div class="synth-diamond">✦</div>
        <div class="synth-title">Reading</div>
        <div class="synth-rule"></div>
      </div>
      <div class="synth-block">
        <div class="synth-section">
          <div class="synth-label">The Field</div>
          <div class="synth-text">${fieldTextSingle}</div>
        </div>
        <div class="synth-section">
          <div class="synth-label">How to Meet It</div>
          <div class="synth-text">${meetText}</div>
        </div>
      </div>
    `;
    renderPersonalizeBox(card, 'synthesisArea');
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const phaseSeq = drawnCards.map(c => c.phase);
  const phaseCounts = {};
  drawnCards.forEach(c => { phaseCounts[c.phase] = (phaseCounts[c.phase] || 0) + 1; });
  const dominant = Number(Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0][0]);
  const phaseList = Object.keys(phaseCounts).map(Number).sort((a, b) => a - b);

  let directionNote = '';
  if (phaseList.length > 1) {
    const first = phaseSeq[0], last = phaseSeq[phaseSeq.length - 1];
    if (last > first) directionNote = ` The sequence moves from Phase ${first} toward Phase ${last} — this reading is pulling you forward, into less familiar territory.`;
    else if (last < first) directionNote = ` The sequence moves from Phase ${last} back toward Phase ${first} — this reading is pulling you back to something more foundational, not asking you to advance yet.`;
    else directionNote = ` The phases here don't move in one direction so much as circle the same ground from different angles.`;
  }

  let fieldText;
  if (phaseList.length === 1) {
    fieldText = `Every card in this reading sits within Phase ${phaseList[0]} — ${PHASES.find(p => p.num == phaseList[0]).name}. Nothing here is asking you to look outside that: the whole situation is ${PHASE_THEMES[phaseList[0]]}.`;
  } else {
    fieldText = `This reading spans Phase${phaseList.length > 1 ? 's' : ''} ${phaseList.join(', ')}, weighted most toward Phase ${dominant} — ${PHASES.find(p => p.num == dominant).name}.${directionNote}`;
  }

  const qualityMap = {};
  drawnCards.forEach((c, i) => {
    const q = c.tested_quality;
    if (!q) return;
    if (!qualityMap[q]) qualityMap[q] = [];
    qualityMap[q].push(i);
  });
  const sharedQualities = Object.entries(qualityMap).filter(([q, idxs]) => idxs.length > 1);

  let throughlineText;
  if (sharedQualities.length > 0) {
    const [quality, idxs] = sharedQualities.sort((a, b) => b[1].length - a[1].length)[0];
    const posNames = idxs.map(i => positions ? positions[i].label : `card ${i + 1}`);
    throughlineText = `${posNames.join(' and ')} are both testing the same thing: ${quality}. That's not a coincidence — when the same quality shows up in more than one position, it's the actual center of the reading, not a side note.`;
  } else {
    const qualities = drawnCards.map(c => c.tested_quality).filter(Boolean);
    throughlineText = `No single quality repeats across this spread — instead you're being asked to hold several different capacities at once: ${qualities.join(', ')}. The difficulty isn't any one of them, it's doing them simultaneously.`;
  }

  const transitions = ['To begin,', 'From there,', 'This leads into', 'Which opens into', 'And finally,'];
  const chainParts = drawnCards.map((c, i) => {
    const posLabel = positions ? positions[i].label.toLowerCase() : `position ${i + 1}`;
    const lead = i === 0 ? `In ${posLabel},` : `${transitions[Math.min(i, transitions.length - 1)]} in ${posLabel},`;
    const groundedLine = (c.grounded_where_v2 || c.grounded_where || '').replace(/^This is testing\s*/i, '');
    return `${lead} ${c.title} is testing ${groundedLine.charAt(0).toLowerCase() + groundedLine.slice(1)}`;
  });
  const chainText = chainParts.join(' ');

  const outcomeCard = drawnCards[drawnCards.length - 1];
  const anchorCard = drawnCards[0];
  const carryText = sharedQualities.length > 0
    ? `The through-line here is ${sharedQualities[0][0]} — that's the one thing worth actually watching for as this plays out. If you lose the thread, come back to ${anchorCard.title}'s breath pattern (${anchorCard.breathing.split('(')[0].trim()}) to reset.`
    : `Since this reading doesn't converge on one quality, treat ${outcomeCard.title} as the closing note: ${(outcomeCard.grounded_where_v2 || outcomeCard.grounded_where)} Let that be what you carry out, even while the rest stays in tension.`;

  const area = document.getElementById('synthesisArea');
  area.style.display = 'block';
  area.innerHTML = `
    <div class="synth-header">
      <div class="synth-diamond">✦</div>
      <div class="synth-title">Spread Synthesis</div>
      <div class="synth-rule"></div>
    </div>
    <div class="synth-block">
      <div class="synth-section">
        <div class="synth-label">The Field</div>
        <div class="synth-text">${fieldText}</div>
      </div>
      <div class="synth-section">
        <div class="synth-label">The Thread</div>
        <div class="synth-text">${chainText}</div>
      </div>
      <div class="synth-section">
        <div class="synth-label">The Throughline</div>
        <div class="synth-text">${throughlineText}</div>
      </div>
      <div class="synth-section">
        <div class="synth-label">What To Carry</div>
        <div class="synth-text">${carryText}</div>
      </div>
    </div>
  `;
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ladderPositionInPhase(card) {
  const phase = PHASES.find(p => p.num === card.phase);
  const [lo, hi] = phase.range;
  const span = hi - lo;
  const pos = card.num - lo;
  const pct = span === 0 ? 0 : pos / span;
  let stage, prep;
  if (pct < 0.34) { stage = "the early stage of"; prep = "in"; }
  else if (pct < 0.7) { stage = "the middle stretch of"; prep = "in"; }
  else { stage = "the threshold of"; prep = "at"; }
  return { phase, pct, stage, prep };
}

function renderLadder(card) {
  const { phase, pct, stage } = ladderPositionInPhase(card);
  const area = document.getElementById('spreadArea');

  const rungs = PHASES.map(p => {
    const active = p.num === phase.num;
    const passed = p.num < phase.num;
    return `<div class="rung ${active ? 'rung-active' : ''} ${passed ? 'rung-passed' : ''}">
      <div class="rung-num">${p.num}</div>
      <div class="rung-name">${p.name}</div>
      ${active ? `<div class="rung-marker" style="bottom:${(pct * 80 + 8)}%"></div>` : ''}
    </div>`;
  }).join('');

  const wrap = document.createElement('div');
  wrap.className = 'ladder-wrap';
  wrap.innerHTML = `
    <div class="ladder">${rungs}</div>
    <div class="ladder-card-col">
      <div class="pos-label">Where You Stand</div>
      <div class="card" style="animation-delay:.1s">
        <span class="card-num">№ ${card.num}</span>
        <div class="card-phase">Phase ${card.phase} — ${phase.name}</div>
        <div class="card-title">${card.title}</div>
        <div class="card-phrase">${card.phrase}</div>
        <div class="card-field"><span class="flabel">Breathing</span><span class="fval">${card.breathing}</span></div>
        ${card.grounded_supported ? `
        <div class="card-grounded">
          <div class="section-label">Grounded</div>
          <div class="grounded-row"><span class="flabel gsupported">Supported</span><span class="fval">${card.grounded_supported}</span></div>
          <div class="grounded-row"><span class="flabel gresisted">Resisted</span><span class="fval">${card.grounded_resisted}</span></div>
          <div class="grounded-row"><span class="flabel gwhere">Tested Quality — ${card.tested_quality || ''}</span><span class="fval">${stripTestingPrefix(card.grounded_where_v2 || card.grounded_where)}</span></div>
        </div>` : ''}
        <div class="card-soul">
          <div class="section-label">Spirit / Soul</div>
          <div class="card-interp"><span class="fval">${card.interpretation}</span></div>
          <div class="card-field"><span class="flabel">Meditation</span><span class="fval">${card.meditation}</span></div>
        </div>
      </div>
    </div>
  `;
  area.innerHTML = '';
  area.appendChild(wrap);
}

function buildLadderSynthesis(card) {
  const { phase, stage, prep } = ladderPositionInPhase(card);
  const area = document.getElementById('synthesisArea');
  area.style.display = 'block';
  const standingText = `You are standing in Phase ${phase.num} — ${phase.name}, ${prep} ${stage} this phase. ${phase.desc}`;
  const askText = `This rung is asking ${card.tested_quality ? 'you to work with ' + card.tested_quality.toLowerCase() : 'something specific of you'}: ${stripTestingPrefix(card.grounded_where_v2 || card.grounded_where)}`;
  const nextText = phase.num < 5
    ? `Phase ${phase.num + 1} — ${PHASES.find(p => p.num === phase.num + 1).name} — waits beyond this one, but it isn't yours to reach for yet. The work is here.`
    : `There is no further phase beyond this one. The work at this rung is embodiment, not arrival.`;

  area.innerHTML = `
    <div class="synth-header">
      <div class="synth-diamond">✦</div>
      <div class="synth-title">Your Standing</div>
      <div class="synth-rule"></div>
    </div>
    <div class="synth-block">
      <div class="synth-section">
        <div class="synth-label">The Rung</div>
        <div class="synth-text">${standingText}</div>
      </div>
      <div class="synth-section">
        <div class="synth-label">What It's Asking</div>
        <div class="synth-text">${askText}</div>
      </div>
      <div class="synth-section">
        <div class="synth-label">Beyond This Rung</div>
        <div class="synth-text">${nextText}</div>
      </div>
    </div>
  `;
  renderPersonalizeBox(card, 'synthesisArea');
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('drawBtn').addEventListener('click', () => {
  document.getElementById('manualError').textContent = '';
  if (CARDS.length === 0) {
    document.getElementById('manualError').textContent = 'Card data is still loading — wait a moment and try again.';
    return;
  }
  if (PREMIUM_SPREADS.has(currentSpread) && !isSubscribed()) {
    openPaywall();
    return;
  }
  if (currentSpread === 'ladder') {
    const [card] = shuffleDraw(1);
    renderLadder(card);
    setTimeout(() => buildLadderSynthesis(card), 400);
    return;
  }
  const n = currentSpread;
  const drawn = shuffleDraw(n);
  renderSpread(drawn);
  setTimeout(() => buildSynthesis(drawn), n * 80 + 300);
});

document.getElementById('manualBtn').addEventListener('click', () => {
  if (CARDS.length === 0) {
    document.getElementById('manualError').textContent = 'Card data is still loading — wait a moment and try again.';
    return;
  }
  if (PREMIUM_SPREADS.has(currentSpread) && !isSubscribed()) {
    openPaywall();
    return;
  }
  const cards = readManualCards();
  if (!cards) return;
  if (currentSpread === 'ladder') {
    renderLadder(cards[0]);
    setTimeout(() => buildLadderSynthesis(cards[0]), 300);
    return;
  }
  renderSpread(cards);
  setTimeout(() => buildSynthesis(cards), cards.length * 80 + 200);
});

// ── Google Play Billing wiring ──────────────────────────────────────────
document.getElementById('paywall-subscribe').addEventListener('click', () => {
  const btn = document.getElementById('paywall-subscribe');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Processing…';
  window.AscendBilling.subscribe()
    .catch(err => {
      alert(err && err.message ? err.message : 'Purchase could not be started. Please try again.');
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = original;
    });
});
document.getElementById('paywall-cancel').addEventListener('click', closePaywall);
document.getElementById('paywall-restore').addEventListener('click', () => {
  const btn = document.getElementById('paywall-restore');
  const original = btn.textContent;
  btn.textContent = 'Checking…';
  btn.disabled = true;
  window.AscendBilling.restore()
    .then(() => {
      if (isSubscribed()) closePaywall();
      else alert("No active subscription found for this Google account.");
    })
    .catch(err => {
      alert(err && err.message ? err.message : 'Could not restore purchases.');
    })
    .finally(() => {
      btn.textContent = original;
      btn.disabled = false;
    });
});

window.AscendBilling.onStatusChange(val => {
  subscribed = val;
  renderSubStatus();
  if (val) closePaywall();
});
try {
  window.AscendBilling.init();
} catch (e) {
  console.error('AscendBilling.init() failed:', e);
}
renderSubStatus();

fetch('ascend_cards.json')
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    if (!data || !Array.isArray(data.cards) || data.cards.length === 0) {
      throw new Error('Card data came back empty or malformed');
    }
    CARDS = data.cards;
    PHASES = data.phases;
    initSelector();
    updateDesc();
    renderManualInputs();
  })
  .catch(err => {
    document.getElementById('spreadDesc').innerHTML =
      '<span style="color:#e0a0a0;">Card data failed to load (' + err.message + '). ' +
      'Try refreshing — if it keeps happening, the deployed ascend_cards.json is likely missing or corrupted.</span>';
    console.error('Card data load failed:', err);
  });
