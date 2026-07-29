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

## Known gap: card data is incomplete

`www/ascend_cards.json` currently has **46 of 108 cards** (phases 1–3 in
full; phases 4 and 5 are missing). The remaining cards need to be appended
to the `cards` array before shipping — the app will otherwise only draw
from cards 1–46 (manual entry is capped to that range automatically).

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

## Publishing to Google Play

1. **Pick a real package name.** `com.ascend.keys` in `capacitor.config.json`
   (and mirrored in `android/app/build.gradle` as `applicationId` /
   `namespace`) is a placeholder — the package name is permanent once
   published, so change it to something you own before your first upload,
   then re-run `npx cap sync android`.

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

5. **Generate a signed release bundle.** Play requires Play App Signing;
   easiest path is letting Android Studio's "Generate Signed Bundle" wizard
   create and register your upload key, or:
   ```bash
   cd android && ./gradlew bundleRelease
   ```
   producing `android/app/build/outputs/bundle/release/app-release.aab`.

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
