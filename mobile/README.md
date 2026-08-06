# ASCEND — mobile app (Expo)

Nervous-system regulation app. See the build guide and MVP spec (§1–13) for
product context — this README only covers getting the code running.

## Current status: P0–P2 done

- P0: Expo TS app scaffolded, Supabase schema written (`../supabase/migrations/0001_init_schema.sql`).
- P1: Home + Deck screens exist and read/write a local, AsyncStorage-backed
  Primary Anchor + favorites state. **All 42 cards are real** — art
  (`assets/cards/*.webp`, mapped in `src/data/cardImages.ts`) and manifest
  metadata (mechanism mood-tag `category` + `acuteRecommended` per card in
  `src/data/cardManifest.ts`) both came from the user directly, since Canva
  export is blocked by this environment's network policy.
- P2: Session mechanics — double-tap on Home starts a session on the
  Primary Anchor (`src/session/startSession.ts` is the single entry point;
  a future P6 BLE handler calls the same function with `triggerSource:
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
- P4–P8 (journal, AI, BLE, subscriptions, QA): not started yet.

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
3. **RevenueCat** (P7) — dashboard account + entitlement config, plus the
   7-day trial configured separately in App Store Connect and Google Play
   Console per spec §10. Code-only setup can't do the store-side config.
4. **Anthropic API key** for the AI Edge Function (P5) — goes in Supabase's
   Edge Function secrets, never in the app bundle.

## Running locally

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go for anything through P5 (no native modules
yet). From P6 (BLE) onward you'll need a custom dev client instead:
`eas build --profile development`.

Note: `npx expo export` and other commands that phone home to Expo's
servers will fail in network-sandboxed environments (this one included) —
that's a proxy/network-policy issue, not a code problem. `npx tsc --noEmit`
is a reasonable smoke test in that situation and currently passes clean.

## Project layout

```
mobile/
  App.tsx                  entry point: AuthProvider, SyncManager, RootNavigator
  src/
    navigation/             React Navigation stack (Home + modal screens)
    screens/                Home, Deck (P1); Session (P2); Settings, SignIn (P3)
    storage/                AsyncStorage-backed local state (cardState.ts, sessionLog.ts)
    session/                startSession.ts — shared session-start entry point (manual + future BLE)
    data/                   cardManifest.ts (real metadata) + cardImages.ts (real art), both all 42
    types/                  Card / UserCardState / Session per spec §4/5
    lib/supabase.ts         Supabase client (null if env vars unset — see .env.example)
    auth/                   AuthContext, magic-link deep-link handling
    sync/                   syncEngine.ts (pull/push) + SyncManager.tsx (trigger points)
supabase/
  migrations/0001_init_schema.sql   Users/Cards/UserCardState/Sessions/
                                     JournalEntries/AIInsights per spec §4/7/9
  migrations/0002_profile_on_signup.sql   auto-create profiles row on signup
```
