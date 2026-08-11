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
  { key: 'seasonal', count: 4, label: 'Seasonal Attunement', sub: 'A four-direction reading tuned to where you are in the yearly cycle.', free: false },
  { key: 'octave', count: 8, label: 'The Octave', sub: 'Do, re, mi... where a process actually completes, or quietly drifts.', free: false },
];
const POSITIONS = {
  three: ['Grounded In', 'Moving Through', 'Opening Toward'],
  five: ['Foundation', 'Friction', 'Turning Point', 'Integration', 'Emerging Direction'],
  // The Octave — Gurdjieff's Law of Seven. A process moves through 8 steps,
  // do-re-mi-fa-sol-la-ti-do, but the interval between mi-fa and between
  // ti-do is too small to bridge on its own momentum; without an outside
  // "shock" entering right at that gap, the process quietly drifts off its
  // original line. Positions 4 and 8 are that shock -- see pickOctave().
  octave: ['The Impulse', 'First Movement', 'Where It Starts to Waver', 'The Outside Force',
           'Renewed Momentum', 'Sustained Effort', 'The Threshold', 'The Higher Octave'],
};
// The literal do-re-mi-fa-sol-la-ti-do steps, shown alongside the octave's
// poetic position names so the Law of Seven structure is visible, not just
// implied by the card itself.
const OCTAVE_NOTES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti', "Do'"];
const HUES = { 1: 238, 2: 266, 3: 294, 4: 322, 5: 38 };
const WILDCARD_HUE = 85; // distinct warm gold — not one of the 5 phase hues

// ── BONUS / WILDCARD DECK (12 cards) ────────────────────────────────────
// Unnumbered, outside the core 108 (num 1001+ is just an internal unique
// key — never shown in the UI). Eligible in every spread's random draw,
// since every spread here is a free-draw spread (no fixed-position
// protocol referencing exact core-deck numbers exists in this app).
// phase: null marks a card as a wildcard everywhere phase is checked
// (hue/color, phase name, the "№ N ·" reading header).
const WILDCARD_CARDS = [
  { num: 1001, phase: null, isWildcard: true, title: 'The Digital Boundary', phrase: 'Presence is chosen, not defaulted into', breathing: '4-6 count (the rhythm of conscious withdrawal)',
    tested_quality: 'Reclaiming Attention', grounded_where: 'Something pulling your focus in small, constant pieces rather than one big distraction.',
    grounded_supported: 'You notice the pull before you act on it, and choose where your attention actually goes.',
    grounded_resisted: 'Reaching for the phone/screen as a reflex to avoid an uncomfortable feeling underneath.',
    spirit_title: 'The Quiet Channel', interpretation: "The noise you let in shapes the noise you generate. Silence is not empty — it's where signal becomes audible.",
    spirit_supported: 'Real insight arriving in the gaps you left unfilled.', spirit_resisted: 'Mistaking constant stimulation for aliveness.' },

  { num: 1002, phase: null, isWildcard: true, title: 'The Creative Threshold', phrase: 'The block is a door, not a wall', breathing: '6-6 count (the rhythm of even patience)',
    tested_quality: 'Working Through Resistance', grounded_where: 'The gap between wanting to make something and actually starting.',
    grounded_supported: 'Starting badly on purpose, letting the first attempt be rough so momentum can build.',
    grounded_resisted: 'Waiting for the "right" moment or perfect idea before beginning anything.',
    spirit_title: 'The Unmade Form', interpretation: "What wants to come through you isn't fully yours — you're a channel it moves through, not its sole author.",
    spirit_supported: "Trusting the work before you can see where it's going.", spirit_resisted: 'Gripping the outcome so tightly nothing new can enter.' },

  { num: 1003, phase: null, isWildcard: true, title: 'The Flow Of Resources', phrase: "Abundance circulates, it doesn't accumulate", breathing: '5-3 count (the rhythm of open hands)',
    tested_quality: 'Financial Clarity', grounded_where: 'Your actual relationship to money right now — not what you wish it was.',
    grounded_supported: 'Making a decision about money from clarity instead of fear or avoidance.',
    grounded_resisted: 'Either hoarding out of scarcity or spending to numb anxiety about scarcity.',
    spirit_title: 'The River, Not The Reservoir', interpretation: 'What you have is meant to move — held too tightly, even good fortune stagnates.',
    spirit_supported: 'Giving or receiving without keeping score.', spirit_resisted: 'Equating your worth with your net worth.' },

  { num: 1004, phase: null, isWildcard: true, title: 'The Unfinished Grief', phrase: 'What was loved leaves a shape that stays', breathing: '4-8 count (the rhythm of slow release)',
    tested_quality: 'Sitting With Loss', grounded_where: "A loss — of a person, a phase, a version of yourself — that hasn't been fully felt yet.",
    grounded_supported: 'Letting the grief move through you in its own time, without rushing to "get over it."',
    grounded_resisted: 'Staying busy specifically to avoid the feeling underneath.',
    spirit_title: 'The Sacred Wound', interpretation: "Grief is love with nowhere left to go — it doesn't need fixing, it needs witness.",
    spirit_supported: 'Finding that the ache softens into tenderness rather than staying sharp.', spirit_resisted: "Believing that feeling better means the loss didn't matter." },

  { num: 1005, phase: null, isWildcard: true, title: 'The Permission To Rest', phrase: 'Stillness is productive too', breathing: '4-4 count (the rhythm of simple rest)',
    tested_quality: 'Rest as Resistance', grounded_where: "Your body or mind signaling a need to stop that you've been overriding.",
    grounded_supported: 'Resting before exhaustion forces it, treating rest as maintenance, not reward.',
    grounded_resisted: "Only allowing rest after collapse, or feeling guilty when you're not producing.",
    spirit_title: 'The Fallow Field', interpretation: "Nothing grows in a field that's never left alone. Dormancy is part of the cycle, not a failure of it.",
    spirit_supported: "Trusting that nothing is being lost while you're still.", spirit_resisted: "Confusing stillness with stagnation and forcing motion you're not ready for." },

  { num: 1006, phase: null, isWildcard: true, title: 'The Unguarded Laugh', phrase: 'Lightness is not the opposite of depth', breathing: '3-3 count (the rhythm of easy breath)',
    tested_quality: 'Joy Without Justification', grounded_where: "A moment of genuine lightness that doesn't need to be earned or explained.",
    grounded_supported: 'Letting yourself enjoy something fully, without immediately looking for the catch.',
    grounded_resisted: 'Treating seriousness as more spiritually valid than play.',
    spirit_title: 'The Cosmic Joke', interpretation: 'Even the most sacred systems contain absurdity — the ability to laugh at yourself is a sign of real humility.',
    spirit_supported: 'Holding your own process lightly enough to keep going.', spirit_resisted: 'Taking your own spiritual identity so seriously it becomes rigid.' },

  { num: 1007, phase: null, isWildcard: true, title: 'The Slow Unfolding', phrase: 'Not everything ready is finished', breathing: '7-7 count (the rhythm of long patience)',
    tested_quality: 'Patience With Timing', grounded_where: 'Something progressing slower than you want it to.',
    grounded_supported: 'Continuing to show up for a process without demanding it speed up.',
    grounded_resisted: 'Forcing a premature outcome because waiting feels unbearable.',
    spirit_title: 'The Long Arc', interpretation: 'Some transformations are geological, not immediate — measured in seasons, not days.',
    spirit_supported: "Feeling settled inside a timeline you don't fully control.", spirit_resisted: 'Interpreting slowness as a sign that something is wrong.' },

  { num: 1008, phase: null, isWildcard: true, title: 'The Honest Voice', phrase: 'The unspoken word costs more than the spoken one', breathing: '5-5 count (the rhythm of steady courage)',
    tested_quality: 'Saying the True Thing', grounded_where: "A truth you've been softening, delaying, or avoiding saying out loud.",
    grounded_supported: "Speaking clearly and kindly, even when it's uncomfortable.",
    grounded_resisted: 'Staying silent to keep the peace at the cost of honesty.',
    spirit_title: 'The Word That Creates', interpretation: 'What you speak shapes what becomes real — silence around truth lets distortion take root.',
    spirit_supported: 'Your words matching your actual internal state.', spirit_resisted: 'Performing agreement while privately resenting it.' },

  { num: 1009, phase: null, isWildcard: true, title: 'The Release Of Blame', phrase: 'Forgiveness is a door you open from your own side', breathing: '6-4 count (the rhythm of letting down the guard)',
    tested_quality: 'Self-Forgiveness', grounded_where: "A mistake or failure you're still punishing yourself for.",
    grounded_supported: "Extending yourself the same understanding you'd give a friend in the same situation.",
    grounded_resisted: 'Using self-criticism as a substitute for actual change.',
    spirit_title: 'The Unclenched Fist', interpretation: 'Holding resentment — toward yourself or another — keeps you tied to the very thing you want to be free of.',
    spirit_supported: 'Feeling the grip loosen, not because the event stopped mattering, but because it stopped controlling you.', spirit_resisted: 'Mistaking forgiveness for approval of what happened.' },

  { num: 1010, phase: null, isWildcard: true, title: 'The Signal In The Noise', phrase: 'Clarity is subtraction, not addition', breathing: '4-4-4 count (the rhythm of centered stillness)',
    tested_quality: 'Cutting Through Confusion', grounded_where: 'Too many inputs, opinions, or options making a simple decision feel complicated.',
    grounded_supported: 'Removing options until only the true priority remains visible.',
    grounded_resisted: 'Adding more research or advice instead of trusting what you already know.',
    spirit_title: 'The Still Point', interpretation: 'Underneath every noisy question is a quiet, already-known answer.',
    spirit_supported: 'Recognizing the answer that was there before you asked.', spirit_resisted: 'Drowning out your own knowing with outside noise.' },

  { num: 1011, phase: null, isWildcard: true, title: 'The Generous Field', phrase: 'What circulates freely returns amplified', breathing: '5-7 count (the rhythm of expansive giving)',
    tested_quality: 'Practical Abundance', grounded_where: 'An opportunity to give — time, resources, attention — without depleting yourself.',
    grounded_supported: 'Giving from surplus and genuine want-to, not obligation.',
    grounded_resisted: 'Over-giving to the point of resentment or burnout.',
    spirit_title: 'The Overflowing Cup', interpretation: "True abundance isn't about having more — it's about the cup being full enough to spill.",
    spirit_supported: 'Feeling that generosity costs you nothing real.', spirit_resisted: 'Giving as a way to earn worth or avoid guilt.' },

  { num: 1012, phase: null, isWildcard: true, title: 'The Light Touch', phrase: 'Hold it loosely and it will hold together', breathing: '3-6 count (the rhythm of relaxed control)',
    tested_quality: 'Loosening the Grip', grounded_where: 'Something you’ve been trying to control that would benefit from being held more loosely.',
    grounded_supported: 'Doing your part fully, then releasing attachment to the exact outcome.',
    grounded_resisted: 'Micromanaging a process or person out of fear of what happens if you let go.',
    spirit_title: 'The Open Hand', interpretation: 'Grasping creates friction; open hands let things move as they need to.',
    spirit_supported: 'Trusting a larger intelligence in the unfolding.', spirit_resisted: 'Equating control with safety.' },
];
function findCardByNum(num) { return CARDS.find(c => c.num === num) || WILDCARD_CARDS.find(c => c.num === num); }

// ── SEASONAL ATTUNEMENT — position labels and closing synthesis are fixed ──
// per season (not generated), position order is always East → South →
// West → North. Season defaults from the device's calendar date but is
// user-overridable on the Drawing step.
const SEASONS = {
  spring: { label: 'Spring – Awakening', positions: ['Dawn', 'Growth', 'Expansion', 'Foundation'] },
  summer: { label: 'Summer – Radiance', positions: ['Peak Energy', 'Full Expression', 'Sharing Light', 'Grounded Power'] },
  autumn: { label: 'Autumn – Harvest', positions: ['Wisdom Gathered', 'Balance Achieved', 'Letting Go', 'Deep Roots'] },
  winter: { label: 'Winter – Contemplation', positions: ['Inner Light', 'Quiet Strength', 'Deep Rest', 'Hidden Wisdom'] },
};
const SEASON_SYNTHESIS = {
  spring: "What's emerging (East) needs the growth you're already in motion with (South) to take real shape — but check it against what's actually beautiful/working right now (West), not just what's new. North tells you what's holding the whole thing up; if that foundation is shaky, slow the emergence down until it's solid.",
  summer: "You're at peak output right now (East), and South shows what that peak looks like when fully expressed — not held back. West is where that energy is meant to go, who or what it's for. But North is the check: without that grounded power, the intensity burns out. Read North as your limit, not your fuel.",
  autumn: "East shows what you've actually learned this cycle — not what you hoped to learn. South is whether things are in balance now, honestly. West is the hardest position: what has to be let go for the harvest to be worth anything. North is what survives the release — the root system that carries you into winter.",
  winter: "East and South are internal — the quiet truth you're sitting with and the strength that's actually holding you, not performing strength. West says where you need real rest, not distraction. North is the one to watch: something is forming under the surface that isn't ready to be named yet. Don't force it into words too early.",
};
function currentSeasonKey() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}
function seasonalSynthesisText() {
  return { headline: SEASONS[selectedSeason].label, sub: null, takeaway: SEASON_SYNTHESIS[selectedSeason] };
}

function hueFor(phaseNum) { return phaseNum == null ? WILDCARD_HUE : (HUES[phaseNum] ?? 264); }
function colorFor(phaseNum) { return `oklch(0.65 0.1 ${hueFor(phaseNum)})`; }

// Design trend #1: phase-tinted ambient background. Reuses the same
// per-phase hue already driving the dots/edges/breath-timer color — just
// applied, very faintly, to the whole screen's background while a card is
// actually being read. Everywhere else falls back to the original neutral
// gold tint. No CSS transition on this: animating a gradient's color via a
// custom property doesn't reliably interpolate across WebView versions, it
// just snaps either way — safer to accept the instant swap than ship a
// "transition" that silently does nothing (or worse, stutters) on some
// devices.
const DEFAULT_PHASE_TINT = 'rgba(var(--gold-rgb),.08)';
function applyPhaseTint() {
  let tint = DEFAULT_PHASE_TINT;
  if (screen === 'reading' && drawnCards[cardIndex]) {
    tint = `oklch(0.65 0.1 ${hueFor(drawnCards[cardIndex].phase)} / 0.09)`;
  }
  document.documentElement.style.setProperty('--phase-tint', tint);
}
function phaseNameFor(phaseNum) {
  if (phaseNum == null) return 'Wildcard';
  const p = PHASES.find(x => x.num === phaseNum);
  return p ? p.name : '';
}
function spreadByKey(key) { return SPREADS.find(s => s.key === key); }

// ── RESONANCE ENGINE ────────────────────────────────────────────────────
// Deterministic, explainable weighted-random draw logic — no AI, no
// network, nothing beyond arithmetic over a local history log. Five pieces:
//  1. Recency weighting — a card drawn recently is less likely to come up
//     again until the weighting window (RECENCY_WINDOW draws) passes.
//  2. Phase-fairness weighting — phases under-represented relative to their
//     natural share of the deck get a boost, over-represented phases get
//     dampened, computed from the user's own draw history.
//  3. Phase-arc guarantees — Five/Nine Card Draw ("a fuller arc across the
//     phases" / "the full ascent, phase by phase") sample a fixed quota
//     from each phase in ascending order instead of leaving coverage to
//     chance, so the spread actually delivers the structure its label
//     promises every time.
//  4. Breath-category tilt — cards whose breath pattern is "grounding"
//     (longer exhale) are weighted up slightly at night, "expansive"
//     (longer inhale) cards by day, tying Day/Night mode to what actually
//     gets drawn instead of just how the screen looks.
//  5. Quality diversity — within one multi-card draw, a tested_quality
//     that's already appeared is avoided on later picks when an
//     alternative exists, so a spread reads as several distinct angles
//     rather than the same lesson twice by coincidence.
// Falls back to neutral weights (equivalent to the old pure Math.random())
// whenever there's no history yet — first launch, cleared storage, or a
// failed localStorage write all degrade to the same safe default.
const DRAW_HISTORY_KEY = 'ascend_draw_history';
const DRAW_HISTORY_MAX = 200;
const RECENCY_WINDOW = 16;
const FAIRNESS_WINDOW = 60;

function loadDrawHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAW_HISTORY_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}
function recordDraw(cards) {
  try {
    const history = loadDrawHistory();
    const now = Date.now();
    cards.forEach(c => history.push({ num: c.num, phase: c.phase == null ? null : c.phase, ts: now }));
    const trimmed = history.slice(-DRAW_HISTORY_MAX);
    localStorage.setItem(DRAW_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {}
}

// Weight 1 = neutral. A card drawn `d` draws ago (1 = last draw) is
// weighted down toward .15 and recovers linearly back to 1 by the time
// RECENCY_WINDOW draws have passed since it last appeared.
function recencyWeight(num, history) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].num === num) {
      const d = history.length - i; // draws ago, 1 = immediately previous draw
      if (d >= RECENCY_WINDOW) return 1;
      return 0.15 + 0.85 * (d / RECENCY_WINDOW);
    }
  }
  return 1; // never drawn
}

// bucketKey: a phase number (1-5) or the sentinel 'wildcard'. Compares the
// bucket's natural share of the full pool against how often it's actually
// come up in the last FAIRNESS_WINDOW draws, boosting under-drawn phases
// and damping over-drawn ones. Needs a handful of data points before it
// asserts anything — returns neutral (1) until then.
function phaseFairnessWeight(bucketKey, history) {
  const recent = history.slice(-FAIRNESS_WINDOW);
  if (recent.length < 6) return 1;
  const naturalShare = bucketKey === 'wildcard'
    ? WILDCARD_CARDS.length / (CARDS.length + WILDCARD_CARDS.length)
    : (PHASES.find(p => p.num === bucketKey)?.range
        ? (PHASES.find(p => p.num === bucketKey).range[1] - PHASES.find(p => p.num === bucketKey).range[0] + 1) / CARDS.length
        : 1 / 5);
  const matches = bucketKey === 'wildcard'
    ? recent.filter(e => e.phase == null).length
    : recent.filter(e => e.phase === bucketKey).length;
  const actualShare = matches / recent.length;
  if (actualShare === 0) return 1.6; // never seen recently — strong boost, clamped below anyway
  const ratio = naturalShare / actualShare;
  return Math.max(0.5, Math.min(1.8, ratio));
}

// Reuses parseBreathPhases/breathCategoryFor (defined below, function
// declarations are hoisted) to classify ANY card's breath pattern purely
// for weighting purposes -- no separate tagging needed. Grounding cards
// (longer exhale) lean in at night, expansive cards (longer inhale) lean
// in by day; natural-rhythm cards and balance cards stay neutral.
function breathTiltWeight(card) {
  const phases = parseBreathPhases(card);
  if (!phases) return 1;
  const category = breathCategoryFor(phases);
  const eff = effectiveThemeMode();
  if (eff === 'night' && category === 'grounding') return 1.15;
  if (eff === 'day' && category === 'expansive') return 1.15;
  return 1;
}

// Wraps a weight function so any card whose tested_quality is already in
// `usedQualities` gets zeroed out -- unless doing so would zero out every
// remaining card, in which case it backs off entirely. Phase/wildcard
// representation always wins over quality uniqueness when they conflict.
function withQualityAvoidance(entries, baseWeightFn, usedQualities) {
  const anyFresh = entries.some(c => !usedQualities.has(c.tested_quality));
  if (!anyFresh) return baseWeightFn;
  return c => (usedQualities.has(c.tested_quality) ? 0 : baseWeightFn(c));
}

// Picks one card out of `entries` (mutates it via splice) using the given
// per-card weight function. Falls back to uniform if every weight is 0.
function weightedSplicePick(entries, weightFn) {
  const weights = entries.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let threshold = total > 0 ? Math.random() * total : Math.random() * entries.length;
  let idx = entries.length - 1;
  for (let i = 0; i < entries.length; i++) {
    threshold -= total > 0 ? weights[i] : 1;
    if (threshold <= 0) { idx = i; break; }
  }
  return entries.splice(idx, 1)[0];
}

function pickSingleWeighted(pool, history) {
  const entries = [...pool];
  return weightedSplicePick(entries, c =>
    recencyWeight(c.num, history) * phaseFairnessWeight(c.phase == null ? 'wildcard' : c.phase, history) * breathTiltWeight(c));
}

// Generic multi-pick with no phase structure (used for Seasonal Attunement,
// which has its own position labels but no phase-arc premise to honor).
function pickManyWeighted(pool, n, history) {
  const entries = [...pool];
  const picked = [];
  const usedQualities = new Set();
  for (let i = 0; i < n && entries.length; i++) {
    const base = c => recencyWeight(c.num, history) * phaseFairnessWeight(c.phase == null ? 'wildcard' : c.phase, history) * breathTiltWeight(c);
    const card = weightedSplicePick(entries, withQualityAvoidance(entries, base, usedQualities));
    usedQualities.add(card.tested_quality);
    picked.push(card);
  }
  return picked;
}

// quota: [[phaseNum, count], ...] in the order they should appear in the
// reading. Pulls exactly `count` cards from that phase only (recency- and
// breath-weighted, no wildcards) — this is what makes "the full ascent,
// phase by phase" a guarantee instead of a coincidence. usedQualities is
// shared across the whole draw (caller passes one Set through every phase)
// so quality diversity holds across phases, not just within one.
function pickPhaseArc(quota, history, usedQualities) {
  usedQualities = usedQualities || new Set();
  const picked = [];
  quota.forEach(([phaseNum, count]) => {
    const entries = CARDS.filter(c => c.phase === phaseNum);
    for (let i = 0; i < count && entries.length; i++) {
      const base = c => recencyWeight(c.num, history) * breathTiltWeight(c);
      const card = weightedSplicePick(entries, withQualityAvoidance(entries, base, usedQualities));
      usedQualities.add(card.tested_quality);
      picked.push(card);
    }
  });
  return picked;
}

// Picks `n` distinct buckets (the 5 phases + a wildcard bucket) weighted by
// phase-fairness, then one recency/breath-weighted card from each chosen
// bucket — guarantees a Three Card Draw reads as three different angles
// instead of three cards that happen to land in the same phase.
function pickDiverseBuckets(n, history, usedQualities) {
  usedQualities = usedQualities || new Set();
  const buckets = [1, 2, 3, 4, 5, 'wildcard'];
  const remaining = [...buckets];
  const pickedBuckets = [];
  for (let i = 0; i < n && remaining.length; i++) {
    pickedBuckets.push(weightedSplicePick(remaining, b => phaseFairnessWeight(b, history)));
  }
  return pickedBuckets.map(b => {
    const entries = b === 'wildcard' ? [...WILDCARD_CARDS] : CARDS.filter(c => c.phase === b);
    const base = c => recencyWeight(c.num, history) * breathTiltWeight(c);
    const card = weightedSplicePick(entries, withQualityAvoidance(entries, base, usedQualities));
    usedQualities.add(card.tested_quality);
    return card;
  });
}

// Law of Three (Gurdjieff): every phenomenon arises from an active force,
// a passive/resisting force, and a third reconciling force. Every card's
// grounded_supported/grounded_resisted pair already IS an active/passive
// pole -- no new tagging needed. Reorders 3 already-picked cards (from
// pickDiverseBuckets) into that triad: a Wildcard, if present, is the
// disruptive/resisting force and takes the middle position; the remaining
// cards fill the outer positions in ascending phase order (lower phase =
// the initiating/active position, higher phase = the reconciling one).
function orderTriad(cards) {
  const wildcardIdx = cards.findIndex(c => c.isWildcard);
  if (wildcardIdx === -1) {
    return [...cards].sort((a, b) => a.phase - b.phase);
  }
  const wildcard = cards[wildcardIdx];
  const others = cards.filter((_, i) => i !== wildcardIdx).sort((a, b) => a.phase - b.phase);
  return [others[0], wildcard, others[1]];
}

// The Octave (Gurdjieff's Law of Seven): a process moves through 8 steps,
// do-re-mi-fa-sol-la-ti-do, but the gap between mi-fa and between ti-do is
// too small to bridge on its own momentum -- without an outside "shock"
// entering right at that gap, the process drifts off its original line.
// The Wildcard deck is already, everywhere else in this app, defined as
// outside the five-phase structure -- so positions 4 (fa) and 8 (the
// higher do) are guaranteed Wildcards, the structural shock. The other 6
// steps pull from the core phases in ascending order (do-re-mi, then
// sol-la-ti), with the 6th slot -- the one phase that has to double up --
// assigned to whichever phase is currently most under-represented in the
// user's own history, so even the "extra" slot isn't arbitrary.
function pickOctave(history) {
  const usedQualities = new Set();
  const basePhases = [1, 2, 3, 4, 5];
  let extraPhase = basePhases[0], bestWeight = -Infinity;
  basePhases.forEach(p => {
    const w = phaseFairnessWeight(p, history);
    if (w > bestWeight) { bestWeight = w; extraPhase = p; }
  });
  const counts = {};
  basePhases.forEach(p => { counts[p] = 1; });
  counts[extraPhase] += 1;
  const quota = Object.keys(counts).map(Number).sort((a, b) => a - b).map(p => [p, counts[p]]);
  const phaseCards = pickPhaseArc(quota, history, usedQualities); // 6 cards, ascending phase order

  const wildcardPool = [...WILDCARD_CARDS];
  const wcBase = c => recencyWeight(c.num, history) * breathTiltWeight(c);
  const fa = weightedSplicePick(wildcardPool, withQualityAvoidance(wildcardPool, wcBase, usedQualities));
  usedQualities.add(fa.tested_quality);
  const higherDo = weightedSplicePick(wildcardPool, withQualityAvoidance(wildcardPool, wcBase, usedQualities));

  return [phaseCards[0], phaseCards[1], phaseCards[2], fa, phaseCards[3], phaseCards[4], phaseCards[5], higherDo];
}

// ── STATE ────────────────────────────────────────────────────────────────

// ── SAVED CARDS (Stage 2) ───────────────────────────────────────────────
const SAVED_CARDS_KEY = 'ascend_saved_cards';
function loadSavedCards() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_CARDS_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch (e) { return new Set(); }
}
function persistSavedCards() {
  try { localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify([...savedCardNums])); } catch (e) {}
}
function isCardSaved(num) { return savedCardNums.has(num); }
function toggleSaved(num) {
  if (savedCardNums.has(num)) savedCardNums.delete(num); else savedCardNums.add(num);
  persistSavedCards();
}

// ── DAY / NIGHT MODE ──────────────────────────────────────────────────────
// Auto by device clock (day: 6am-6pm local time) with a manual override the
// user can cycle through a header toggle. No background time-tracking —
// re-evaluated only when applyThemeMode() runs (on render and on toggle tap).
const THEME_MODE_KEY = 'ascend_theme_mode';
function loadThemeMode() {
  const raw = localStorage.getItem(THEME_MODE_KEY);
  return (raw === 'day' || raw === 'night') ? raw : 'auto';
}
function persistThemeMode(mode) {
  try { localStorage.setItem(THEME_MODE_KEY, mode); } catch (e) {}
}
function isDaytime() {
  const h = new Date().getHours();
  return h >= 6 && h < 18;
}
function effectiveThemeMode() {
  return themeMode === 'auto' ? (isDaytime() ? 'day' : 'night') : themeMode;
}
function applyThemeMode() {
  document.documentElement.setAttribute('data-mode', effectiveThemeMode());
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  const eff = effectiveThemeMode();
  const glyph = eff === 'day' ? '&#9728;' : '&#9790;';
  const label = themeMode === 'auto' ? 'AUTO' : (themeMode === 'day' ? 'DAY' : 'NIGHT');
  btn.innerHTML = glyph + ' ' + label;
}
function cycleThemeMode() {
  themeMode = themeMode === 'auto' ? 'day' : (themeMode === 'day' ? 'night' : 'auto');
  persistThemeMode(themeMode);
  applyThemeMode();
}
let themeMode = loadThemeMode();

// ── JOURNAL (Stage 4) ────────────────────────────────────────────────────
const JOURNAL_KEY = 'ascend_journal_entries';
function loadJournalEntries() {
  try {
    const raw = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}
function persistJournalEntries() {
  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(journalEntries)); } catch (e) {}
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

let journalEntries = loadJournalEntries();
let currentJournalId = null; // ties Save-Entry on Synthesis to one entry per draw, not a new row per click

let savedCardNums = loadSavedCards();
let subscribed = false;
let screen = 'splash'; // splash | intro | home | reading | synthesis | saved | journal — always opens on splash
let expandedKey = null; // which spread row is expanded inline on Home
let pendingUnlockKey = null; // spread waiting on a verified purchase before drawing
let spreadKey = null;
let drawnCards = [];
let cardIndex = 0;
let activeTab = 'grounded';
let readingPreviewOnly = false; // true when opened from Saved Cards, not a live draw
let reviewingReading = false; // true when stepping back into a just-drawn reading from Synthesis
let revealCard = null; // card pending a hold-to-reveal, single-card draws only
const REVEAL_HOLD_MS = 2000;

function beginReveal(card) {
  revealCard = card;
  screen = 'revealing';
  render();
}
let selectedSeason = currentSeasonKey(); // Seasonal Attunement — user-overridable on the Drawing step

// ── TESTER UNLOCK ────────────────────────────────────────────────────────
// A hidden way for internal testers to access every spread without going
// through a real Google Play purchase. Tap the "ASCEND KEYS" wordmark 5
// times within 3 seconds to bring up a code prompt. Purely a local flag —
// never touches AscendBilling/`subscribed`, so it can't be confused with a
// real purchase.
const TESTER_ACCESS_CODE = 'ASCEND2026';
const TESTER_UNLOCK_KEY = 'ascend_tester_unlock';
function loadTesterUnlock() {
  try { return localStorage.getItem(TESTER_UNLOCK_KEY) === 'true'; } catch (e) { return false; }
}
let testerUnlocked = loadTesterUnlock();
let wordmarkTapCount = 0;
let wordmarkTapTimer = null;
function handleWordmarkTap() {
  wordmarkTapCount += 1;
  clearTimeout(wordmarkTapTimer);
  wordmarkTapTimer = setTimeout(() => { wordmarkTapCount = 0; }, 3000);
  if (wordmarkTapCount >= 5) {
    wordmarkTapCount = 0;
    const entered = prompt('Tester access code:');
    if (entered && entered.trim().toUpperCase() === TESTER_ACCESS_CODE) {
      testerUnlocked = true;
      try { localStorage.setItem(TESTER_UNLOCK_KEY, 'true'); } catch (e) {}
      alert('Tester access unlocked — every spread is now free on this device.');
      render();
    } else if (entered !== null) {
      alert('Not a valid code.');
    }
  }
}

function isSubscribed() { return subscribed || testerUnlocked; }

function goHome() {
  screen = 'home'; spreadKey = null; drawnCards = []; cardIndex = 0; expandedKey = null; readingPreviewOnly = false; reviewingReading = false;
  render();
}

// Lets someone step back into the cards they just drew from the Synthesis
// screen -- previously the only path off Synthesis was NEW READING, which
// discarded the draw entirely with no way to re-read it. reviewingReading
// makes BACK on the first card return to Synthesis instead of abandoning
// the draw to Home; forward navigation (NEXT CARD / SEE SYNTHESIS) already
// works unchanged since drawnCards was never cleared.
function reviewReading() {
  reviewingReading = true;
  cardIndex = 0; activeTab = 'grounded'; screen = 'reading';
  render();
}

function goToJournalHistory() {
  screen = 'journal';
  render();
}

function saveJournalEntry() {
  const textarea = document.getElementById('journalText');
  const text = textarea.value.trim();
  const statusEl = document.getElementById('journalStatus');
  if (!text) {
    if (statusEl) { statusEl.textContent = 'Write something first.'; statusEl.classList.add('warn'); }
    return;
  }
  if (currentJournalId) {
    const entry = journalEntries.find(e => e.id === currentJournalId);
    if (entry) { entry.text = text; entry.timestamp = Date.now(); }
  } else {
    const s = spreadByKey(spreadKey);
    const entry = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      cardNums: drawnCards.map(c => c.num),
      cardTitles: drawnCards.map(c => c.title),
      spreadLabel: s ? s.label : '',
      text,
    };
    journalEntries.unshift(entry);
    currentJournalId = entry.id;
  }
  persistJournalEntries();
  if (statusEl) { statusEl.textContent = 'Saved'; statusEl.classList.remove('warn'); }
}

function goToSavedCards() {
  screen = 'saved';
  render();
}

function openSavedCard(num) {
  const card = findCardByNum(num);
  if (!card) return;
  spreadKey = null; drawnCards = [card]; cardIndex = 0; activeTab = 'grounded'; readingPreviewOnly = true; reviewingReading = false;
  screen = 'reading';
  render();
}

// Set right before the intro->home transition so renderHome() can play a
// one-shot circular reveal expanding from wherever BEGIN actually was on
// screen; null the rest of the time so every later trip to Home (e.g. BACK
// from a fresh draw) gets the plain, standard .screen fade instead.
let introRevealOrigin = null;
// The app always opens on the intro screen, every launch -- without this
// flag the ripple would replay on every single BEGIN tap for the life of
// the install, not just the first time someone ever opens the app.
const INTRO_REVEAL_SEEN_KEY = 'ascend_intro_reveal_seen';
function hasSeenIntroReveal() { try { return localStorage.getItem(INTRO_REVEAL_SEEN_KEY) === 'true'; } catch (e) { return false; } }
function markIntroRevealSeen() { try { localStorage.setItem(INTRO_REVEAL_SEEN_KEY, 'true'); } catch (e) {} }

function beginFromIntro() {
  if (!hasSeenIntroReveal()) {
    const btn = document.getElementById('beginBtn');
    const screenEl = document.getElementById('screen');
    if (btn && screenEl) {
      const btnRect = btn.getBoundingClientRect();
      const screenRect = screenEl.getBoundingClientRect();
      introRevealOrigin = {
        x: (btnRect.left + btnRect.width / 2 - screenRect.left) + 'px',
        y: (btnRect.top + btnRect.height / 2 - screenRect.top) + 'px',
      };
    }
    markIntroRevealSeen();
  }
  goHome();
}

function toggleSpread(key) {
  expandedKey = expandedKey === key ? null : key;
  render();
}

function drawFor(key) {
  if (CARDS.length === 0) return;
  const s = spreadByKey(key);
  const history = loadDrawHistory();
  let picked;
  if (key === 'five') {
    // "A fuller arc across the phases" — one card per phase, guaranteed.
    picked = pickPhaseArc([[1, 1], [2, 1], [3, 1], [4, 1], [5, 1]], history);
  } else if (key === 'nine') {
    // "The full ascent, phase by phase" — every phase represented in
    // ascending order; Phase 1 (only 8 cards) gets 1 slot, the rest get 2.
    picked = pickPhaseArc([[1, 1], [2, 2], [3, 2], [4, 2], [5, 2]], history);
  } else if (key === 'octave') {
    // Gurdjieff's Law of Seven — see pickOctave() for the full mechanism.
    picked = pickOctave(history);
  } else if (key === 'three') {
    // Three distinct phases (or a wildcard), then reordered into Gurdjieff's
    // Law of Three: active force / resisting force / reconciling force.
    // See orderTriad() — every card's supported/resisted pair already IS
    // that active/passive polarity, this just puts them in the right seats.
    picked = orderTriad(pickDiverseBuckets(3, history));
  } else if (s.count === 1) {
    picked = [pickSingleWeighted([...CARDS, ...WILDCARD_CARDS], history)];
  } else {
    // Seasonal Attunement: fixed position labels, no phase-arc premise to
    // honor, so a plain recency/fairness-weighted pick is enough.
    picked = pickManyWeighted([...CARDS, ...WILDCARD_CARDS], s.count, history);
  }
  recordDraw(picked);
  spreadKey = key; expandedKey = null; readingPreviewOnly = false; reviewingReading = false;
  currentJournalId = null; // fresh draw — Save Entry on Synthesis should create a new entry, not edit the last one
  if (s.count === 1) {
    // Single-card draws get the hold-to-reveal ritual; multi-card spreads
    // stay instant — holding through 5-9 cards in a row would be pure
    // friction, not ritual.
    beginReveal(picked[0]);
    return;
  }
  drawnCards = picked; screen = 'reading'; cardIndex = 0; activeTab = 'grounded';
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
  if (cardIndex > 0) { cardIndex -= 1; activeTab = 'grounded'; render(); return; }
  if (reviewingReading) { reviewingReading = false; screen = 'synthesis'; render(); return; }
  goHome(); // BACK on the first card of a fresh draw abandons it and returns to Home
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
  applyPhaseTint();
  applyThemeMode();
  document.getElementById('memberPill').style.display = isSubscribed() ? 'block' : 'none';
  const root = document.getElementById('screen');
  if (screen === 'splash') return renderSplash(root);
  if (screen === 'intro') return renderIntro(root);
  if (screen === 'home') return renderHome(root);
  if (screen === 'revealing') return renderRevealing(root);
  if (screen === 'reading') return renderReading(root);
  if (screen === 'synthesis') return renderSynthesis(root);
  if (screen === 'saved') return renderSavedCards(root);
  if (screen === 'journal') return renderJournalHistory(root);
}

// A brief, wordless splash — just the mark, opening outward from center via
// the same circular-reveal treatment BEGIN uses elsewhere — plays once on
// every cold start, then settles into the real Intro screen (tagline, body
// copy, BEGIN) automatically. No tap, no dismiss button: it's motion, not a
// gate. The actual "choose to begin" moment stays on Intro/BEGIN, unchanged.
let splashTimer = null;
const SPLASH_DURATION_MS = 800;
function renderSplash(root) {
  root.innerHTML = `
    <div class="screen splash screen-circle-reveal" style="--reveal-x:50%; --reveal-y:50%;">
      <div class="intro-logo"><img src="ascend-logo.png" alt=""></div>
      <div class="intro-mark">ASCEND KEYS</div>
    </div>`;
  if (splashTimer) clearTimeout(splashTimer);
  splashTimer = setTimeout(() => {
    splashTimer = null;
    if (screen === 'splash') { screen = 'intro'; render(); }
  }, SPLASH_DURATION_MS);
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

  const rows = SPREADS.map((s, i) => {
    const locked = !s.free && !isSubscribed();
    const expanded = expandedKey === s.key;
    const tag = s.free ? 'FREE' : (isSubscribed() ? 'INCLUDED' : 'MEMBERSHIP');
    // FREE stays gold; INCLUDED (already a member) gets its own teal so the
    // three tag states -- free / included / membership-locked -- are each
    // visually distinct rather than INCLUDED reading as a dimmer FREE.
    const tagColor = s.free ? 'var(--gold)' : (isSubscribed() ? 'var(--teal)' : 'rgba(var(--text-rgb),.45)');
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
          ${s.key === 'seasonal' ? `
          <div class="season-select-row">
            <label class="season-select-label" for="seasonSelect">Season</label>
            <select class="season-select" id="seasonSelect">
              ${Object.keys(SEASONS).map(k => `<option value="${k}" ${k === selectedSeason ? 'selected' : ''}>${SEASONS[k].label}</option>`).join('')}
            </select>
          </div>` : ''}
          <button class="btn-gold-block" id="drawBtn-${s.key}" data-key="${s.key}" ${CARDS.length === 0 ? 'disabled' : ''}>DRAW ${s.count} CARD${plural}</button>
          ${CARDS.length === 0 ? '<div class="locked-fineprint" style="color:#e0a0a0;margin-top:8px;">Card data failed to load.</div>' : ''}
        </div>`;

    return `
      <div class="spread-card ${expanded ? 'expanded' : ''}" data-key="${s.key}" style="--reveal-delay:${i * 70}ms">
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
      <div class="home-top-row">
        <div class="tagline">Practice, not prediction.</div>
        <div class="home-quick-links">
          <button class="saved-entry-btn" id="savedEntryBtn">&#9733; Saved${savedCardNums.size ? ' (' + savedCardNums.size + ')' : ''}</button>
          <button class="saved-entry-btn" id="journalEntryBtn">&#9998; Journal${journalEntries.length ? ' (' + journalEntries.length + ')' : ''}</button>
          <button class="saved-entry-btn" id="aboutEntryBtn">&#9432; About</button>
        </div>
      </div>
      <div class="section-label">Choose a spread</div>
      <div class="spread-list">${rows}</div>
      ${!isSubscribed() ? '<div style="text-align:center;margin-top:22px;"><button class="link-dim" id="restoreBtn">Already a member? Restore purchase</button></div>' : ''}
    </div>`;

  if (introRevealOrigin) {
    const screenDiv = root.querySelector('.screen.home');
    if (screenDiv) {
      screenDiv.style.setProperty('--reveal-x', introRevealOrigin.x);
      screenDiv.style.setProperty('--reveal-y', introRevealOrigin.y);
      screenDiv.classList.add('screen-circle-reveal');
    }
    introRevealOrigin = null;
  }

  // Spread cards fade+lift in as they cross into view, staggered via the
  // --reveal-delay each row already carries (set above, index * 70ms).
  // One-shot per card -- once revealed it stays revealed, no re-hiding on
  // scroll-away.
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  root.querySelectorAll('.spread-card').forEach(el => cardObserver.observe(el));

  document.getElementById('savedEntryBtn').addEventListener('click', goToSavedCards);
  document.getElementById('journalEntryBtn').addEventListener('click', goToJournalHistory);
  document.getElementById('aboutEntryBtn').addEventListener('click', openAboutModal);
  root.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => toggleSpread(el.getAttribute('data-toggle')));
  });
  root.querySelectorAll('[id^="drawBtn-"]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); drawFor(el.getAttribute('data-key')); });
  });
  const seasonSelect = document.getElementById('seasonSelect');
  if (seasonSelect) {
    seasonSelect.addEventListener('click', (e) => e.stopPropagation());
    seasonSelect.addEventListener('change', (e) => { e.stopPropagation(); selectedSeason = seasonSelect.value; });
  }
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
      <div class="grounded-sublabel grounded-supported-label"><span class="marker-dot marker-dot-supported"></span>When it's supported</div>
      <div class="grounded-subtext">${current.grounded_supported || ''}</div>
      <div class="grounded-sublabel grounded-resisted-label"><span class="marker-dot marker-dot-resisted"></span>When it's resisted</div>
      <div class="grounded-subtext" style="margin-bottom:0;">${current.grounded_resisted || ''}</div>
    </div>`;
}
function spiritPanelHtml(current) {
  // Core 108 cards end the Spirit tab with a Meditation line. The wildcard
  // deck instead mirrors the Grounded tab's Supported/Resisted structure
  // on the Spirit side too — different content shape, same visual pattern.
  const wildcardSpirit = current.spirit_supported && current.spirit_resisted;
  return `
    <div class="spirit-panel">
      <div class="spirit-glyph">&#10018;</div>
      ${current.spirit_title ? `<div class="spirit-title-label">${current.spirit_title}</div>` : ''}
      <div class="spirit-phrase">"${current.phrase}"</div>
      <div class="spirit-interp">${current.interpretation}</div>
      <div class="spirit-rule"></div>
      ${wildcardSpirit ? `
        <div class="spirit-sublabel spirit-supported-label">When it's supported</div>
        <div class="spirit-subtext">${current.spirit_supported}</div>
        <div class="spirit-sublabel spirit-resisted-label">When it's resisted</div>
        <div class="spirit-subtext" style="margin-bottom:0;">${current.spirit_resisted}</div>
      ` : `
        <div class="spirit-med-label">Meditation</div>
        <div class="spirit-med-text">${current.meditation}</div>
      `}
    </div>`;
}

// ── BREATH TIMER (Stage 1) ──────────────────────────────────────────────
// Cards 36/77/79/83/90/108 describe breath in natural language, not counts
// — they get a soft, unstructured pulse with no visible numbers instead.
const NATURAL_BREATH_CARDS = new Set([36, 77, 79, 83, 90, 108]);
const BREATH_AUTO_CYCLES = 3; // full cycles played automatically before settling into "replay"
// A few cards' printed counts include a very brief beat (e.g. a 1-second
// exhale) as part of their specific rhythm. True to the card on paper, but
// on screen a 1-second phase reads as a glitch, not a breath. Floor every
// displayed/animated phase here so nothing ever feels rushed or skipped.
const MIN_BREATH_PHASE_SECONDS = 3;

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
  return nums.map((seconds, i) => ({ name: names[i] || 'Hold', seconds: Math.max(MIN_BREATH_PHASE_SECONDS, seconds) }));
}

// Stage 1b: subtle per-category tone/motion, derived straight from the
// already-parsed phases — no new data needed. Balance (equal inhale/exhale,
// e.g. box-breathing cards) intentionally stays the plain default look.
const BREATH_CATEGORY_STYLE = {
  expansive: { easing: 'cubic-bezier(.25,.85,.35,1)', inhaleScale: 1.65, exhaleScale: 0.78 },
  grounding: { easing: 'cubic-bezier(.55,0,.25,1)', inhaleScale: 1.5, exhaleScale: 0.68 },
  balance:   { easing: 'ease-in-out', inhaleScale: 1.55, exhaleScale: 0.72 },
};
function breathCategoryFor(phases) {
  let inhale = 0, exhale = 0;
  phases.forEach(p => {
    if (p.name === 'Inhale') inhale += p.seconds;
    else if (p.name === 'Exhale') exhale += p.seconds;
  });
  if (inhale > exhale) return 'expansive';
  if (exhale > inhale) return 'grounding';
  return 'balance';
}

let breathStopFn = null;
function stopBreathTimer() {
  if (breathStopFn) { breathStopFn(); breathStopFn = null; }
}

let breathCountdownInterval = null;
function clearBreathCountdown() {
  if (breathCountdownInterval) { clearInterval(breathCountdownInterval); breathCountdownInterval = null; }
}

function startBreathTimer(card) {
  const circle = document.getElementById('breathCircle');
  const label = document.getElementById('breathPhaseLabel');
  const skipBtn = document.getElementById('breathSkipBtn');
  const replayBtn = document.getElementById('breathReplayBtn');
  if (!circle) return;
  clearBreathCountdown();

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

  const category = breathCategoryFor(phases);
  const style = BREATH_CATEGORY_STYLE[category];
  circle.className = 'breath-circle category-' + category;
  let phaseIndex = 0, cycleCount = 0, stopped = false;

  function step() {
    if (stopped) return;
    const phase = phases[phaseIndex];
    let secondsLeft = phase.seconds;
    if (label) label.textContent = phase.name.toUpperCase() + ' · ' + secondsLeft + 's';
    clearBreathCountdown();
    breathCountdownInterval = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) { clearBreathCountdown(); return; }
      if (label) label.textContent = phase.name.toUpperCase() + ' · ' + secondsLeft + 's';
    }, 1000);
    circle.style.transition = `transform ${phase.seconds}s ${style.easing}, opacity ${phase.seconds}s ${style.easing}`;
    if (phase.name === 'Inhale') { circle.style.transform = `scale(${style.inhaleScale})`; circle.style.opacity = '1'; }
    else if (phase.name === 'Exhale') { circle.style.transform = `scale(${style.exhaleScale})`; circle.style.opacity = '.65'; }
    // Hold: leave transform/opacity where they are, just wait out the duration.
    setTimeout(() => {
      clearBreathCountdown();
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
    clearBreathCountdown();
    circle.style.transition = ''; circle.style.transform = 'scale(1)'; circle.style.opacity = '1';
  };
  if (skipBtn) skipBtn.onclick = () => { stopBreathTimer(); showStoppedState(); };
  if (replayBtn) replayBtn.onclick = () => startBreathTimer(card);
}

function renderRevealing(root) {
  const s = spreadByKey(spreadKey);
  root.innerHTML = `
    <div class="screen revealing">
      <div class="reveal-circle-wrap" id="revealCircleWrap">
        <svg class="reveal-ring" viewBox="0 0 120 120">
          <circle class="reveal-ring-bg" cx="60" cy="60" r="54"></circle>
          <circle class="reveal-ring-fg" id="revealRingFg" cx="60" cy="60" r="54"></circle>
        </svg>
        <div class="reveal-shimmer" id="revealShimmer"></div>
        <div class="reveal-card-back" id="revealCardBack"><div class="card-back-mono">AK</div></div>
      </div>
      <div class="reveal-spread-label">${s.label}</div>
      <div class="reveal-label" id="revealLabel">HOLD &middot; 2S</div>
      <button class="link-dim" id="revealBackBtn">Back</button>
    </div>`;

  const wrap = document.getElementById('revealCircleWrap');
  const circle = document.getElementById('revealCardBack');
  const ring = document.getElementById('revealRingFg');
  const shimmer = document.getElementById('revealShimmer');
  const label = document.getElementById('revealLabel');

  const circumference = 2 * Math.PI * 54;
  ring.style.strokeDasharray = String(circumference);
  ring.style.strokeDashoffset = String(circumference);

  let holdTimer = null;

  function startHold(e) {
    if (e.cancelable) e.preventDefault();
    if (holdTimer) return;
    circle.classList.add('pressed');
    shimmer.classList.add('active');
    label.textContent = 'HOLD…';
    ring.style.transition = `stroke-dashoffset ${REVEAL_HOLD_MS}ms linear`;
    ring.style.strokeDashoffset = '0';
    try { if (navigator.vibrate) navigator.vibrate([0, 30, 40, 40, 50, 50, 60, 60]); } catch (err) {}
    holdTimer = setTimeout(completeReveal, REVEAL_HOLD_MS);
  }
  function cancelHold() {
    if (!holdTimer) return;
    clearTimeout(holdTimer); holdTimer = null;
    circle.classList.remove('pressed');
    shimmer.classList.remove('active');
    label.textContent = 'HOLD · 2S';
    ring.style.transition = 'stroke-dashoffset .25s ease';
    ring.style.strokeDashoffset = String(circumference);
  }
  function completeReveal() {
    holdTimer = null;
    try { if (navigator.vibrate) navigator.vibrate(120); } catch (err) {}
    const card = revealCard;
    revealCard = null;
    drawnCards = [card]; screen = 'reading'; cardIndex = 0; activeTab = 'grounded';
    render();
  }

  wrap.addEventListener('pointerdown', startHold);
  wrap.addEventListener('pointerup', cancelHold);
  wrap.addEventListener('pointerleave', cancelHold);
  wrap.addEventListener('pointercancel', cancelHold);
  document.getElementById('revealBackBtn').addEventListener('click', () => { revealCard = null; goHome(); });
}

function renderReading(root) {
  const current = drawnCards[cardIndex];
  const positions = spreadKey === 'seasonal' ? SEASONS[selectedSeason].positions : POSITIONS[spreadKey];
  const position = positions ? positions[cardIndex] : null;
  const octaveNote = spreadKey === 'octave' ? OCTAVE_NOTES[cardIndex] : null;
  const showThread = drawnCards.length > 1;

  const threadDots = showThread ? drawnCards.map((c, i) => {
    const opacity = i <= cardIndex ? 1 : 0.3;
    return `<span style="background:${colorFor(c.phase)};opacity:${opacity}"></span>`;
  }).join('') : '';

  const isLast = cardIndex === drawnCards.length - 1;
  const nextLabel = isLast ? 'SEE SYNTHESIS' : 'NEXT CARD';

  const phaseColor = colorFor(current.phase);

  const saved = isCardSaved(current.num);

  root.innerHTML = `
    <div class="screen reading">
      ${showThread ? `<div class="thread-row">${threadDots}</div>` : ''}
      <div class="reading-meta">
        <button class="save-star-btn ${saved ? 'saved' : ''}" id="saveStarBtn" aria-label="Save card">${saved ? '&#9733;' : '&#9734;'}</button>
        ${position ? `<div class="reading-position">${octaveNote ? `<span class="reading-position-note">${octaveNote}</span>` : ''}${position}</div>` : ''}
        <div class="reading-num-row">
          <span class="reading-num-dot" style="background:${phaseColor}"></span>
          <div class="reading-num">${current.isWildcard ? 'WILDCARD' : '№ ' + current.num + ' &middot; ' + phaseNameFor(current.phase)}</div>
        </div>
        <div class="reading-title">${current.title}</div>
        <div class="reading-title-rule"></div>
      </div>
      <div class="breath-timer">
        <button class="breath-info-btn" id="breathInfoBtn" aria-label="About the breathwork">?</button>
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
        ${readingPreviewOnly
          ? '<button class="btn-next" id="doneBtn">DONE</button>'
          : '<button class="btn-outline" id="backCardBtn">BACK</button>' + `<button class="btn-next" id="nextCardBtn">${nextLabel}</button>`}
      </div>
    </div>`;

  document.getElementById('tabGrounded').addEventListener('click', () => switchTab('grounded'));
  document.getElementById('tabSpirit').addEventListener('click', () => switchTab('spirit'));
  document.getElementById('breathInfoBtn').addEventListener('click', openBreathInfoModal);
  document.getElementById('saveStarBtn').addEventListener('click', () => {
    toggleSaved(current.num);
    const btn = document.getElementById('saveStarBtn');
    const nowSaved = isCardSaved(current.num);
    btn.innerHTML = nowSaved ? '&#9733;' : '&#9734;';
    btn.classList.toggle('saved', nowSaved);
  });
  if (readingPreviewOnly) {
    document.getElementById('doneBtn').addEventListener('click', goToSavedCards);
  } else {
    document.getElementById('nextCardBtn').addEventListener('click', nextCard);
    const backCardBtn = document.getElementById('backCardBtn');
    if (backCardBtn) backCardBtn.addEventListener('click', prevCard);
  }

  startBreathTimer(current);
}

function renderSavedCards(root) {
  const saved = [...CARDS, ...WILDCARD_CARDS].filter(c => savedCardNums.has(c.num)).sort((a, b) => a.num - b.num);
  const rows = saved.map(c => `
    <div class="saved-row" data-num="${c.num}">
      <span class="saved-dot" style="background:${colorFor(c.phase)}"></span>
      <div class="saved-row-body">
        <div class="saved-row-title">${c.title}</div>
        <div class="saved-row-sub">${c.isWildcard ? 'Wildcard' : '№ ' + c.num + ' &middot; ' + phaseNameFor(c.phase)}</div>
      </div>
      <button class="saved-unstar-btn" data-num="${c.num}" aria-label="Remove from saved">&#9733;</button>
    </div>`).join('');

  root.innerHTML = `
    <div class="screen saved">
      <div class="section-label">Saved Cards</div>
      ${saved.length === 0
        ? '<div class="saved-empty">No saved cards yet — tap the star on any card reading to save it here.</div>'
        : `<div class="saved-list">${rows}</div>`}
      <button class="link-dim" id="savedBackBtn" style="margin-top:22px;align-self:center;">Back to spreads</button>
    </div>`;

  root.querySelectorAll('.saved-row').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.saved-unstar-btn')) return;
      openSavedCard(Number(el.getAttribute('data-num')));
    });
  });
  root.querySelectorAll('.saved-unstar-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSaved(Number(el.getAttribute('data-num')));
      renderSavedCards(root);
    });
  });
  document.getElementById('savedBackBtn').addEventListener('click', goHome);
}

function renderSynthesis(root) {
  const synth = spreadKey === 'seasonal' ? seasonalSynthesisText() : composeSynthesis(drawnCards);
  const dots = drawnCards.map(c => `<span class="dot" style="background:${colorFor(c.phase)}"></span><span class="line"></span>`).join('');

  const existingEntry = currentJournalId ? journalEntries.find(e => e.id === currentJournalId) : null;

  root.innerHTML = `
    <div class="screen synthesis">
      <div class="synth-label-top">The synthesis</div>
      <div class="synth-thread">${dots}</div>
      <div class="synth-headline">${synth.headline}</div>
      ${synth.sub ? `<div class="synth-sub">${synth.sub}</div>` : ''}
      <div class="synth-takeaway">${synth.takeaway || ''}</div>
      <div class="journal-box">
        <div class="journal-label">Journal This Reading <span class="optional-tag">(optional)</span></div>
        <textarea class="journal-input" id="journalText" placeholder="What's this bringing up for you?" rows="4">${existingEntry ? escapeHtml(existingEntry.text) : ''}</textarea>
        <div class="journal-row">
          <button class="btn-outline" id="journalSaveBtn">${existingEntry ? 'Update Entry' : 'Save Entry'}</button>
          <span class="journal-status" id="journalStatus">${existingEntry ? 'Saved' : ''}</span>
        </div>
        <div class="journal-disclaimer">Saved on this device only — lost if the app is uninstalled or you switch devices. No cloud backup.</div>
      </div>
      <button class="btn-outline-gold" id="newReadingBtn">NEW READING</button>
      <button class="link-dim" id="reviewReadingBtn" style="margin-top:14px;align-self:center;">&larr; Review this reading</button>
    </div>`;
  document.getElementById('journalSaveBtn').addEventListener('click', saveJournalEntry);
  document.getElementById('newReadingBtn').addEventListener('click', goHome);
  document.getElementById('reviewReadingBtn').addEventListener('click', reviewReading);
}

function renderJournalHistory(root) {
  const entries = [...journalEntries].sort((a, b) => b.timestamp - a.timestamp);
  const rows = entries.map(e => {
    const dateStr = new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `
      <div class="journal-item">
        <div class="journal-item-meta">${dateStr} &middot; ${escapeHtml(e.spreadLabel)} &middot; ${escapeHtml(e.cardTitles.join(', '))}</div>
        <div class="journal-item-text">${escapeHtml(e.text)}</div>
      </div>`;
  }).join('');

  root.innerHTML = `
    <div class="screen journal-history">
      <div class="section-label">Journal History</div>
      ${entries.length === 0
        ? '<div class="saved-empty">No journal entries yet — write something after a reading to save it here.</div>'
        : `<div class="journal-list">${rows}</div>`}
      <div class="journal-disclaimer" style="text-align:center;margin-top:18px;">Entries are saved on this device only — no cloud sync or backup.</div>
      <button class="link-dim" id="journalBackBtn" style="margin-top:18px;align-self:center;">Back to spreads</button>
    </div>`;
  document.getElementById('journalBackBtn').addEventListener('click', goHome);
}

// ── About the Breathwork modal (Stage 1b) ────────────────────────────────
function openBreathInfoModal() { document.getElementById('breathInfoOverlay').classList.add('active'); }
function closeBreathInfoModal() { document.getElementById('breathInfoOverlay').classList.remove('active'); }
document.getElementById('breathInfoCloseBtn').addEventListener('click', closeBreathInfoModal);
document.getElementById('wordmark').addEventListener('click', handleWordmarkTap);

// ── About ASCEND Keys modal ──────────────────────────────────────────────
function openAboutModal() { document.getElementById('aboutOverlay').classList.add('active'); }
function closeAboutModal() { document.getElementById('aboutOverlay').classList.remove('active'); }
document.getElementById('aboutCloseBtn').addEventListener('click', closeAboutModal);

// ── Day/Night mode toggle ─────────────────────────────────────────────────
document.getElementById('themeToggleBtn').addEventListener('click', cycleThemeMode);
applyThemeMode();

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

// ── Hardware/gesture back button (Android) ──────────────────────────────
// Without this, Android's back gesture just exits the app from any screen,
// since this is a single-page app with no browser history to step through.
// Route it through the same in-app navigation a visible Back button would
// use; only exit at the true top level (Home, nothing open over it).
try {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
      if (document.getElementById('breathInfoOverlay').classList.contains('active')) {
        closeBreathInfoModal();
        return;
      }
      if (document.getElementById('aboutOverlay').classList.contains('active')) {
        closeAboutModal();
        return;
      }
      if (screen === 'reading') { readingPreviewOnly ? goToSavedCards() : prevCard(); return; }
      if (screen === 'revealing' || screen === 'synthesis' || screen === 'saved' || screen === 'journal') { revealCard = null; goHome(); return; }
      if (screen === 'home') { window.Capacitor.Plugins.App.exitApp(); return; }
      // 'intro' — no back target, let the hardware button do nothing.
    });
  }
} catch (e) {
  console.error('Back button wiring failed:', e);
}

render();
