/* Invisible Strike — app shell, router, state, all views.
   Vanilla JS, no build step, local-only persistence (installed PWA). */

(function () {
  "use strict";

  /* ================= State ================= */
  const STORE_KEY = "invisibleStrike:v1";

  function todayStr(d) {
    d = d || new Date();
    return d.toISOString().slice(0, 10);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {}
    return defaultState();
  }

  function defaultState() {
    return {
      unlocked: false,
      streak: { count: 0, lastDate: null },
      greenDomeMode: "quick",
      fieldCheckLog: {}, // { "2026-08-02": { am: {...}, pm: {...} } }
      practiceLog: [],   // [{date, id}]
      rotationIndex: 0
    };
  }

  let state = loadState();
  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function markPracticeDone(id) {
    const today = todayStr();
    if (!state.practiceLog.some((p) => p.date === today && p.id === id)) {
      state.practiceLog.push({ date: today, id });
    }
    bumpStreak();
    state.rotationIndex = (state.rotationIndex + 1) % 4;
    save();
    renderStreakChip();
  }

  function bumpStreak() {
    const today = todayStr();
    if (state.streak.lastDate === today) return;
    const yesterday = todayStr(new Date(Date.now() - 86400000));
    state.streak.count = state.streak.lastDate === yesterday ? state.streak.count + 1 : 1;
    state.streak.lastDate = today;
    save();
  }

  function didPracticeToday(id) {
    const today = todayStr();
    return state.practiceLog.some((p) => p.date === today && (!id || p.id === id));
  }

  /* ================= Router ================= */
  const view = document.getElementById("view");
  const routes = {
    home: renderHome,
    practice: renderPractice,
    checkin: renderCheckin,
    drills: renderDrills,
    more: renderMore,
    aikido: renderAikido,
    cheatsheet: renderCheatsheet,
    settings: renderSettings
  };

  function currentRoute() {
    const h = (location.hash || "#home").replace("#", "");
    const base = h.split("/")[0];
    return routes[base] ? h : "home";
  }

  function navigate(route) {
    location.hash = route;
  }

  function render() {
    const full = currentRoute();
    const [base, arg] = full.split("/");
    const fn = routes[base] || renderHome;
    view.innerHTML = fn(arg);
    view.scrollTop = 0;
    view.focus({ preventScroll: true });
    highlightNav(base);
    wireView(base, arg);
  }

  function highlightNav(base) {
    document.querySelectorAll(".navitem").forEach((btn) => {
      const r = btn.dataset.route;
      const active = r === base || (r === "more" && ["more", "aikido", "cheatsheet", "settings"].includes(base));
      btn.classList.toggle("active", active);
    });
  }

  window.addEventListener("hashchange", render);
  document.querySelectorAll(".navitem").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.route));
  });

  /* ================= Shared UI helpers ================= */
  function icon(name) {
    const icons = {
      dome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 18a8 8 0 0 1 16 0"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
      ground: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v11"/><path d="M7 9l5 5 5-5"/><line x1="4" y1="20" x2="20" y2="20"/></svg>',
      field: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg>',
      clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14M9 6l-4 6 4 6M15 6l4 6-4 6"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 6 9 17l-5-5"/></svg>',
      cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="5" width="12" height="16" rx="2"/><rect x="9" y="3" width="12" height="16" rx="2"/></svg>',
      aikido: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="5" r="2"/><path d="M12 7v6M12 13l-4 6M12 13l4 6M8 9l4 2 4-2"/></svg>',
      table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="4" x2="9" y2="20"/></svg>',
      lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
      chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'
    };
    return icons[name] || "";
  }

  function card({ title, sub, icon: iconName, route, locked }) {
    return `<div class="card tappable ${locked ? "paid-veil" : ""}" data-nav="${route || ""}">
      <div class="card-row">
        <div class="card-icon">${icon(iconName)}</div>
        <div style="flex:1">
          <p class="card-title">${title} ${locked ? '<span class="lock-badge">Paid</span>' : ""}</p>
          <p class="card-sub">${sub}</p>
        </div>
        ${icon("chev")}
      </div>
    </div>`;
  }

  function paywallSheet(featureName) {
    const price = window.InvisibleStrikeBilling ? window.InvisibleStrikeBilling.getPriceString() : "$4.99";
    return `
    <div class="unlock-panel">
      <div class="glyph">🔒</div>
      <p><b>${featureName}</b> is part of the paid tier.<br>Unlock the full library — Grounding, Daily Field Check, Evening Clearing, all five Amortization decks, Astral Aikido, and the complete Quick Reference table.</p>
      <button class="btn btn-primary" id="unlockBtn">Unlock Full Access — ${price}</button>
      <div style="height:10px"></div>
      <button class="btn btn-ghost" id="restoreBtn">Restore purchase</button>
    </div>`;
  }

  function wirePaywall(container) {
    const unlockBtn = container.querySelector("#unlockBtn");
    const restoreBtn = container.querySelector("#restoreBtn");
    if (unlockBtn) unlockBtn.addEventListener("click", startPurchase);
    if (restoreBtn) restoreBtn.addEventListener("click", startRestore);
  }

  function billingNotice(message) {
    openModal(`
      <div style="text-align:center; padding: 10px 4px 4px;">
        <p class="card-sub" style="margin-bottom:18px;">${message}</p>
        <button class="btn btn-primary" id="closeBillingNotice">Got it</button>
      </div>`);
    document.getElementById("closeBillingNotice").addEventListener("click", closeModal);
  }

  function startPurchase() {
    if (!window.InvisibleStrikeBilling) { billingNotice("Billing isn't available in this preview."); return; }
    window.InvisibleStrikeBilling.purchase().catch((err) => billingNotice(err.message || "Purchase couldn't be started."));
  }

  function startRestore() {
    if (!window.InvisibleStrikeBilling) { billingNotice("Billing isn't available in this preview."); return; }
    window.InvisibleStrikeBilling.restore().catch((err) => billingNotice(err.message || "Nothing to restore."));
  }

  /* ================= Home ================= */
  function renderHome() {
    const library = [CONTENT.greenDome, CONTENT.grounding, CONTENT.dailyFieldCheck, CONTENT.eveningClearing]
      .filter((p) => state.unlocked || p.tier === "free");
    const todays = library[state.rotationIndex % library.length] || CONTENT.greenDome;
    const doneToday = didPracticeToday();

    return `
    <h1>Welcome back.</h1>
    <h2>Your field, at a glance.</h2>

    <div class="card tappable" id="qsHomeCard" style="border-color: var(--gold-dim);">
      <div class="card-row">
        <div class="card-icon" style="background: rgba(198,155,74,.18)">${icon("aikido")}</div>
        <div style="flex:1">
          <p class="card-title">Quick Shield</p>
          <p class="card-sub">${CONTENT.threeBreathReset.tagline}</p>
        </div>
        ${icon("chev")}
      </div>
    </div>

    <p class="section-title">Today's practice</p>
    <div class="card tappable" data-nav="practice">
      <div class="card-row">
        <div class="card-icon">${icon(todays.id === "green-dome" ? "dome" : todays.id === "grounding" ? "ground" : todays.id === "daily-field-check" ? "field" : "clear")}</div>
        <div style="flex:1">
          <p class="card-title">${todays.name} ${doneToday ? '<span class="lock-badge" style="color:var(--good);border-color:rgba(111,174,140,.3);background:rgba(111,174,140,.1)">Done today</span>' : ""}</p>
          <p class="card-sub">${todays.why || todays.purpose || ""}</p>
        </div>
        ${icon("chev")}
      </div>
    </div>

    <p class="section-title">Practice this</p>
    ${card({ title: "Situational Check-In", sub: "Walk the Four Checks against a real recent exchange.", icon: "check", route: "checkin" })}
    ${card({ title: "Amortization Drills", sub: "Flashcards — attack line, then the exact response.", icon: "cards", route: "drills", locked: !state.unlocked })}
    ${card({ title: "Astral Aikido", sub: "Nonverbal amortization — matched countergesture, the Broken Approach.", icon: "aikido", route: "aikido", locked: !state.unlocked })}
    ${card({ title: "Quick Reference", sub: "The 6-row cheat sheet, centers to core amortization.", icon: "table", route: "cheatsheet" })}
    `;
  }

  /* ================= Practice ================= */
  function renderPractice() {
    const items = [
      { d: CONTENT.greenDome, icon: "dome" },
      { d: CONTENT.grounding, icon: "ground" },
      { d: CONTENT.dailyFieldCheck, icon: "field" },
      { d: CONTENT.eveningClearing, icon: "clear" }
    ];
    return `
    <h1>Daily Practice</h1>
    <h2>${state.streak.count} day streak. Consistency over intensity.</h2>
    ${items.map(({ d, icon: i }) =>
      card({ title: d.name, sub: (d.why || d.purpose || "").slice(0, 90) + "…", icon: i, route: `practice-detail/${d.id}`, locked: d.tier === "paid" && !state.unlocked })
    ).join("")}
    `;
  }

  routes["practice-detail"] = renderPracticeDetail;
  function renderPracticeDetail(id) {
    const map = { "green-dome": CONTENT.greenDome, "grounding": CONTENT.grounding, "daily-field-check": CONTENT.dailyFieldCheck, "evening-clearing": CONTENT.eveningClearing };
    const d = map[id];
    if (!d) return renderPractice();
    if (d.tier === "paid" && !state.unlocked) {
      return `<h1>${d.name}</h1><h2>Paid practice</h2>${paywallSheet(d.name)}`;
    }
    if (id === "green-dome") return renderGreenDome(d);
    if (id === "grounding") return renderSimplePractice(d, [
      { detail: d.steps[0].detail, seconds: d.steps[0].seconds },
      { detail: d.steps[1].detail, seconds: d.steps[1].seconds }
    ]);
    if (id === "daily-field-check") return renderFieldCheck(d);
    if (id === "evening-clearing") return renderSimplePractice(d, d.steps.map((s) => ({ detail: s })));
    return "";
  }

  function renderGreenDome(d) {
    const mode = state.greenDomeMode;
    return `
    <h1>${d.name}</h1>
    <h2>${d.why}</h2>
    <div class="segmented">
      <button class="${mode === "quick" ? "active" : ""}" data-mode="quick">Quick (1 breath)</button>
      <button class="${mode === "full" ? "active" : ""}" data-mode="full">Full</button>
    </div>
    <div id="domeBody">${mode === "quick" ? domeQuick(d) : domeFull(d)}</div>
    `;
  }
  function domeQuick(d) {
    return `<div class="card"><p class="card-sub" style="font-size:15px; color:var(--ink)">${d.quick.steps[0]}</p></div>
      <button class="btn btn-primary" id="completeDome">Mark done</button>`;
  }
  function domeFull(d) {
    return d.full.steps.map((s) => `<div class="card"><p class="card-title">${s.phase}</p><p class="card-sub">${s.detail}</p></div>`).join("")
      + `<button class="btn btn-primary" id="completeDome">Mark done</button>`;
  }

  function renderSimplePractice(d, steps) {
    return `<h1>${d.name}</h1><h2>${d.purpose}</h2>
    ${steps.map((s, i) => `<div class="card"><p class="card-title">Step ${i + 1}</p><p class="card-sub">${s.detail}${s.seconds ? ` (${s.seconds}s)` : ""}</p></div>`).join("")}
    <button class="btn btn-primary" id="completePractice" data-id="${d.id}">Mark done</button>`;
  }

  function renderFieldCheck(d) {
    const today = todayStr();
    const log = state.fieldCheckLog[today] || {};
    function grid(period) {
      const sel = log[period] || {};
      return `<div class="center-grid" data-period="${period}">
        ${d.centers.map((c) => `<button class="center-btn ${sel[c.id] ? "selected" : ""}" data-center="${c.id}" data-period="${period}">${c.label}${sel[c.id] ? `<br><small>${sel[c.id]}</small>` : ""}</button>`).join("")}
      </div>`;
    }
    return `
    <h1>${d.name}</h1>
    <h2>${d.purpose}</h2>
    <p class="section-title">Morning</p>
    ${grid("am")}
    <p class="section-title">Evening</p>
    ${grid("pm")}
    <button class="btn btn-primary" id="completePractice" data-id="${d.id}">Mark done</button>
    `;
  }

  /* ================= Situational Check-In ================= */
  let checkinState = { i: 0, answers: [] };
  function renderCheckin() {
    checkinState = { i: 0, answers: [] };
    return checkinStep();
  }
  function checkinStep() {
    const total = CONTENT.fourChecks.length;
    if (checkinState.i >= total) {
      return `
      <h1>Check complete.</h1>
      <h2>A private recognition pass on one real exchange.</h2>
      ${checkinState.answers.map((a, idx) => `<div class="card"><p class="card-title">${idx + 1}. ${CONTENT.fourChecks[idx].title}</p><p class="card-sub">${a}</p></div>`).join("")}
      <div class="note-box">${CONTENT.fourChecksNote}</div>
      <div style="height:14px"></div>
      <button class="btn btn-primary" id="checkinRestart">Run it again</button>
      `;
    }
    const step = CONTENT.fourChecks[checkinState.i];
    return `
    <h1>Situational Check-In</h1>
    <h2>Bring one real, recent exchange to mind.</h2>
    <div class="checkin-progress">${CONTENT.fourChecks.map((_, idx) => `<span class="${idx < checkinState.i ? "done" : ""}"></span>`).join("")}</div>
    <p class="section-title">Check ${step.n} of ${total}</p>
    <div class="card">
      <p class="card-title">${step.title}</p>
      <p class="card-sub">${step.prompt}</p>
    </div>
    <div class="option-list">
      ${step.options.map((o) => `<button class="option-btn" data-opt="${o}">${o}</button>`).join("")}
    </div>
    `;
  }

  /* ================= Amortization Drill Deck ================= */
  function renderDrills() {
    if (!state.unlocked) return `<h1>Amortization Drills</h1><h2>Attack line → the exact amortization response.</h2>${paywallSheet("Amortization Drills")}`;
    return `
    <h1>Amortization Drills</h1>
    <h2>One deck per center. Attack line on the front, the amortization on the back.</h2>
    ${CONTENT.amortizationDecks.map((deck) => card({
      title: deck.label,
      sub: `${deck.subtitle} — ${deck.cards.length} card${deck.cards.length > 1 ? "s" : ""}`,
      icon: "cards",
      route: `deck/${deck.center}`
    })).join("")}
    `;
  }

  routes["deck"] = renderDeck;
  let deckState = { idx: 0, flipped: false };
  function renderDeck(centerId) {
    if (!state.unlocked) return renderDrills();
    const deck = CONTENT.amortizationDecks.find((d) => d.center === centerId);
    if (!deck) return renderDrills();
    if (deckState.center !== centerId) deckState = { center: centerId, idx: 0, flipped: false };
    const c = deck.cards[deckState.idx];
    return `
    <h1>${deck.label}</h1>
    <h2>${deck.principle}</h2>
    <div class="deck-progress"><span>Card ${deckState.idx + 1} of ${deck.cards.length}</span><span>${deck.technique}</span></div>
    <div class="flash-stage">
      <div class="flash-card ${deckState.flipped ? "flipped" : ""}" id="flashCard">
        <div class="flash-face flash-front">
          <div class="flash-eyebrow">Attack</div>
          <div class="flash-line">${c.front}</div>
        </div>
        <div class="flash-face flash-back">
          <div class="flash-eyebrow">${c.technique}</div>
          <div class="flash-line">${c.back}</div>
          <div class="flash-technique">${c.note || ""}</div>
        </div>
      </div>
    </div>
    <p class="flash-hint">Tap the card to flip</p>
    <div class="deck-nav">
      <button class="btn btn-ghost" id="prevCard" ${deckState.idx === 0 ? "disabled" : ""}>Back</button>
      <button class="btn btn-primary" id="nextCard">${deckState.idx === deck.cards.length - 1 ? "Restart deck" : "Next card"}</button>
    </div>
    `;
  }

  /* ================= Astral Aikido ================= */
  function renderAikido() {
    if (!state.unlocked) return `<h1>Astral Aikido</h1><h2>${CONTENT.astralAikido.intro}</h2>${paywallSheet("Astral Aikido")}`;
    return `
    <h1>Astral Aikido</h1>
    <h2>${CONTENT.astralAikido.intro}</h2>
    ${CONTENT.astralAikido.techniques.map((t) => `
      <div class="card">
        <p class="card-title">${t.name}</p>
        <p class="card-sub">${t.principle}</p>
        <div class="pose-strip">
          ${t.frames.map((f) => `<div class="pose-frame">${poseSvg(f.label)}<div class="pf-label">${f.label}</div><div class="pf-desc">${f.desc}</div></div>`).join("")}
        </div>
        <hr class="divider">
        ${t.examples.map((e) => `<p class="card-sub"><b style="color:var(--ink-muted)">${e.raid}</b> → ${e.response}</p>`).join("")}
      </div>
    `).join("")}
    <div class="note-box">${CONTENT.astralAikido.closingNote}</div>
    `;
  }

  function poseSvg(label) {
    // Simple stylized static stick figures — approach / contact / release.
    const figures = {
      "Approach": '<circle cx="14" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M14 22v20M14 30h-10M14 30h6M14 42l-8 10M14 42l6 10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="52" cy="16" r="6" fill="none" stroke="var(--gold)" stroke-width="2.2"/><path d="M52 22v20M52 30h10M52 42l8 10M52 42l-6 10" fill="none" stroke="var(--gold)" stroke-width="2.2"/><path d="M42 26 L26 30" stroke="var(--gold)" stroke-width="2" stroke-dasharray="3 3" fill="none"/>',
      "Contact": '<circle cx="22" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M22 22v20M22 30h14M22 42l-8 10M22 42l6 10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="44" cy="16" r="6" fill="none" stroke="var(--gold)" stroke-width="2.2"/><path d="M44 22v20M44 30h-14M44 42l8 10M44 42l-6 10" fill="none" stroke="var(--gold)" stroke-width="2.2"/>',
      "Release": '<circle cx="18" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M18 22v20M18 30h12M18 42l-7 10M18 42l7 10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="48" cy="14" r="6" fill="none" stroke="var(--gold)" stroke-width="2.2"/><path d="M48 20v18M48 26h-14M48 38l-9 12M48 38l9 12" fill="none" stroke="var(--gold)" stroke-width="2.2"/>'
    };
    return `<svg viewBox="0 0 66 76" stroke="currentColor">${figures[label] || figures["Approach"]}</svg>`;
  }

  /* ================= Cheat Sheet ================= */
  function renderCheatsheet() {
    if (!state.unlocked) {
      return `
      <h1>Quick Reference</h1>
      <h2>Centers, at a glance. Unlock for the full signature / signal / amortization table.</h2>
      <div class="pill-row">${CONTENT.cheatSheet.map((r) => `<span class="pill">${r.center}</span>`).join("")}</div>
      ${paywallSheet("The full Quick Reference table")}
      `;
    }
    return `
    <h1>Quick Reference</h1>
    <h2>Signature of attack, felt signal, core amortization.</h2>
    <div class="cheat-table">
      ${CONTENT.cheatSheet.map((r) => `
        <div class="cheat-row">
          <div class="cheat-center">${r.center}</div>
          <div class="cheat-field"><b>Attack:</b> ${r.attack}</div>
          <div class="cheat-field"><b>Felt signal:</b> ${r.felt}</div>
          <div class="cheat-field"><b>Amortization:</b> ${r.amortization}</div>
        </div>
      `).join("")}
    </div>
    `;
  }

  /* ================= More / Settings ================= */
  function renderMore() {
    return `
    <h1>More</h1>
    ${card({ title: "Astral Aikido", sub: "Nonverbal amortization technique library.", icon: "aikido", route: "aikido", locked: !state.unlocked })}
    ${card({ title: "Quick Reference", sub: "The 6-row cheat sheet.", icon: "table", route: "cheatsheet" })}
    ${card({ title: "Settings", sub: "Access, streak, about.", icon: "check", route: "settings" })}
    `;
  }

  function renderSettings() {
    return `
    <h1>Settings</h1>
    <div class="card">
      <p class="card-title">Access</p>
      <p class="card-sub">${state.unlocked ? "Full access unlocked." : "Free tier — Quick Shield, Green Dome, Situational Check-In, and the cheat-sheet teaser."}</p>
      ${state.unlocked ? "" : '<div style="height:12px"></div><button class="btn btn-primary" id="unlockBtn">Unlock Full Access</button>'}
    </div>
    <div class="card">
      <p class="card-title">Streak</p>
      <p class="card-sub">${state.streak.count} day${state.streak.count === 1 ? "" : "s"} of consistent practice.</p>
    </div>
    <div class="card">
      <p class="card-title">All content is local</p>
      <p class="card-sub">No login, no account. Practice history and progress stay on this device.</p>
    </div>
    `;
  }

  /* ================= View wiring (post-render event binding) ================= */
  function wireView(base, arg) {
    view.querySelectorAll("[data-nav]").forEach((el) => {
      const target = el.dataset.nav;
      if (target) el.addEventListener("click", () => navigate(target));
    });
    wirePaywall(view);

    const qsHome = document.getElementById("qsHomeCard");
    if (qsHome) qsHome.addEventListener("click", openQuickShield);

    if (base === "practice-detail") {
      const modeBtns = view.querySelectorAll("[data-mode]");
      modeBtns.forEach((b) => b.addEventListener("click", () => {
        state.greenDomeMode = b.dataset.mode; save();
        document.getElementById("domeBody").outerHTML = b.dataset.mode === "quick" ? `<div id="domeBody">${domeQuick(CONTENT.greenDome)}</div>` : `<div id="domeBody">${domeFull(CONTENT.greenDome)}</div>`;
        modeBtns.forEach((x) => x.classList.toggle("active", x === b));
        wireCompleteButtons(arg);
      }));
      wireCompleteButtons(arg);

      view.querySelectorAll(".center-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const period = btn.dataset.period;
          const centerId = btn.dataset.center;
          const today = todayStr();
          state.fieldCheckLog[today] = state.fieldCheckLog[today] || {};
          state.fieldCheckLog[today][period] = state.fieldCheckLog[today][period] || {};
          const states = CONTENT.dailyFieldCheck.states;
          const cur = state.fieldCheckLog[today][period][centerId];
          const nextIdx = cur ? (states.indexOf(cur) + 1) % states.length : 0;
          state.fieldCheckLog[today][period][centerId] = states[nextIdx];
          save();
          render();
        });
      });
    }

    if (base === "checkin") {
      view.querySelectorAll(".option-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          checkinState.answers[checkinState.i] = btn.dataset.opt;
          checkinState.i += 1;
          view.innerHTML = checkinStep();
          wireView("checkin");
        });
      });
      const restart = document.getElementById("checkinRestart");
      if (restart) restart.addEventListener("click", () => { checkinState = { i: 0, answers: [] }; view.innerHTML = checkinStep(); wireView("checkin"); });
    }

    if (base === "deck") {
      const flash = document.getElementById("flashCard");
      if (flash) flash.addEventListener("click", () => { deckState.flipped = !deckState.flipped; flash.classList.toggle("flipped"); });
      const deck = CONTENT.amortizationDecks.find((d) => d.center === arg);
      const next = document.getElementById("nextCard");
      const prev = document.getElementById("prevCard");
      if (next) next.addEventListener("click", () => {
        deckState.flipped = false;
        deckState.idx = deckState.idx === deck.cards.length - 1 ? 0 : deckState.idx + 1;
        render();
      });
      if (prev) prev.addEventListener("click", () => {
        deckState.flipped = false;
        deckState.idx = Math.max(0, deckState.idx - 1);
        render();
      });
    }
  }

  function wireCompleteButtons(arg) {
    const domeBtn = document.getElementById("completeDome");
    if (domeBtn) domeBtn.addEventListener("click", () => { markPracticeDone("green-dome"); flashCompleted(domeBtn); });
    const genericBtn = document.getElementById("completePractice");
    if (genericBtn) genericBtn.addEventListener("click", () => { markPracticeDone(genericBtn.dataset.id); flashCompleted(genericBtn); });
  }

  function flashCompleted(btn) {
    btn.textContent = "Done ✓";
    btn.disabled = true;
    setTimeout(() => navigate("home"), 650);
  }

  function renderStreakChip() {
    document.getElementById("streakCount").textContent = state.streak.count;
  }

  /* ================= Quick Shield modal (Three-Breath Reset) ================= */
  const modalHost = document.getElementById("modalHost");
  function openModal(html) {
    modalHost.innerHTML = `<div class="modal-backdrop"></div><div class="modal-sheet"><div class="modal-grabber"></div><button class="modal-close" aria-label="Close">×</button>${html}</div>`;
    modalHost.classList.add("open");
    modalHost.setAttribute("aria-hidden", "false");
    modalHost.querySelector(".modal-backdrop").addEventListener("click", closeModal);
    modalHost.querySelector(".modal-close").addEventListener("click", closeModal);
  }
  function closeModal() {
    modalHost.classList.remove("open");
    modalHost.setAttribute("aria-hidden", "true");
    clearTimeout(qsTimer);
    setTimeout(() => { modalHost.innerHTML = ""; }, 300);
  }

  let qsTimer = null;
  function openQuickShield() {
    runQuickShieldStep(0);
  }

  function runQuickShieldStep(i) {
    const steps = CONTENT.threeBreathReset.steps;
    clearTimeout(qsTimer);
    if (i >= steps.length) {
      openModal(`
        <div class="qs-done" style="text-align:center;">
          <div class="glyph">🛡️</div>
          <p class="card-title" style="margin-top:8px;">Reset complete.</p>
          <p class="card-sub">Whichever center felt most activated — that's simply information, not a problem to solve right now.</p>
          <div style="height:16px"></div>
          <button class="btn btn-primary" id="qsClose">Done</button>
        </div>`);
      document.getElementById("qsClose").addEventListener("click", closeModal);
      return;
    }
    const s = steps[i];
    const phase = i % 2 === 0 ? "inhale" : "exhale";
    openModal(`
      <div class="qs-wrap">
        <div class="qs-step-label">Breath ${s.breath} of ${steps.length}</div>
        <div class="qs-orb ${phase}" id="qsOrb">${phase === "inhale" ? "Inhale" : "Exhale"}</div>
        <p class="qs-cue">${s.cue}</p>
        <p class="qs-detail">${s.detail}</p>
        <div class="qs-dots">
          ${steps.map((_, idx) => `<span class="${idx < i ? "done" : idx === i ? "current" : ""}"></span>`).join("")}
        </div>
        <button class="btn btn-primary" id="qsNext">${i === steps.length - 1 ? "Finish" : "Next breath"}</button>
      </div>`);
    document.getElementById("qsNext").addEventListener("click", () => runQuickShieldStep(i + 1));
    qsTimer = setTimeout(() => runQuickShieldStep(i + 1), 4600);
  }

  document.getElementById("quickShieldFab").addEventListener("click", openQuickShield);

  /* ================= Boot ================= */
  if (window.InvisibleStrikeBilling) {
    window.InvisibleStrikeBilling.onStatusChange((unlocked) => {
      if (unlocked === state.unlocked) return;
      state.unlocked = unlocked;
      save();
      render();
    });
    window.InvisibleStrikeBilling.init();
  }
  renderStreakChip();
  render();
})();
