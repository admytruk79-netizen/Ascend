# Roviq + Roviq Station

A single Cloudflare Worker that serves the Roviq / Roviq Station marketing &
investor site, with all copy and images editable at runtime through a
password-gated `/admin` panel backed by Workers KV — no redeploy needed to
change text or swap a photo.

## Site map

| Route | Content |
|---|---|
| `/` | Split hero: Roviq (platform) vs. Roviq Station (physical hub) |
| `/roviq` | Roviq Core, the tow-dispatch flagship example, the 5 role-based apps |
| `/station` | Concept, service mix, site/interior layout, Portland entry, staged roadmap, Tier 3 expansion concepts |
| `/roviq-x-station` | The one-backend/one-hub parallel and concrete tie-ins |
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
  Portland streetscape, Roviq platform/dispatch UI mockup) have no matching
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

The KV namespace `ROVIQ_CONTENT` already exists in the connected Cloudflare
account and is wired into `wrangler.toml` (`id = "0a3a91e8fa63462eae8cf3f2e77e8a22"`).

1. Set the two secrets once, against the real environment:
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET   # any long random string
   ```
2. Deploy:
   ```bash
   npx wrangler deploy
   ```

### Deploying from CI (no local CLI needed)

`.github/workflows/deploy.yml` deploys with Wrangler on every push to `main`
(pinned to Wrangler 3.114.17, the version this project was tested against).
It needs two **repository** secrets, set once under the repo's
**Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN` — an API token with Workers Scripts: Edit permission
- `CLOUDFLARE_ACCOUNT_ID` — found on any Workers page in the Cloudflare dashboard

These are separate from the two Worker secrets above (`ADMIN_PASSWORD`,
`SESSION_SECRET`), which are set directly against the Cloudflare account —
either via `wrangler secret put`, or in the dashboard under the deployed
Worker's **Settings → Variables and Secrets** (mark both **Encrypt**).

To deploy from a branch other than `main` (e.g. before merging), open the
**Actions** tab → **Deploy Roviq / Roviq Station Worker** → **Run workflow**
and pick the branch — the workflow also listens for `workflow_dispatch`, so
this works without touching `main` first.

Alternatively, skip Actions entirely: **Workers & Pages → Create → Import a
repository** in the Cloudflare dashboard connects this repo directly and
deploys from `wrangler.toml` on every push, no GitHub secrets required.

## Using `/admin`

1. Go to `https://<your-worker>.workers.dev/admin`.
2. Log in with the password set via `ADMIN_PASSWORD`.
3. Every page's content is grouped into sections (Home, Roviq, Roviq Station,
   Roviq × Station, About). Each field shows its editable value and its
   underlying key.
   - **Text fields** are single-line (headlines, taglines).
   - **Textareas** are multi-line body copy. A blank line between two
     paragraphs starts a new `<p>`.
   - **Image fields** take a direct image URL. A live preview (or the
     placeholder) updates once you save. Leave blank to keep the labeled
     placeholder.
4. Click **Save changes**. Writes go straight to the `CONTENT` KV namespace
   and are live on the public site immediately, with no rebuild or redeploy.
5. **Log out** clears the session cookie. Sessions otherwise expire after 12
   hours.

Admin sessions are a signed, `HttpOnly`, `Secure`, `SameSite=Strict` cookie
(HMAC-SHA256 over an expiry timestamp using `SESSION_SECRET`) — there's no
session store, so rotating `SESSION_SECRET` immediately invalidates all
sessions.
