/*
 * ASCEND Keys — startup animation.
 * A brief "system wake-up" inspired by modern vehicle startup UX: darkness
 * -> teal orbital scan -> gold ignition -> calm hand-off to the app's own
 * splash/intro underneath. Plays once per app launch as a full-screen
 * overlay, can be tapped to skip, and respects prefers-reduced-motion.
 */
(function () {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const style = document.createElement('style');
  style.id = 'ascend-startup-style';
  style.textContent = `
    @keyframes akStartupFade { 0%{opacity:0} 12%{opacity:1} 82%{opacity:1} 100%{opacity:0;visibility:hidden} }
    @keyframes akOrbitWake { 0%{opacity:0;transform:rotate(-110deg) scale(.72)} 20%{opacity:.22} 52%{opacity:1;transform:rotate(210deg) scale(1)} 78%{opacity:.45} 100%{opacity:0;transform:rotate(330deg) scale(1.03)} }
    @keyframes akCoreIgnite { 0%,24%{opacity:0;transform:scale(.72);filter:brightness(.65)} 38%{opacity:1;transform:scale(.9);filter:brightness(1)} 58%{opacity:1;transform:scale(1.055);filter:brightness(1.32)} 76%,100%{opacity:1;transform:scale(1);filter:brightness(1.06)} }
    @keyframes akBeam { 0%,28%{opacity:0;transform:scaleY(.05)} 44%{opacity:.85;transform:scaleY(1)} 68%{opacity:.28} 100%{opacity:0} }
    @keyframes akHalo { 0%,25%{opacity:0;transform:scale(.4)} 48%{opacity:.62;transform:scale(.88)} 70%{opacity:.3;transform:scale(1.18)} 100%{opacity:0;transform:scale(1.45)} }
    @keyframes akWordmark { 0%,44%{opacity:0;letter-spacing:8px;transform:translateY(4px)} 68%{opacity:1;letter-spacing:4px;transform:none} 100%{opacity:.9;letter-spacing:4px} }
    #ascend-startup {
      position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center;
      background:radial-gradient(circle at 50% 46%, rgba(7,34,36,.34), transparent 32%), #08090b;
      color:#C4A84A; overflow:hidden; touch-action:manipulation; -webkit-tap-highlight-color:transparent;
      animation:akStartupFade 2.35s cubic-bezier(.2,.7,.2,1) forwards;
    }
    #ascend-startup.ak-skip { transition:opacity .18s ease; opacity:0 !important; visibility:hidden !important; }
    .ak-startup-stage { position:relative; width:220px; height:220px; display:flex; align-items:center; justify-content:center; }
    .ak-startup-halo { position:absolute; width:178px; height:178px; border-radius:50%; background:radial-gradient(circle, rgba(14,124,123,.25), rgba(14,124,123,.07) 46%, transparent 70%); filter:blur(5px); animation:akHalo 2.1s ease-out forwards; }
    .ak-startup-orbit { position:absolute; width:154px; height:154px; border-radius:50%; border:1px solid rgba(14,124,123,.13); animation:akOrbitWake 1.8s cubic-bezier(.22,.74,.22,1) forwards; }
    .ak-startup-orbit::before { content:''; position:absolute; inset:-1px; border-radius:50%; border-top:2px solid rgba(42,207,198,.95); border-right:1px solid rgba(196,168,74,.48); filter:drop-shadow(0 0 8px rgba(14,124,123,.65)); }
    .ak-startup-orbit::after { content:''; position:absolute; width:5px; height:5px; border-radius:50%; top:8px; left:35px; background:#4cd8ce; box-shadow:0 0 12px rgba(76,216,206,.9); }
    .ak-startup-beam { position:absolute; width:1px; height:126px; top:47px; transform-origin:50% 50%; background:linear-gradient(180deg, transparent, rgba(196,168,74,.95) 42%, rgba(243,236,217,.9) 50%, rgba(14,124,123,.62) 72%, transparent); box-shadow:0 0 10px rgba(196,168,74,.42); animation:akBeam 1.75s ease-out forwards; }
    .ak-startup-logo { width:108px; height:108px; border-radius:50%; overflow:hidden; position:relative; z-index:2; border:1px solid rgba(196,168,74,.38); box-shadow:0 0 34px rgba(14,124,123,.18),0 0 38px rgba(196,168,74,.18); animation:akCoreIgnite 1.72s cubic-bezier(.2,.72,.2,1) forwards; }
    .ak-startup-logo img { width:100%; height:100%; object-fit:cover; display:block; }
    .ak-startup-word { position:absolute; top:178px; left:50%; transform:translateX(-50%); white-space:nowrap; font:600 12px/1 'Cinzel',serif; letter-spacing:4px; color:#C4A84A; text-shadow:0 0 18px rgba(196,168,74,.34); animation:akWordmark 2.15s ease-out forwards; }
    .ak-startup-skip { position:absolute; bottom:26px; left:0; right:0; text-align:center; font:500 9px/1 'Inter',sans-serif; letter-spacing:1.8px; color:rgba(243,236,217,.26); }
    @media (prefers-reduced-motion: reduce) {
      #ascend-startup { animation:none; opacity:1; }
      .ak-startup-orbit,.ak-startup-halo,.ak-startup-beam,.ak-startup-logo,.ak-startup-word { animation:none !important; opacity:1; transform:none; }
      .ak-startup-orbit { opacity:.4; }
      .ak-startup-halo { opacity:.22; }
      .ak-startup-beam { opacity:.28; }
    }
  `;
  document.head.appendChild(style);

  function mountStartup() {
    if (document.getElementById('ascend-startup')) return;
    const overlay = document.createElement('div');
    overlay.id = 'ascend-startup';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML = `
      <div class="ak-startup-stage">
        <div class="ak-startup-halo"></div>
        <div class="ak-startup-orbit"></div>
        <div class="ak-startup-beam"></div>
        <div class="ak-startup-logo"><img src="ascend-logo.png" alt=""></div>
        <div class="ak-startup-word">ASCEND KEYS</div>
      </div>
      <div class="ak-startup-skip">TAP TO CONTINUE</div>`;
    document.body.appendChild(overlay);

    let removed = false;
    const finish = () => {
      if (removed) return;
      removed = true;
      overlay.classList.add('ak-skip');
      window.setTimeout(() => overlay.remove(), 220);
    };

    overlay.addEventListener('click', finish, { once: true });
    overlay.addEventListener('touchend', finish, { once: true, passive: true });
    if (reduced) window.setTimeout(finish, 650);
    else window.setTimeout(finish, 2380);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountStartup, { once: true });
  else mountStartup();
})();
