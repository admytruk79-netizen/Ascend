# ASCEND Keys — Android app

A Capacitor-wrapped Android build of the ASCEND Keys reading tool, with the
single-card draw free and the four multi-card spreads gated behind a
**Google Play Billing** subscription (`ascend_keys_premium_monthly`).

Payment goes through Google Play Billing rather than Stripe because Google
Play policy requires digital subscriptions purchased *inside* an app to use
Play Billing — an external processor like Stripe would get the app rejected.

## Project layout

```
mobile-app/
  www/                  the actual app: HTML/CSS/JS + card data (source of truth)
    index.html
    app.js               spreads, card rendering, synthesis logic
    billing.js            wraps Google Play Billing (cordova-plugin-purchase)
    ascend_cards.json      card deck data
  android/                generated native Android project (Capacitor)
  capacitor.config.json
  package.json
```

Always edit files under `www/`, then run `npm run sync` to copy them into
the native Android project — never edit `android/app/src/main/assets/public`
directly, it gets overwritten on every sync.

## Card data

`www/ascend_cards.json` has all 108 cards across the 5 phases, each with
the full field set: `phrase` / `breathing` / `meditation` / `interpretation`
plus the psychological "Grounded" reading (`grounded_supported` /
`grounded_resisted` / `tested_quality` / `grounded_where_v2`). The UI only
renders the "Grounded" section when those fields are present on a card, so
the app degrades gracefully if any are ever missing.

## First-time setup

```bash
cd mobile-app
npm install
npx cap sync android
```

You'll need a JDK and the Android SDK installed locally (Android Studio is
the easiest way to get both) to build or run the app — this repo only
contains the source, not a built APK/AAB.

## Running locally

Open the project in Android Studio and run it on an emulator or device:

```bash
npx cap open android
```

Or build a debug APK from the command line:

```bash
cd android && ./gradlew assembleDebug
```

Note: Google Play Billing **only works on a device signed into a real
Google account with Play Store access**, and only once the app + the
subscription product have been uploaded to Play Console (even to internal
testing). It will not work on a plain emulator without Play services, and
`billing.js` will report itself as unavailable outside that context — the
app still works, just without purchasing.

## CI builds (no local Android Studio needed)

`.github/workflows/android-build.yml` builds the app on GitHub's runners:

- **`debug` job** runs automatically on every push touching `mobile-app/**`.
  It runs `npx cap sync android` + `./gradlew assembleDebug`, uploads the
  resulting debug APK as a workflow artifact (Actions tab → the run →
  Artifacts), and also publishes it to a GitHub Release tagged
  `debug-v<versionCode>-run<N>` (repo's Releases page) so it's easy to find
  and download without digging through Actions runs. Sideload that APK on
  any Android phone (enable "install unknown apps") to try the app without
  installing anything locally.
- **`release` job** builds a signed `.aab` for Play Console. It only runs when
  triggered manually (Actions tab → "Android build" → "Run workflow"), and
  needs four repo secrets set first — see below.

## Publishing to Google Play

1. ~~Pick a real package name~~ — done: `com.ascend.keys26` (set in
   `capacitor.config.json` and mirrored in `android/app/build.gradle` as
   `applicationId` / `namespace`). This is permanent once published to Play
   Console, so don't change it again after the first upload.

2. **App icon & splash screen.** Capacitor ships default placeholder icons
   in `android/app/src/main/res`. Replace them (Android Studio's Image Asset
   Studio, or the `@capacitor/assets` CLI tool) before submitting.

3. **Create the app in [Google Play Console](https://play.google.com/console)**
   ($25 one-time developer registration fee if you don't already have an
   account).

4. **Set up the subscription product**, under Monetize → Products →
   Subscriptions:
   - Product ID: `ascend_keys_premium_monthly` (must match `PRODUCT_ID` in
     `www/billing.js` exactly)
   - Billing period: monthly
   - Price: $11.99 (or your call — the price shown in the app is pulled
     live from what you configure here, not hardcoded)

5. **Generate a signed release bundle.** Two ways to do this — pick one:

   **A. Locally, via Android Studio.** Build → Generate Signed Bundle / APK →
   Android App Bundle. It walks you through creating a new upload keystore
   the first time. Save that `.jks`/`.keystore` file and its passwords
   somewhere safe outside git — losing it means you can't update the app
   under the same listing.

   **B. Via CI, with no local Android Studio.** Generate a keystore once
   with the JDK's `keytool` (or reuse one Android Studio already made you):
   ```bash
   keytool -genkeypair -v -keystore release.keystore -alias ascend-keys \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
   Then add four **repo secrets** (Settings → Secrets and variables → Actions
   → New repository secret):
   - `ANDROID_KEYSTORE_BASE64` — the keystore file, base64-encoded:
     `base64 -w0 release.keystore` (macOS: drop `-w0`, use `base64 -i` output as-is)
   - `ANDROID_KEYSTORE_PASSWORD` — the keystore password
   - `ANDROID_KEY_ALIAS` — the alias you used (`ascend-keys` above)
   - `ANDROID_KEY_PASSWORD` — the key password (often same as keystore password)

   Then trigger the build: Actions tab → **Android build** workflow → **Run
   workflow** (on this branch). It produces `ascend-keys-release-aab` as a
   downloadable artifact — `android/app/build/outputs/bundle/release/app-release.aab`.

   Keep that keystore file and its passwords somewhere safe outside git
   either way — the CI job only holds it in memory for the duration of the
   run and deletes it afterward, it's never committed.

   Either path uses the same `android/app/build.gradle` signing setup: it
   looks for `android/keystore.properties` (gitignored, never committed) and
   signs `bundleRelease`/`assembleRelease` with it when present. CI writes
   that file from the secrets above right before building.

6. **Upload to an Internal testing track first.** Add yourself as a license
   tester (Setup → License testing) so you can complete a real purchase
   flow without being charged, and verify the subscribe/restore buttons
   work end-to-end before promoting to production.

7. **Target API level & policy compliance.** `android/variables.gradle` is
   already set to a current `targetSdkVersion`/`compileSdkVersion` — keep
   these current, Play rejects apps targeting old API levels. Also fill in
   the Data Safety form (the app itself collects no personal data; Google
   Play Billing handles payment data).

## How the billing wiring works

- `www/billing.js` registers the subscription product with
  `cordova-plugin-purchase`, listens for purchase/ownership events, and
  exposes a small `window.AscendBilling` API (`subscribe()`, `restore()`,
  `onStatusChange()`, `getPriceString()`).
- `www/app.js` never talks to the billing plugin directly — it just calls
  `AscendBilling` and reacts to subscription status changes, same as the
  rest of the reading-tool logic (spreads, synthesis, card rendering).
- The Play Billing permission (`com.android.vending.BILLING`) and the
  Play Billing Library dependency are wired in automatically by
  `cordova-plugin-purchase` during `npx cap sync` — no manual manifest
  edits needed.

## "Weave It In" (AI personalize) wiring

Single-card and Where You Stand readings can show a "Weave In Your Situation"
box (member-only, same paywall gate as the multi-card spreads) that sends
the card's grounded reading plus a few sentences of free text the user
types to a small backend, which returns a short response connecting their
situation to that specific card.

**Currently disabled** — `PERSONALIZE_ENABLED = false` near the top of
`www/app.js` hides the box entirely until there's a real backend to call.
The feature is fully built, just switched off, so it doesn't ship a button
that fails for every user. To turn it on: deploy the backend below, set
`PERSONALIZE_API_URL` to its real URL, flip `PERSONALIZE_ENABLED` to `true`,
then `npx cap sync android`.

That backend is a Cloudflare Worker (kept outside this repo/deploy target —
it's a separate `wrangler`-deployed project, not part of the Android build)
exposing `POST /api/personalize`. `www/app.js` calls it via the
`PERSONALIZE_API_URL` constant near the top of the file — **update that to
your deployed Worker's URL** (e.g. `https://your-worker.workers.dev/api/personalize`)
before shipping; it must be the full absolute URL since the app runs from a
different origin than the Worker (`capacitor://localhost`, not the Worker's
domain), so a relative path won't reach it. The Worker also needs an
`ANTHROPIC_API_KEY` secret set (`wrangler secret put ANTHROPIC_API_KEY`) for
this endpoint to work.

If `PERSONALIZE_API_URL` is left as the placeholder or the Worker is
unreachable, the box still renders — it just shows "Couldn't connect right
now" when used, same as any other network failure. It doesn't block the
rest of the app.
