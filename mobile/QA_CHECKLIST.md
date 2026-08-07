# ASCEND MVP QA Checklist (spec §13)

Status as of P0–P7. This is a tracking doc, not a test report — most items
below say *what to check and how*, not *confirmed working*, because this
build has never run on a device, simulator, or against live backend
infrastructure (see `README.md` for the full list of what this sandboxed
environment couldn't set up). Re-run this literally, item by item, on real
devices before shipping, per the build guide's own instruction — don't
treat "the code exists" as "the checklist passed."

Legend: ✅ verified here (code-level, no device/infra needed) · ⏳ code
complete, needs live infra + a device to actually verify · ❌ not built /
known gap.

## Core checklist (spec §13)

- [⏳] **42 cards display, Primary Anchor persists.** Deck renders all 42
  cards with real art (`cardImages.ts`) and real metadata (`cardManifest.ts`).
  Anchor selection persists locally via AsyncStorage — works today,
  standalone. Cross-device persistence via sync needs a live Supabase
  project (P3) to verify.
- [⏳] **Double-tap starts a session.** Implemented (`HomeScreen.onAnchorPress`,
  300ms window) — needs a real device to confirm the timing feels right;
  Expo Go / simulator touch timing isn't representative.
- [⏳] **Timer 120s, extend +60 (max 3).** Implemented in `SessionScreen`.
  The countdown logic and extend-button gating are code-complete, but the
  `AppState` background/foreground/interrupt behavior (spec's own callout)
  has **never been tested on a physical device**, and iOS vs. Android are
  documented to behave differently here. This is the single highest-risk
  untested piece in the whole app.
- [⏳] **Journal works offline.** `JournalScreen` + `journalLog.ts` are
  pure local AsyncStorage, no network dependency — should work standalone
  today. Sync-across-devices needs live Supabase to verify.
- [⏳] **AI reflections and weekly summaries generate; safety path
  triggers correctly on test input.** Both Edge Functions are written and
  the two-step safety check is structurally separated from generation (see
  `supabase/functions/_shared/safetyCheck.ts`), but **neither function has
  ever been deployed or invoked** — no live Supabase project, no Anthropic
  key in this environment. Testing the safety path specifically (not just
  assuming it works) is spec's own explicit instruction — do this with
  real self-harm-adjacent test phrases against a live deployment before
  trusting it, not just a code read.
- [❌ untestable here] **BLE trigger works in foreground.** `WearableScreen`
  scan/pair/test-trigger is built; the actual GATT characteristic
  subscription for a real device is not (needs hardware UUIDs never
  provided — see `WearableScreen.tsx`). Needs a custom EAS dev client, a
  physical device, and a real BLE peripheral to test at all.
- [❌ untestable here] **Subscription and restore work on both stores.**
  RevenueCat wiring, paywall, and restore-purchases are built
  (`src/purchases/`), but need a RevenueCat account, App Store Connect +
  Play Console trial configuration, and real store sandbox accounts to
  test. `PREMIUM_ENTITLEMENT_ID` and the paywall's Terms/Privacy links are
  both placeholders — see `README.md` P7 section.
- [✅] **No medical/clinical language anywhere in copy; disclaimers
  present.** Checked now: `grep -rniE "therapy|treat|diagnos|medical|cure|
  clinical|disorder|symptom|prescri|patient" src/` turns up nothing in
  user-facing strings — the only hits are the disclaimer text itself and
  unrelated code comments (e.g. "treat this as unverified"). A disclaimer
  is now shown in **both** `SettingsScreen` (reachable by every user,
  signed in or not, subscribed or not) and `PaywallScreen`. This check is
  worth re-running after every copy change, not just once — re-run that
  grep command against `src/screens/` specifically before each release.

## Non-functional requirements (spec §12) — not explicitly covered by P0–P8

- [✅] **Battery: avoid continuous BLE scanning.** `WearableScreen` scans
  for a fixed 10s window (`SCAN_DURATION_MS`) and stops; no background
  scanning is registered anywhere.
- [⏳] **Performance: Home < 1.5s on mid-range devices.** Not measured —
  needs a real device. Nothing in Home's code does obviously expensive
  work (a local AsyncStorage read, a 42-item array lookup), but "nothing
  looks slow" isn't the same as measuring it.
- [⏳] **Offline reliability, no data loss.** Sessions/journal/card-state
  writes are all local-first, sync is additive — reasoned through in each
  phase's commit, never load-tested.
- [❌ not built] **Observability: crash reports + minimal logs without
  PII.** No crash-reporting SDK (Sentry or similar) is wired in anywhere —
  this wasn't part of any P0–P8 instruction, so it's a real gap, not an
  oversight to dismiss. Existing `console.warn` calls (grep for
  `console\.` in `src/`) log error objects/messages, not raw user content,
  but there's no actual log pipeline to audit for PII yet since nothing
  ships logs anywhere. Add this before a real release.

## How to actually run this

1. Set up the infra in `README.md`'s "Setup this environment could NOT do
   for you" section (Supabase project + migrations, Edge Function secrets
   + deploy, RevenueCat dashboard + store configuration, EAS dev client).
2. Build the dev client (`eas build --profile development`) and install it
   on **both** a physical iOS and a physical Android device — simulators
   are explicitly not trustworthy for the background-timer and BLE items.
3. Go through every item above in order, on both devices, changing
   ✅/⏳/❌ to a real pass/fail as you go.
4. Re-run the clinical-language grep after any copy change, not just once
   at the start.
