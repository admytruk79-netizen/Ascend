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
- P3–P8 (backend sync, journal, AI, BLE, subscriptions, QA): not started.

## Setup this environment could NOT do for you

Everything below needs a human with browser access to a real account — a
sandboxed coding session can't create these:

1. **EAS account** — run `eas login` (or `eas login --sso` if your org uses
   SSO) from a real terminal, then `eas build:configure` inside `mobile/`.
2. **Supabase project** — create one at supabase.com, then either:
   - `npx supabase link --project-ref <your-ref>` from the repo root, then
     `npx supabase db push` to apply `supabase/migrations/0001_init_schema.sql`, or
   - paste that file's contents into the Supabase SQL editor directly.
   Copy the project URL and anon key into `mobile/.env` (create it from
   `.env.example` once that exists — not yet added, since there's no client
   code calling Supabase until P3).
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
  App.tsx                  entry point, wires up RootNavigator
  src/
    navigation/             React Navigation stack (Home + modal screens)
    screens/                HomeScreen, DeckScreen (P1); more land per phase
    storage/                AsyncStorage-backed local state (cardState.ts)
    data/                   cardManifest.ts (real metadata) + cardImages.ts (real art), both all 42
    types/                  Card / UserCardState per spec §4
supabase/
  migrations/0001_init_schema.sql   Users/Cards/UserCardState/Sessions/
                                     JournalEntries/AIInsights per spec §4/7/9
```
