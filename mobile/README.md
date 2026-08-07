# ASCEND — mobile app (Expo)

Nervous-system regulation app. See the build guide and MVP spec (§1–13) for
product context — this README only covers getting the code running.

## Current status: P0–P8 done (see QA_CHECKLIST.md before treating any of this as verified)

- P0: Expo TS app scaffolded, Supabase schema written (`../supabase/migrations/0001_init_schema.sql`).
- P1: Home + Deck screens exist and read/write a local, AsyncStorage-backed
  Primary Anchor + favorites state. **All 42 cards are real** — art
  (`assets/cards/*.webp`, mapped in `src/data/cardImages.ts`) and manifest
  metadata (mechanism mood-tag `category` + `acuteRecommended` per card in
  `src/data/cardManifest.ts`) both came from the user directly, since Canva
  export is blocked by this environment's network policy.
- P2: Session mechanics — double-tap on Home starts a session on the
  Primary Anchor (`src/session/startSession.ts` is the single entry point;
  P6's "Test trigger" button calls the same function with `triggerSource:
  'wearable'` instead of adding its own path). 120s timer with up to 3
  extends of +60s each, `AppState`-driven pause/resume with a 60s
  background grace period past which the session logs as `interrupted`,
  and an append-only local session log (`src/storage/sessionLog.ts`) —
  Supabase sync is still P3. **Not tested on physical iOS/Android devices**
  — this sandboxed environment has no device or simulator access, and the
  build guide is explicit that background-timer behavior differs enough
  between platforms that simulator testing wouldn't be trustworthy anyway.
  Test on real hardware before treating this as verified.
  The breathing cue is a generic 4s-in/4s-out pulse, not real per-card
  breathing patterns — no source for those was provided (same situation
  category/acuteRecommended were in before you sent the real manifest).
- P3: Backend — Supabase client (`src/lib/supabase.ts`), magic-link auth
  (`SignInScreen`, `AuthContext`, deep-link callback handling), and a sync
  engine (`src/sync/`) that pulls remote `user_card_state` on sign-in/reconnect
  (last-write-wins by `updatedAt`) and pushes local Primary Anchor/favorites
  state plus any not-yet-synced sessions (append-only). **Auth is additive,
  not a gate** — Home/Deck/Session all still work fully offline/signed-out,
  matching spec §9's offline-first framing; signing in (from Settings) just
  turns sync on. **Completely unverified end-to-end** — there is no live
  Supabase project in this environment (see setup steps below), so none of
  this has actually round-tripped against a real database or sent a real
  magic-link email. It type-checks and the logic follows the spec, but
  "type-checks" and "works" are different claims here.
- P4: Journal — `JournalScreen` for both the optional post-session prompt
  (Home shows it once per completed, non-interrupted session, via
  `getAllSessions` + a ref guard) and manual "add entry" from Home. Entries
  are editable (spec §7 permits edits, explicitly not edit history, so
  there isn't one) and sync the same way UserCardState does — last-write-
  wins by `updatedAt`, since a pure-append model doesn't fit an editable
  record. Same unverified caveat as P3: no live Supabase project here, so
  the sync path type-checks and follows the spec but hasn't round-tripped.
- P5: AI insights — two Edge Functions in `../supabase/functions/`
  (`ai-reflection`, `ai-weekly-summary`), both running the **two-step safety
  check as two genuinely separate steps**: a deterministic keyword/pattern
  pass (`_shared/safetyCheck.ts`, no LLM call) runs first, and only if it
  doesn't flag anything does the function call Anthropic at all. A flagged
  input gets a neutral resource message instead of a reflection, always.
  **The keyword list is a first pass, not a clinically-reviewed one** — see
  the comment in `_shared/safetyCheck.ts`; treat it as a starting point that
  needs real safety/clinical review before this ships to anyone.
  The weekly-summary function runs the same safety check too, even though
  the build guide only asked for it on post-session reflection — see the
  comment in that function for why skipping it there felt like the wrong
  default to guess at.
  Consent (spec §11) is enforced **server-side** in both functions (checks
  `profiles.ai_consent`, not just gated in the app UI) — `InsightsScreen` is
  the actual consent screen (a real screen state, not a buried toggle),
  reachable from Home or from a status line in Settings. AI insights are
  the one feature that needs an account, since the Edge Function has to
  identify the caller to check consent and attribute the insight.
  **Untested**: no live Supabase project (so the functions have never been
  deployed or invoked) and no Anthropic API key configured anywhere in this
  environment. Deploy with `npx supabase functions deploy ai-reflection
  ai-weekly-summary` and `npx supabase secrets set ANTHROPIC_API_KEY=...`
  before trying this for real.
- P6: BLE — `WearableScreen`: scan, select a device to pair (saves its id
  locally), and a "Test trigger" button that calls
  `startPrimaryAnchorSession('wearable')` — the same shared entry point
  double-tap uses, exactly as P2 set it up to allow. Foreground-only per
  spec, no background scanning.
  **What's real vs. stubbed**: scanning, permission requests, and device
  selection are fully implemented against `react-native-ble-plx`. What's
  *not* built is subscribing to an actual trigger notification from the
  paired device's GATT characteristic — that needs the real hardware's
  service/characteristic UUIDs, which were never provided (this was built
  without a hardware spec in hand). See the `TODO(real hardware)` comment
  in `WearableScreen.tsx` for exactly where that plugs in once you have
  those UUIDs; "Test trigger" is a manual stand-in for it until then.
  `getBleManager()` constructs the native `BleManager` **lazily**, only
  when `WearableScreen` mounts — react-native-ble-plx's native module only
  exists in a custom EAS dev client, not Expo Go, and eagerly constructing
  it at import time would have crashed every other screen in Expo Go, not
  just this one.
  **Completely untestable in this environment** — no EAS dev client build,
  no simulator, no physical device, no actual BLE peripheral to scan for.
  This is code written to the spec, never run.
- P7: Subscriptions — RevenueCat (`src/purchases/`), gating spec §10's four
  premium features: wearable (`RequiresPremium` wraps `WearableScreen`),
  AI insights (same gate, inline in `InsightsScreen`), unlimited sessions
  (`startSession.ts` caps free-tier sessions at **3/day — a guessed
  placeholder number, spec doesn't specify one, don't treat it as real**),
  and cloud sync (`syncEngine.ts`'s `runSync` still pulls for free users but
  skips every push — **read-only for free tier, a decision made explicitly
  for this build since the build guide flagged it as unspecified**; revisit
  if that's not actually what's wanted).
  `PaywallScreen` shows the offering with required price/trial disclosure
  and a restore-purchases button; **restore purchases is also reachable
  from Settings** per both stores' review requirements. `configurePurchasesIfPossible()`
  is lazy like the Supabase client and BLE manager — a no-op without both
  RevenueCat API keys configured.
  **Two things that will need real values before shipping, flagged in
  code**: the entitlement identifier `PREMIUM_ENTITLEMENT_ID = 'premium'`
  in `purchases.ts` is a guessed name, not confirmed against a real
  RevenueCat dashboard; the Terms/Privacy links on `PaywallScreen` point at
  `example.com` and will fail App Store/Play Store review as-is.
  **Untestable here**: no RevenueCat account, no App Store Connect/Play
  Console trial configuration, no dev client, no device.
- P8: QA — `QA_CHECKLIST.md` walks spec §13's checklist item by item,
  marking what's actually been verified here (code-level checks: clinical-
  language grep, disclaimer presence, BLE scan doesn't run in background)
  versus what's code-complete-but-needs-a-real-device-or-live-infra versus
  what's an outright gap (no crash-reporting/observability was ever built,
  since no P0–P8 instruction covered it). While auditing this, found the
  in-app disclaimer only existed on `PaywallScreen` — free users who never
  open the paywall would never see one, which doesn't satisfy spec §11's
  "disclaimer in the app." Added one to `SettingsScreen` too, since that's
  reachable regardless of sign-in or subscription state.

## Setup this environment could NOT do for you

Everything below needs a human with browser access to a real account — a
sandboxed coding session can't create these:

1. **EAS account** — run `eas login` (or `eas login --sso` if your org uses
   SSO) from a real terminal, then `eas build:configure` inside `mobile/`.
2. **Supabase project** — create one at supabase.com, then:
   - `npx supabase link --project-ref <your-ref>` from the repo root, then
     `npx supabase db push` to apply both files in `supabase/migrations/`
     (or paste them into the Supabase SQL editor, in order — `0002` depends
     on `0001`), and
   - in the dashboard, Authentication > URL Configuration, add
     `ascend://auth/callback` as a redirect URL (the app's magic-link
     callback won't work without this), and
   - copy `mobile/.env.example` to `mobile/.env` and fill in the project URL
     + anon key from Project Settings > API.
3. **RevenueCat** (P7) — dashboard account, an entitlement named to match
   `PREMIUM_ENTITLEMENT_ID` in `src/purchases/purchases.ts` (or edit that
   constant to match whatever you actually name it), an offering with at
   least one package, plus the 7-day trial configured separately in App
   Store Connect and Google Play Console per spec §10. Copy the iOS/Android
   public SDK keys into `mobile/.env` (see `.env.example`). Also replace
   the placeholder `example.com` Terms/Privacy links in `PaywallScreen.tsx`
   — both stores will reject a paywall with fake legal links.
4. **Anthropic API key** for the AI Edge Functions (P5) — set it with
   `npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...` (and optionally
   `ANTHROPIC_MODEL=...` to override the default), then deploy the
   functions: `npx supabase functions deploy ai-reflection ai-weekly-summary`.
   Never in the app bundle — the app only ever calls these functions by
   name via `supabase.functions.invoke`, never Anthropic directly.

## Running locally

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go for anything through P5. P6 (BLE) and P7
(RevenueCat) both add native modules — Expo Go can't run them at all, so
`WearableScreen` and the RevenueCat calls in `PaywallScreen`/`SettingsScreen`
need a custom dev client instead: `eas build --profile development`. Every
other screen keeps working in Expo Go regardless, since both native modules
are constructed lazily and every call site is guarded — see the
`getBleManager`/`configurePurchasesIfPossible` comments.

Note: `npx expo export` and other commands that phone home to Expo's
servers will fail in network-sandboxed environments (this one included) —
that's a proxy/network-policy issue, not a code problem. `npx tsc --noEmit`
is a reasonable smoke test in that situation and currently passes clean.

## Project layout

```
mobile/
  App.tsx                  entry point: AuthProvider, EntitlementProvider, SyncManager, RootNavigator
  src/
    navigation/             React Navigation stack (Home + modal screens)
    screens/                Home, Deck (P1); Session (P2); Settings, SignIn (P3); Journal (P4); Insights (P5); Wearable (P6); Paywall (P7)
    storage/                AsyncStorage-backed local state (cardState.ts, sessionLog.ts, journalLog.ts, bleDevice.ts)
    session/                startSession.ts — shared session-start entry point (manual + BLE), free-tier session cap
    ble/                    bleManager.ts — lazily-constructed react-native-ble-plx client
    purchases/               purchases.ts, EntitlementContext.tsx, RequiresPremium.tsx — RevenueCat wiring + gate
    data/                   cardManifest.ts (real metadata) + cardImages.ts (real art), both all 42
    types/                  Card / UserCardState / Session / JournalEntry per spec §4/5/7
    lib/supabase.ts         Supabase client (null if env vars unset — see .env.example)
    auth/                   AuthContext, magic-link deep-link handling
    sync/                   syncEngine.ts (pull/push, read-only for free tier) + SyncManager.tsx (trigger points)
    ai/                     consent.ts, aiClient.ts — call the Edge Functions below
supabase/
  migrations/0001_init_schema.sql   Users/Cards/UserCardState/Sessions/
                                     JournalEntries/AIInsights per spec §4/7/9
  migrations/0002_profile_on_signup.sql   auto-create profiles row on signup
  functions/
    _shared/                safetyCheck.ts, anthropic.ts, supabaseClients.ts
    ai-reflection/           post-session reflection, two-step safety check
    ai-weekly-summary/       weekly pattern summary, same safety check
```
