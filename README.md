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
wrangler.toml          Worker config + KV binding
src/index.js           Router / entry point
src/layout.js           Shared header/nav/footer shell + render helpers
src/styles.js           Design system (embedded CSS, no build step)
src/content.js          Content schema + default copy for every editable block
src/diagrams.js         8 inline SVG schematics (site layout, roadmap, etc.)
src/admin.js            Password auth (signed cookie) + admin UI + KV writes
src/pages/*.js          One render function per page
```

## Content model

Every editable piece of text or image lives under a dotted key
(`home.headline`, `station.tier1_body`, `station.image_ev`, ...), defined in
`src/content.js`. At request time the Worker reads `DEFAULT_CONTENT` and
overlays anything saved in the `CONTENT` KV namespace under `content:<key>`,
so the site renders correctly even before `/admin` has ever been touched.

## A note on images and diagrams

- **Diagrams**: the 8 schematics referenced in the brief
  (`site_layout`, `interior_layout`, `socar_layout`, `portland_socar_layout`,
  `motor_court_layout`, `post_station_layout`, `vehicle_relay`,
  `master_roadmap`) were not present as PNG files anywhere in this repo, so
  each was rebuilt as a real, legible inline SVG in `src/diagrams.js` instead
  of a hallucinated image reference. Swap any of them for a designed PNG
  later by replacing the diagram function and passing `mediaBlock(url, ...)`
  in its place inside `src/pages/station.js`.
- **Photos**: the build environment this site was created in has no outbound
  network access to image hosts (Wikimedia, Unsplash, Pexels, etc. all
  blocked), so no photo URLs could be fetched or verified. Every photo slot
  (fuel canopy, EV bay, café interior, OKKO/SOCAR reference, Portland
  streetscape, motor court, battery swap, founder photo, ...) renders a
  labeled placeholder until a real URL is entered in `/admin`. Nothing is a
  broken or fake image link.

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

To deploy from CI instead, see `.github/workflows/deploy.yml` — it runs on
push to `main` and expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
as repository secrets (the same two the original `wrangler.toml` already
referenced). Admin secrets (`ADMIN_PASSWORD`, `SESSION_SECRET`) are set once
directly against the Cloudflare account, not through CI.

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
