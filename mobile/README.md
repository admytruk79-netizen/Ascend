# ASCEND — mobile app (Expo)

Nervous-system regulation app. See the build guide and MVP spec (§1–13) for
product context — this README only covers getting the code running.

## Current status: P0 done, P1 stubbed

- P0: Expo TS app scaffolded, Supabase schema written (`../supabase/migrations/0001_init_schema.sql`).
- P1: Home + Deck screens exist and read/write a local, AsyncStorage-backed
  Primary Anchor + favorites state — but **card art is placeholder**. The
  deck renders colored tiles with debug labels, not real images, because
  neither `card-manifest-34-final.json` nor the 42 card image files were
  reachable when this was written (see `src/data/cardManifest.ts` for the
  full explanation). Swap those in before this screen is real.
- P2–P8 (session timer, backend sync, journal, AI, BLE, subscriptions, QA):
  not started. See the phase plan for what's next.

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
    data/                   cardManifest.ts — PLACEHOLDER, see file header
    types/                  Card / UserCardState per spec §4
supabase/
  migrations/0001_init_schema.sql   Users/Cards/UserCardState/Sessions/
                                     JournalEntries/AIInsights per spec §4/7/9
```
