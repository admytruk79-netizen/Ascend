# Invisible Strike — Android app

A Capacitor-wrapped Android build of the Invisible Strike companion app,
with Quick Shield, the free Green Dome, and the Situational Check-In free,
and the rest of the library (Grounding, Daily Field Check, Evening
Clearing, all five Amortization decks, Astral Aikido, and the full Quick
Reference table) gated behind a **Google Play Billing** one-time purchase
(`invisible_strike_full_access`).

Payment goes through Google Play Billing rather than Stripe because Google
Play policy requires digital content unlocked *inside* an app to use Play
Billing — an external processor like Stripe would get the app rejected.
(The separate web/PWA build at the repo root keeps its own Stripe-based
`worker.js` paywall — that's a different distribution channel with
different rules.)

## Project layout

```
mobile-app/
  www/                  the actual app: HTML/CSS/JS (source of truth)
    index.html
    css/styles.css
    js/content.js         sourced practice content (manuscript Ch. 3, 12, 13, Appendix A)
    js/app.js              router, state, all views
    js/billing.js           wraps Google Play Billing (cordova-plugin-purchase)
    icons/
  android/                generated native Android project (Capacitor)
  capacitor.config.json
  package.json
```

Always edit files under `www/`, then run `npm run sync` to copy them into
the native Android project — never edit
`android/app/src/main/assets/public` directly, it gets overwritten on
every sync.

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
in-app product have been uploaded to Play Console (even to internal
testing). It will not work on a plain emulator without Play services, and
`billing.js` will report itself as unavailable outside that context — the
app still works, just without purchasing (the free tier — Quick Shield,
Green Dome, Situational Check-In, cheat-sheet teaser — is fully usable).

## CI builds (no local Android Studio needed)

`.github/workflows/invisible-strike-android-build.yml` builds the app on
GitHub's runners:

- **`debug` job** runs automatically on every push touching `mobile-app/**`.
  It runs `npx cap sync android` + `./gradlew assembleDebug` and uploads the
  resulting debug APK as a workflow artifact (Actions tab → the run → Artifacts).
  Sideload that APK on any Android phone (enable "install unknown apps") to
  try the app without installing anything locally.
- **`release` job** builds a signed `.aab` for Play Console. It only runs when
  triggered manually (Actions tab → "Invisible Strike Android build" → "Run
  workflow"), and needs four repo secrets set first — see below.

## Publishing to Google Play

1. **Package name** is already set: `com.ascend.invisiblestrike` (in
   `capacitor.config.json`, mirrored in `android/app/build.gradle` as
   `applicationId` / `namespace`). This is permanent once published to Play
   Console, so don't change it after the first upload.

2. **App icon & splash screen.** Already branded (navy/gold shield,
   `android/app/src/main/res/mipmap-*` and `drawable*/splash.png`) — no
   placeholder Capacitor defaults left to swap.

3. **Create the app in [Google Play Console](https://play.google.com/console)**
   ($25 one-time developer registration fee if you don't already have an
   account).

4. **Set up the in-app product**, under Monetize → Products → In-app products:
   - Product ID: `invisible_strike_full_access` (must match `PRODUCT_ID` in
     `www/js/billing.js` exactly)
   - Type: one-time, non-consumable
   - Price: your call — the price shown in the app is pulled live from
     what you configure here, not hardcoded (the `$4.99` in `billing.js`
     is only a placeholder shown before the store responds).

5. **Generate a signed release bundle.** Two ways to do this — pick one:

   **A. Locally, via Android Studio.** Build → Generate Signed Bundle / APK →
   Android App Bundle. It walks you through creating a new upload keystore
   the first time. Save that `.jks`/`.keystore` file and its passwords
   somewhere safe outside git — losing it means you can't update the app
   under the same listing.

   **B. Via CI, with no local Android Studio.** Generate a keystore once
   with the JDK's `keytool` (or reuse one Android Studio already made you):
   ```bash
   keytool -genkeypair -v -keystore release.keystore -alias invisible-strike \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
   Then add four **repo secrets** (Settings → Secrets and variables → Actions
   → New repository secret):
   - `ANDROID_KEYSTORE_BASE64` — the keystore file, base64-encoded:
     `base64 -w0 release.keystore` (macOS: drop `-w0`, use `base64 -i` output as-is)
   - `ANDROID_KEYSTORE_PASSWORD` — the keystore password
   - `ANDROID_KEY_ALIAS` — the alias you used (`invisible-strike` above)
   - `ANDROID_KEY_PASSWORD` — the key password (often same as keystore password)

   Then trigger the build: Actions tab → **Invisible Strike Android build**
   workflow → **Run workflow** (on this branch). It produces
   `invisible-strike-release-aab` as a downloadable artifact —
   `android/app/build/outputs/bundle/release/app-release.aab`.

   Keep that keystore file and its passwords somewhere safe outside git
   either way — the CI job only holds it in memory for the duration of the
   run and deletes it afterward, it's never committed.

   Either path uses the same `android/app/build.gradle` signing setup: it
   looks for `android/keystore.properties` (gitignored, never committed) and
   signs `bundleRelease`/`assembleRelease` with it when present. CI writes
   that file from the secrets above right before building.

6. **Upload to an Internal testing track first.** Add yourself as a license
   tester (Setup → License testing) so you can complete a real purchase
   flow without being charged, and verify the unlock/restore buttons work
   end-to-end before promoting to production.

7. **Target API level & policy compliance.** `android/variables.gradle` is
   already set to a current `targetSdkVersion`/`compileSdkVersion` — keep
   these current, Play rejects apps targeting old API levels. Also fill in
   the Data Safety form (the app itself collects no personal data — all
   progress is local on-device; Google Play Billing handles payment data).

## How the billing wiring works

- `www/js/billing.js` registers the in-app product with
  `cordova-plugin-purchase` as `NON_CONSUMABLE` (a single unlock, not a
  subscription), listens for purchase/ownership events, and exposes a
  small `window.InvisibleStrikeBilling` API (`purchase()`, `restore()`,
  `onStatusChange()`, `getPriceString()`, `isUnlockedCached()`).
- `www/js/app.js` never talks to the billing plugin directly — the
  paywall gate (`paywallSheet()` / `wirePaywall()`) just calls
  `InvisibleStrikeBilling` and reacts to unlock-status changes via
  `onStatusChange`, same as the rest of the app's local state.
- The Play Billing permission (`com.android.vending.BILLING`) and the
  Play Billing Library dependency are wired in automatically by
  `cordova-plugin-purchase` during `npx cap sync` — no manual manifest
  edits needed.
