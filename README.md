# Qremyn + Qremyn Station

A single Cloudflare Worker that serves the Qremyn / Qremyn Station marketing &
investor site, with all copy and images editable at runtime through a
password-gated `/admin` panel backed by Workers KV — no redeploy needed to
change text or swap a photo.

## Site map

| Route | Content |
|---|---|
| `/` | Split hero: Qremyn (platform) vs. Qremyn Station (physical hub) |
| `/qremyn` | Qremyn Core, the tow-dispatch flagship example, the 5 role-based apps |
| `/station` | Concept, service mix, site/interior layout, Portland entry, staged roadmap, Tier 3 expansion concepts |
| `/qremyn-x-station` | The one-backend/one-hub parallel and concrete tie-ins |
| `/about` | Founder story + contact |
| `/admin` | Password-gated content editor |

## Project layout

```
wrangler.toml          Worker config + KV binding + static assets binding
public/diagrams/*.png   The 8 schematic diagrams, served as static assets
public/photos/*.jpg     Reference photography, served as static assets
src/index.js           Router / entry point
src/layout.js           Shared header/nav/footer shell + render helpers
src/styles.js           Design system (embedded CSS, no build step)
src/content.js          Content schema + default copy for every editable block
src/admin.js            Password auth (signed cookie) + admin UI + KV writes
src/pages/*.js          One render function per page
```

## Content model

Every editable piece of text or image lives under a dotted key
(`home.headline`, `station.tier1_body`, `station.image_ev`, ...), defined in
`src/content.js`. At request time the Worker reads `DEFAULT_CONTENT` and
overlays anything saved in the `CONTENT` KV namespace under `content:<key>`,
so the site renders correctly even before `/admin` has ever been touched.

## Images and diagrams

- **Diagrams**: the 8 schematics referenced in the brief — `site_layout`,
  `interior_layout`, `socar_layout`, `portland_socar_layout`,
  `motor_court_layout`, `post_station_layout`, `vehicle_relay`,
  `master_roadmap` — are real PNGs at `public/diagrams/*.png`, served as
  static assets via the Worker's `ASSETS` binding (see `[assets]` in
  `wrangler.toml`) and referenced with `diagramImage()` in
  `src/pages/station.js`.
- **Photos**: real reference photography lives at `public/photos/*.jpg`
  (resized to a 1600px-wide max and re-encoded as quality-78 JPEG — most
  are 175–330KB, down from multi-megabyte source PNGs) and is wired in as
  the default value for the matching `station.image_*` / `home.image_*`
  keys in `src/content.js`. A few slots (EV close-up, SOCAR-specific photo,
  Portland streetscape, Qremyn platform/dispatch UI mockup) have no matching
  source image yet and intentionally render a labeled placeholder — swap
  those in via `/admin` rather than guessing at a stock URL. Every image
  field, including the ones with a default photo, stays editable at
  `/admin` at any time.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars   # fill in a real password + session secret
npm run dev                       # wrangler dev, KV simulated locally
```

## Deploying

The KV namespace `CONTENT` already exists in the connected Cloudflare
account and is wired into `wrangler.toml` (`id = "0a3a91e8fa63462eae8cf3f2e77e8a22"`).

**Primary path — Cloudflare's own Git integration:** in the Cloudflare
dashboard, **Workers & Pages → Create → Import a repository**, connect this
repo, confirm the branch is the one you want live (usually `main`), and
deploy. Cloudflare then rebuilds and redeploys automatically on every push
to that branch — no GitHub secrets, no local CLI. This is what's currently
running the live deployment. Set the two Worker secrets once the Worker
exists, under its **Settings → Variables and Secrets** (mark both
**Encrypt**):

- `ADMIN_PASSWORD` — the `/admin` login password
- `SESSION_SECRET` — any long random string, signs the admin session cookie

**One-time R2 setup for the "Upload image" button in `/admin`:**

R2 is not currently enabled on this Cloudflare account, and the code
accounts for that: the `[[r2_buckets]]` block in `wrangler.toml` is
commented out. Leaving it active while the bucket doesn't exist would fail
Worker deploys entirely (not just the upload feature) — R2 disabled returns
the same error a missing bucket would, so `wrangler deploy` can't tell them
apart and refuses to publish. To turn the feature on:

1. In the Cloudflare dashboard, go to **R2** and enable it for the account
   (accepting R2's terms) — this can't be done via API, an account owner
   has to click through it.
2. Create a bucket named `qremyn-uploads` (or pick another name and use it
   in step 3).
3. In `wrangler.toml`, uncomment the `[[r2_buckets]]` block (and update
   `bucket_name` if you used a different one).
4. Redeploy. No further dashboard binding step is needed — Cloudflare's Git
   integration picks up the binding from the config on the next build.

Until this is done, manual image URL entry in `/admin` works exactly as
before. The Upload button is visible either way; clicking it before the
binding is uncommented returns a clear "not configured yet" message
instead of failing silently.

**Alternative — local CLI**, if you'd rather deploy by hand:
```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler deploy
```

**Alternative — GitHub Actions** (`.github/workflows/deploy.yml`): manual-only
(`workflow_dispatch`), so it won't run or fail in the background unless you
trigger it from the **Actions** tab. Needs `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` as **repository** secrets first — separate from the
two Worker secrets above.

## Using `/admin`

1. Go to `https://<your-worker>.workers.dev/admin`.
2. Log in with the password set via `ADMIN_PASSWORD`.
3. Every page's content is grouped into sections (Home, Qremyn, Qremyn Station,
   Qremyn × Station, About). Each field shows its editable value and its
   underlying key.
   - **Text fields** are single-line (headlines, taglines).
   - **Textareas** are multi-line body copy. A blank line between two
     paragraphs starts a new `<p>`.
   - **Image fields** take a direct image URL, or tap **Upload image** to
     pick a JPG/PNG/WebP from your device — it uploads straight to R2 and
     fills the URL field in automatically. A live preview updates either
     way. Leave blank to use the site's default photo for that slot (or a
     labeled placeholder, if there's no default).
4. Click **Save changes**. Writes go straight to the `CONTENT` KV namespace
   and are live on the public site immediately, with no rebuild or redeploy.
5. **Log out** clears the session cookie. Sessions otherwise expire after 12
   hours.

Admin sessions are a signed, `HttpOnly`, `Secure`, `SameSite=Strict` cookie
(HMAC-SHA256 over an expiry timestamp using `SESSION_SECRET`) — there's no
session store, so rotating `SESSION_SECRET` immediately invalidates all
sessions.
