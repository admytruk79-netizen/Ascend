// Content schema + defaults for the Roviq / Roviq Station site.
// Every editable string lives here as a default. At request time, index.js
// overlays whatever has been saved in the CONTENT KV namespace on top of
// these defaults, so the site works even before /admin has been touched.

export const CONTENT_SECTIONS = [
  {
    id: "home",
    title: "Home",
    fields: [
      { key: "home.eyebrow", label: "Eyebrow", type: "text" },
      { key: "home.headline", label: "Headline", type: "text" },
      { key: "home.subheadline", label: "Subheadline", type: "text" },
      { key: "home.intro", label: "Intro paragraph", type: "textarea" },
      { key: "home.roviq_tagline", label: "Roviq card tagline", type: "text" },
      { key: "home.roviq_body", label: "Roviq card body", type: "textarea" },
      { key: "home.station_tagline", label: "Station card tagline", type: "text" },
      { key: "home.station_body", label: "Station card body", type: "textarea" },
      { key: "home.throughline_heading", label: "Throughline heading", type: "text" },
      { key: "home.throughline_body", label: "Throughline body", type: "textarea" },
      { key: "home.image_roviq", label: "Roviq side image", type: "image" },
      { key: "home.image_station", label: "Station side image", type: "image" }
    ]
  },
  {
    id: "roviq",
    title: "Roviq (platform)",
    fields: [
      { key: "roviq.hero_eyebrow", label: "Hero eyebrow", type: "text" },
      { key: "roviq.hero_heading", label: "Hero heading", type: "text" },
      { key: "roviq.hero_sub", label: "Hero subheading", type: "text" },
      { key: "roviq.core_heading", label: "Core section heading", type: "text" },
      { key: "roviq.core_body", label: "Core section body", type: "textarea" },
      { key: "roviq.dispatch_heading", label: "Dispatch example heading", type: "text" },
      { key: "roviq.dispatch_body", label: "Dispatch example intro", type: "textarea" },
      { key: "roviq.dispatch_steps", label: "Dispatch steps (one per line)", type: "textarea" },
      { key: "roviq.frontend_customer_body", label: "Customer app body", type: "textarea" },
      { key: "roviq.frontend_diagnostic_body", label: "Diagnostic app body", type: "textarea" },
      { key: "roviq.frontend_shop_body", label: "Shop Partner app body", type: "textarea" },
      { key: "roviq.frontend_vendor_body", label: "Parts Vendor app body", type: "textarea" },
      { key: "roviq.frontend_tow_body", label: "Tow Truck app body", type: "textarea" },
      { key: "roviq.assetlight_heading", label: "Asset-light model heading", type: "text" },
      { key: "roviq.assetlight_body", label: "Asset-light model body", type: "textarea" },
      { key: "roviq.pullquote", label: "Pull quote", type: "text" },
      { key: "roviq.revenue_heading", label: "Revenue model heading", type: "text" },
      { key: "roviq.revenue_stats", label: "Revenue stat tiles (VALUE | label, one per line)", type: "textarea" },
      { key: "roviq.revenue_body", label: "Revenue model body", type: "textarea" },
      { key: "roviq.whynow_heading", label: "Why now heading", type: "text" },
      { key: "roviq.whynow_body", label: "Why now list (one per line)", type: "textarea" },
      { key: "roviq.market_heading", label: "Market opportunity heading", type: "text" },
      { key: "roviq.market_stats", label: "Market stat tiles (VALUE | label, one per line)", type: "textarea" },
      { key: "roviq.market_body", label: "Market opportunity body", type: "textarea" },
      { key: "roviq.dealership_heading", label: "Dealership partnerships heading", type: "text" },
      { key: "roviq.dealership_body", label: "Dealership partnerships body", type: "textarea" },
      { key: "roviq.playbook_heading", label: "Proven playbook heading", type: "text" },
      { key: "roviq.playbook_body", label: "Proven playbook list (Source — mechanic, one per line)", type: "textarea" },
      { key: "roviq.competitors_heading", label: "Competitive landscape heading", type: "text" },
      { key: "roviq.competitors_body", label: "Competitive landscape body", type: "textarea" },
      { key: "roviq.ask_heading", label: "The Ask heading", type: "text" },
      { key: "roviq.ask_stats", label: "The Ask stat tiles (VALUE | label, one per line)", type: "textarea" },
      { key: "roviq.ask_body", label: "The Ask intro body", type: "textarea" },
      { key: "roviq.ask_funds", label: "Use of funds (Line item — $Amount, one per line)", type: "textarea" },
      { key: "roviq.ask_milestones", label: "Milestones this unlocks (one per line)", type: "textarea" },
      { key: "roviq.stack_heading", label: "Tech stack heading", type: "text" },
      { key: "roviq.stack_body", label: "Tech stack list (Layer — Tool, one per line)", type: "textarea" },
      { key: "roviq.dispatch_image", label: "Dispatch/map image", type: "image" }
    ]
  },
  {
    id: "station",
    title: "Roviq Station",
    fields: [
      { key: "station.hero_eyebrow", label: "Hero eyebrow", type: "text" },
      { key: "station.hero_heading", label: "Hero heading", type: "text" },
      { key: "station.tagline", label: "Tagline", type: "text" },
      { key: "station.hero_sub", label: "Hero subheading", type: "textarea" },
      { key: "station.concept_heading", label: "Concept heading", type: "text" },
      { key: "station.concept_body", label: "Concept body", type: "textarea" },
      { key: "station.market_heading", label: "Market & consumer psyche heading", type: "text" },
      { key: "station.market_stats", label: "Market stat tiles (VALUE | label, one per line)", type: "textarea" },
      { key: "station.market_body", label: "Market & consumer psyche body", type: "textarea" },
      { key: "station.proof_heading", label: "Local proof point heading", type: "text" },
      { key: "station.proof_body", label: "Local proof point body (Krays Coffee)", type: "textarea" },
      { key: "station.benchmark_heading", label: "Competitive benchmark heading", type: "text" },
      { key: "station.benchmark_body", label: "Competitive benchmark list (Chain — differentiator, one per line)", type: "textarea" },
      { key: "station.service_fuel_body", label: "Fuel service body", type: "textarea" },
      { key: "station.service_ev_body", label: "EV charging body", type: "textarea" },
      { key: "station.service_cafe_body", label: "Café body", type: "textarea" },
      { key: "station.service_wine_body", label: "Wine & retail body", type: "textarea" },
      { key: "station.service_wash_body", label: "Car wash body", type: "textarea" },
      { key: "station.layout_heading", label: "Layout section heading", type: "text" },
      { key: "station.layout_body", label: "Layout section body", type: "textarea" },
      { key: "station.portland_heading", label: "Portland section heading", type: "text" },
      { key: "station.portland_body", label: "Portland section body", type: "textarea" },
      { key: "station.financials_heading", label: "Illustrative financials heading", type: "text" },
      { key: "station.financials_body", label: "Illustrative financials body", type: "textarea" },
      { key: "station.risks_heading", label: "Key risks heading", type: "text" },
      { key: "station.risks_body", label: "Key risks body", type: "textarea" },
      { key: "station.roadmap_heading", label: "Roadmap heading", type: "text" },
      { key: "station.roadmap_body", label: "Roadmap intro body", type: "textarea" },
      { key: "station.tier1_heading", label: "Tier 1 heading", type: "text" },
      { key: "station.tier1_body", label: "Tier 1 body", type: "textarea" },
      { key: "station.tier2_heading", label: "Tier 2 heading", type: "text" },
      { key: "station.tier2_body", label: "Tier 2 body", type: "textarea" },
      { key: "station.tier3_heading", label: "Tier 3 heading", type: "text" },
      { key: "station.tier3_body", label: "Tier 3 body", type: "textarea" },
      { key: "station.expansion_heading", label: "Expansion heading", type: "text" },
      { key: "station.expansion_body", label: "Expansion intro body", type: "textarea" },
      { key: "station.expansion_motor_court_body", label: "Motor court concept body", type: "textarea" },
      { key: "station.expansion_post_station_body", label: "Post Station (battery swap) body", type: "textarea" },
      { key: "station.expansion_vehicle_relay_body", label: "Vehicle relay body", type: "textarea" },
      { key: "station.image_hero", label: "Hero image", type: "image" },
      { key: "station.image_cafe", label: "Café/wine interior image", type: "image" },
      { key: "station.image_ev", label: "EV charging image", type: "image" },
      { key: "station.image_fuel", label: "Fuel canopy image", type: "image" },
      { key: "station.image_competitor_ref", label: "OKKO reference image", type: "image" },
      { key: "station.image_socar", label: "SOCAR reference image", type: "image" },
      { key: "station.image_portland", label: "Portland streetscape image", type: "image" },
      { key: "station.image_motor_court", label: "Motor court reference image", type: "image" },
      { key: "station.image_battery_swap", label: "Battery swap reference image", type: "image" },
      { key: "station.image_vehicle_relay", label: "Vehicle relay reference image", type: "image" }
    ]
  },
  {
    id: "connection",
    title: "Roviq × Station",
    fields: [
      { key: "connection.hero_eyebrow", label: "Hero eyebrow", type: "text" },
      { key: "connection.hero_heading", label: "Hero heading", type: "text" },
      { key: "connection.hero_sub", label: "Hero subheading", type: "textarea" },
      { key: "connection.parallel_heading", label: "Parallel heading", type: "text" },
      { key: "connection.parallel_body", label: "Parallel body", type: "textarea" },
      { key: "connection.tiein_tow_body", label: "Tow staging tie-in body", type: "textarea" },
      { key: "connection.tiein_parts_body", label: "Parts locker tie-in body", type: "textarea" },
      { key: "connection.tiein_diagnostic_body", label: "Diagnostic drop-off tie-in body", type: "textarea" },
      { key: "connection.tiein_custody_body", label: "Vehicle custody tie-in body", type: "textarea" }
    ]
  },
  {
    id: "about",
    title: "About",
    fields: [
      { key: "about.hero_heading", label: "Hero heading", type: "text" },
      { key: "about.founder_heading", label: "Founder section heading", type: "text" },
      { key: "about.founder_body", label: "Founder story body", type: "textarea" },
      { key: "about.team_heading", label: "Team section heading", type: "text" },
      { key: "about.team_body", label: "Team section body", type: "textarea" },
      { key: "about.contact_heading", label: "Contact heading", type: "text" },
      { key: "about.contact_body", label: "Contact body", type: "textarea" },
      { key: "about.contact_email", label: "Contact email", type: "text" },
      { key: "about.contact_phone", label: "Contact phone", type: "text" },
      { key: "about.image_founder", label: "Founder/story image", type: "image" }
    ]
  }
];

export const DEFAULT_CONTENT = {
  // ---------- HOME ----------
  "home.eyebrow": "One brand. Two systems.",
  "home.headline": "Roviq",
  "home.subheadline": "One shared backend. Many ways in. One physical hub, built the same way.",
  "home.intro":
    "Roviq is a dispatch platform for auto services, and Roviq Station is a physical location built on the same idea. Both start from a single core system and branch into the specific experiences people actually need — digital front ends on one side, physical services on the other.",
  "home.roviq_tagline": "A diagnostic-first dispatch and referral network for auto service.",
  "home.roviq_body":
    "One backend — Roviq Core — sits behind a mobile diagnostic hub, a loaner vehicle pool, and a growing network of partner shops and independent technicians. Five role-based apps share it: Customer, Diagnostic, Shop Partner, Parts Vendor, and Tow Truck.",
  "home.station_tagline": "A Luxury Experience, at an Affordable Price.",
  "home.station_body":
    "One physical location bringing fuel, EV charging, a café, curated wine and retail, and a car wash under a single independent brand — instead of five unrelated stops. Inspired by the OKKO and SOCAR playbooks, built as our own.",
  "home.throughline_heading": "Same architecture, applied twice.",
  "home.throughline_body":
    "Roviq Core is one backend feeding many digital front ends. Roviq Station is one physical location housing many services. Neither is a bundle bolted together after the fact — both were designed from the center outward, so every new front end or every new service line inherits the same routing logic, the same brand, and the same operating discipline.",
  "home.image_roviq": "/photos/dispatch_app_mockup.jpg",
  "home.image_station": "/photos/station_hero.jpg",

  // ---------- ROVIQ ----------
  "roviq.hero_eyebrow": "The platform",
  "roviq.hero_heading": "Roviq Core",
  "roviq.hero_sub":
    "A dispatch and referral network for auto service in the Portland metro area — diagnostic-first, with five purpose-built apps sharing one backend and one database.",
  "roviq.core_heading": "The coordination layer, not another repair shop",
  "roviq.core_body":
    "Roviq's objective isn't to become the largest repair shop in the market — it's to become the coordination layer that sits above every shop and independent technician: the single point of entry customers use, and the system that determines where their business flows. Think of it as Uber or Lyft, but for auto maintenance. The customer doesn't need to know or care which shop or technician handles their car, only that it gets fixed quickly and nearby. Roviq owns the routing intelligence, the data, and the relationships that make the network valuable — at the center are a mobile diagnostic hub, a loaner vehicle pool, and a growing network of partner repair shops and independent mobile technicians.",
  "roviq.dispatch_heading": "How a job actually moves through the network",
  "roviq.dispatch_body":
    "Every job passes through the same diagnostic-first sequence, moving across the five apps in order. Critically, once a job needs a shop, the customer — not an automated matching algorithm — sees the diagnostic findings and picks where the work gets done, from a short list of eligible partners.",
  "roviq.dispatch_steps":
    "Entry (Customer App): a customer submits a request with an urgency level — warning light, dead battery, tire trouble, and similar\nDiagnosis (Diagnostic App): a technician claims the request, diagnoses on-site, and logs findings\nTriage: simple jobs (battery, tire) are handled directly; jobs needing a shop move to the next step\nShop choice (Customer App): the customer sees the findings alongside a ranked shortlist of eligible shops — filtered by job-type match and distance, then ranked by current load, response time, on-time rate, and rating — and picks one\nAcceptance (Shop Partner App): the chosen shop accepts, and provides a loaner if the vehicle must stay\nParts, if needed (Parts Vendor App): additional parts are sourced through the vendor layer and added as their own line item\nTowing or valet, as an alternate path (Tow Truck App): a non-drivable vehicle or a premium-tier driven transfer routes through a separate, real-time layer instead",
  "roviq.frontend_customer_body":
    "Booking, diagnostic intake, choosing a shop once diagnosis is complete, live status, and payment — optimized for speed and zero friction.",
  "roviq.frontend_diagnostic_body":
    "Shows a queue of new requests. The technician claims one, logs findings, and decides whether to handle it directly or send it to the customer for a shop choice.",
  "roviq.frontend_shop_body":
    "Job acceptance, scheduling, and payout tracking — showing a shop only the jobs a customer actually chose them for, not an open pool every shop competes over.",
  "roviq.frontend_vendor_body":
    "Receives part orders tied to a specific job, confirms cost and delivery time, and updates fulfillment status — turning a documented industry cost center (wrong parts and delivery delays cost a mid-size shop an estimated $2,000–$6,000 a month) into tracked, actionable metrics.",
  "roviq.frontend_tow_body":
    "A genuinely separate, real-time layer — because towing is GPS-tracked and urgent-by-definition, closer to a rideshare driver app than a shop dashboard. Covers both towing a non-drivable vehicle and valet (a driver takes the customer's own car to the shop instead), primarily for premium and luxury-tier customers.",
  "roviq.assetlight_heading": "Asset-light, like Uber",
  "roviq.assetlight_body":
    "Uber — Never owned a single vehicle; legal name is Uber Technologies Inc., a technology company, not a transportation company.\nUber — Expansion required software and driver/rider acquisition, not fleet capital.\nRoviq — Owns zero repair bays, zero vehicles.\nRoviq — Loaner fleet sourced from shop, dealership, and fleet-partner inventory, tiered by economy, standard, and luxury, not purchased outright.\nRoviq — A coordination and technology layer connecting customers, shops, and mobile technicians.\nRoviq — Expansion into a new metro requires partner and customer acquisition, not owned real estate or payroll.",
  "roviq.pullquote": "Uber didn't own a single car. We don't own a single repair bay.",
  "roviq.revenue_heading": "Three revenue streams, not one referral fee",
  "roviq.revenue_stats":
    "$89–$129 | Flat diagnostic visit fee, platform-set on every dispatch\n20–30% | Parts markup on Platform-Priced shop jobs\n$99–$499/mo | Self-Priced shop subscription tiers",
  "roviq.revenue_body":
    "Shops choose how they participate. Self-Priced shops keep full control of their own pricing and pay a flat monthly subscription for lead access instead of a per-job cut (Founding Shop free trial, then $99–$499/month by tier). Platform-Priced shops accept jobs at a Roviq-calculated price once a firm diagnosis exists and keep 100% of the labor, while Roviq's margin comes from a 20–30% markup on parts sourced through its vendor network. Underneath both sits the one standardized, high-frequency transaction in the system: a flat, platform-set diagnostic visit fee of $89–$129, paid at the point of dispatch regardless of what repair follows — the steady, predictable base the rest of the model builds on.",
  "roviq.whynow_heading": "Why now",
  "roviq.whynow_body":
    "Structural, not cyclical — the technician shortage is a multi-year trend, not a post-pandemic blip.\nPartners are motivated today — 59% of shops report the shortage is already hurting their business; they need a solution now.\nThe category is proven, the niche is open — mobile-first competitors validated the market, but no dominant hub-and-spoke player has captured it yet.",
  "roviq.market_heading": "A structural, well-documented pain point",
  "roviq.market_stats":
    "2.27M | Portland metro population — the initial target market\n$435B | U.S. vehicle repair & maintenance spend this year\n$3.9B | North American mobile mechanic market (2025)\n12.8 yrs | Average U.S. vehicle age — oldest on record",
  "roviq.market_body":
    "Portland metro's population is approximately 2.27 million — the initial target market, the same sequencing Uber used in San Francisco before national and global expansion. U.S. consumers will spend an estimated $435 billion on vehicle repair and maintenance this year, within a North American mobile mechanic services market valued at roughly $3.9 billion in 2025. The average U.S. vehicle is now 12.8 years old — the oldest on record — and needs more frequent service. Industry-wide average appointment wait is 3.2 days, and some dealership backlogs run four weeks or more. Roughly 967,000 technicians serve 270,300 independent repair shops nationally, against a Bureau of Labor Statistics-projected shortfall of 68,000 technicians a year for the next decade. This isn't a cyclical gap — it's a multi-year structural trend, and shops already see it in their own booking calendars.",
  "roviq.dealership_heading": "Extending dealership diagnostic capacity",
  "roviq.dealership_body":
    "Beyond repair-bay overflow, most dealerships face a distinct, often larger constraint: diagnostic throughput itself — a multi-day wait just to find out what's wrong, before repair even enters the picture. Roviq's technicians function as an extension of a dealership's own diagnostic capacity, reaching into the customer's driveway on the dealership's behalf. Our technicians carry professional-grade diagnostic equipment, not OEM-certified factory tools — so any case needing certified warranty determination still routes straight back to the dealership, exactly like every other warranty and OEM job. Customers rotate through the network over time, not permanently to whichever partner handled one job: warranty and OEM work always comes back, and as a dealership's own capacity opens up, the network routes business their way too.",
  "roviq.playbook_heading": "A proven playbook, recombined",
  "roviq.playbook_body":
    "Uber — Platform sets the price and takes a margin: the diagnostic visit fee (always platform-priced) and Platform-Priced shop mode use a fixed price and standardized labor payout, with Roviq keeping the spread.\nUber Eats — Shelf-and-bin pickup guidance, no staff needed: a technician walks into the parts hub already knowing exactly which shelf and bin holds the part their job needs.\nAmazon — Consignment fulfillment, vendor-owned until sold: parts hub inventory stays the vendor's property until a technician marks a part used, no transaction and no capital cost until then.\nLyft — Reliability-based ranking feeds dispatch: partner performance and on-time rate directly drive the shop-ranking algorithm, so reliability is enforced by the matching logic, not just reported.\nHertz / Turo — A rental supply chain plugged into dispatch: Fleet Partners supply tiered loaner inventory at scale, the same rental-supply pattern, without Roviq owning or buying a fleet.\nAmazon Prime — Same-day fetch or scheduled, promised-time delivery: loaner vehicles reuse the same driver-dispatch and promised-completion infrastructure as tow and valet.",
  "roviq.competitors_heading": "A validated, well-capitalized category",
  "roviq.competitors_body":
    "The \"Uber for car maintenance\" concept has already attracted real capital: YourMechanic and Wrench (mobile-first, contractor mechanics, $50.8M raised, acquired 2022), RepairSmith (mobile-first, employee technicians, acquired by Mercedes-Benz AG after a $42M round), and RepairPal (a directory connecting customers to 2,000+ certified shops, no diagnostic or dispatch layer, acquired by Yelp for roughly $80 million) have collectively raised well over $150 million. Every existing player has optimized for one half of the problem — the mobile-first players never offer a diagnostic-only first step, and RepairPal has no dispatch or diagnostic layer at all. Roviq is the only model combining a doorstep diagnostic-first entry point with active routing into brick-and-mortar shops, plus a loaner-vehicle layer sourced from partner shops' and dealerships' unsold inventory — a pain point (idle, depreciating inventory) none of the researched competitors address at all.",
  "roviq.ask_heading": "The ask",
  "roviq.ask_stats":
    "$150K | Current pre-seed ask\n~$1.0M | Illustrative Year 1 revenue\n~$2.6M | Illustrative Year 2 revenue",
  "roviq.ask_body":
    "Roviq is raising a $150,000 pre-seed round, funding the full project through Phase D2 — all five apps, AI diagnostic triage, the loaner fleet, marketing, founder runway, and a 12-month operating buffer, with the technical and business co-founders now leading execution alongside the founder.",
  "roviq.ask_funds":
    "Customer + Diagnostic apps (incl. AI triage) — $24,000\nPricing engine + Stripe Connect + technician payout — $16,000\nShop Partner app + matching — $12,000\nParts Vendor app + add-to-order — $11,000\nDiagnostic tool, equipment + labor-guide license — $5,000\nLoaner vehicle pool + insurance — $13,000\nMarketing & promotion — $9,000\nPartner & customer acquisition incentives — $5,000\nFounder runway (12 months) — $40,000\nLegal, cap table & operating buffer — $15,000\nTotal — $150,000",
  "roviq.ask_milestones":
    "All five apps live in the Portland metro, AI diagnostic triage in production\n5+ active partner shops signed and referring\nParts vendor layer live and tracking wrong-part / delay metrics\nDefined referral and parts volume within 12 months",
  "roviq.stack_heading": "Built on proven technology, not custom infrastructure",
  "roviq.stack_body":
    "Frontend — React (Next.js), one shared component library across all four customer-facing apps.\nBackend / API — Node.js (Express), built as a modular monolith rather than microservices — well-defined internal modules for assessment, AI triage, matching, and state, called directly by API handlers, simple to build and debug at this stage. Every app reads and writes through this one layer; no app ever talks to another app directly.\nDatabase — PostgreSQL, a single instance and the single source of truth for all five apps, with every state transition logged to an event table, not just overwritten.\nAuth — JWT (Passport.js / Auth.js): unauthenticated for the customer flow in MVP, login-gated for every partner and vendor app.\nNotifications — Twilio (SMS), Postmark / SendGrid (email).\nPayments — Stripe, invoicing first, Connect later.\nHosting — Vercel (frontend) plus Railway / Render (backend and database) — low-ops, appropriate to MVP scale, with event-driven infrastructure and a job queue treated as a real-time-dispatch-triggered upgrade, not a default.",
  "roviq.dispatch_image": "/photos/dispatch_app_mockup.jpg",

  // ---------- STATION ----------
  "station.hero_eyebrow": "Roviq Station",
  "station.hero_heading": "One stop. Every service you actually need.",
  "station.tagline": "A Luxury Experience, at an Affordable Price.",
  "station.hero_sub":
    "Roviq Station adapts OKKO's Ukrainian \"filling complex\" model — full-service fuel plus a genuine café, curated wine, and retail — for the US market: European-style hospitality and curation, delivered inside a footprint that fits US site economics, drive-through expectations, and state-by-state alcohol law.",
  "station.concept_heading": "The concept",
  "station.concept_body":
    "Roviq Station borrows the look, materials, and hospitality standard of a premium brand — glass architecture, curated retail, real sit-down seating, genuine coffee and food craft — but prices it at mainstream convenience-store levels, not boutique-café or wine-bar levels. The luxury is in the experience and design language, not the price tag; the accessibility is what makes it a daily habit rather than an occasional treat. Roviq Station is a fully independent US brand: no OKKO license, no SOCAR license, no franchise or trademark dependency on either company. OKKO and SOCAR are existing registered brands (Galnaftogaz/OKKO Group and the State Oil Company of Azerbaijan) used strictly as strategic reference models — OKKO for its hospitality/food/wine playbook, SOCAR for its premium-fuel and acquisition-led entry playbook. Their names, marks, and identities are not used commercially anywhere in Roviq Station's branding.",
  "station.market_heading": "Why now: the US market already agrees",
  "station.market_stats":
    "$817.5B | US convenience-store industry sales (2025)\n152,000 | US locations — 23rd straight year of growth\n28.5% | Foodservice share of in-store sales\n58% | Would bypass a closer competitor for a signature food item",
  "station.market_body":
    "US convenience-store industry sales reached $817.5B across roughly 152,000 locations in 2025 — a 23rd consecutive year of in-store sales growth. Foodservice now represents about 28.5% of in-store sales, and 58% of consumers say they'd bypass a closer competitor for a brand with a signature food item. A direct copy of the Ukrainian format won't fit US expectations, though: speed stays non-negotiable for the fast-lane customer — pump, grab-and-go, pay, leave — and every slower feature in this plan (sit-down café, wine, motor court, dwell-time features) is opt-in for a customer already choosing to spend time, never a change to what the fast lane owes the rushed customer. If the two ever compete for the same path or staff attention, the fast lane wins. Self-service defaults (pay-at-pump, self-checkout, app ordering), a branded loyalty app, and larger to-go formats are expected, not novel. Alcohol is regulated state-by-state, not nationally, so site selection has to be filtered by state ABC law before any wine program is finalized.",
  "station.proof_heading": "A real-world proof point, ten minutes from Portland",
  "station.proof_body":
    "Krays Coffee, a Ukrainian-owned café in an ordinary Vancouver, WA strip mall, has built a 4.4–4.5-star following doing the opposite of fast-and-generic: real sit-down seating, Eastern European sweet breads and pastries, local-artist wall displays, and an unhurried atmosphere customers say is worth a 15–20 minute wait. This validates three things directly: American customers will choose sit-down European-café hospitality over speed when the experience earns it; an authentic Ukrainian heritage story is a genuine asset here, not something to downplay; and unglamorous real estate doesn't cap what the concept can become if the hospitality is real. Roviq Station's takeaway: budget for genuine sit-down seating, lean into the founder's Ukrainian heritage in the brand story, and don't over-index site selection on \"perfect\" real estate.",
  "station.benchmark_heading": "Competitive benchmark",
  "station.benchmark_body":
    "Wawa — custom hoagies and top-ranked customer satisfaction; proof food quality plus service builds loyalty beyond fuel\nQuikTrip (QT) — clean stores, extensive fresh food; the benchmark for operational execution and site cleanliness\nBuc-ee's — massive travel-center format, brand-as-destination; shows US appetite for a c-store as \"a stop worth choosing\"\nCasey's — signature food (breakfast pizza), rural density; proprietary food items create a loyalty barrier competitors can't copy\n7-Eleven — scale leader, Slurpee/brand icon items; sets the baseline convenience bar nationally",
  "station.service_fuel_body":
    "Standard gasoline grades plus diesel, with an optional premium \"Nano\"-style top-grade fuel line as a separately branded, price-insensitive upgrade path — not the default.",
  "station.service_ev_body":
    "An EV charging bank as a differentiator and dwell-time driver — per 2026 industry trend data, EV infrastructure is now a top-6 convenience-store trend.",
  "station.service_cafe_body":
    "Coffee as the anchor product (drip, espresso, cold brew, fully customizable), plus a small, fresh, rotating hot-food menu built around 1–2 signature items the brand becomes known for — the same way Casey's owns breakfast pizza.",
  "station.service_wine_body":
    "20–40 curated labels, not a full liquor-store range, paired with a cheese/charcuterie case to sell \"dinner,\" not just a bottle — subject to a state-by-state legal check before the program is finalized at any specific site.",
  "station.service_wash_body":
    "A high-margin, low-labor car wash and vacuum module — often the single most profitable module per square foot in the format.",
  "station.layout_heading": "How the site is laid out",
  "station.layout_body":
    "The forecourt logic is already close to US best practice: one-way circulation, separate wash/EV queuing, and the store itself as the visual anchor. Interior zoning splits the fast lane (grab-and-go, checkout) from the sit-down café side (seating, hot food, wine aisle), so a 90-second customer and a 20-minute customer never compete for the same path.",
  "station.portland_heading": "Why Portland, Oregon first",
  "station.portland_body":
    "The Portland entry runs the SOCAR path: acquisition or joint venture with an existing, underperforming independent fuel site near a freeway corridor (I-84/I-205) or a dense NE/SE Portland commercial strip — not a greenfield build. An existing site brings an already-permitted fuel license and USTs, which materially shortens time-to-open. Sequence: acquire, then reconstruct the forecourt/canopy and add the EV bank, then build out café/wine retail inside the existing footprint, then validate 6–12 months before any second site. Three Oregon-specific facts shape the plan: Multnomah County allows self-service on at most 50% of pumps — the other 50% must stay attendant-run at all hours, a standing payroll line, not optional; OLCC governs off-premise beer and wine, with hard liquor restricted to state-contracted stores and out of scope entirely; and Oregon has no state sales tax, a genuine, usable edge on the café/wine/retail side. The Oregon Clean Fuels Program also lets EV charging register as a credit-generating activity — a real revenue line on top of per-kWh fees, not just a differentiator. The café partners with a known local roaster rather than running a generic in-house program, the wine list leans toward Willamette Valley producers alongside imports, and the brand narrative leads with the founder's Ukrainian roots and the OKKO/SOCAR-inspired format rather than positioning this as an imported franchise.",
  "station.financials_heading": "Illustrative financial frame",
  "station.financials_body":
    "Directional, industry-pattern ranges to frame planning discussions — not a projection for any specific site, and not financial or investment advice. Per site, annually: fuel gross margin $250K–$450K (thin per-gallon margin, driven by volume); in-store (food, wine, retail) gross margin $300K–$650K; EV charging $20K–$80K (currently more differentiator than profit center); car wash $80K–$200K (often the single most profitable module per square foot); build-out cost for a new site $3.5M–$7M+ (highly variable by land cost, canopy size, and market). Actual figures depend heavily on land cost, fuel volume, local competition, and state alcohol law, and should be built from real site-level data before any capital commitment.",
  "station.risks_heading": "Key risks",
  "station.risks_body":
    "Trademark/brand risk if the OKKO or SOCAR name were ever used without a formal license — which is why Roviq Station uses neither. Alcohol licensing complexity varies enough by state and county that the wine program may need to be a market-by-market variable, not a fixed standard. New-build fuel sites carry high capital intensity — land, environmental (UST) permitting, and construction can run well past initial estimates, part of why the Portland pilot is acquisition-led instead. And entrenched, well-capitalized competitors (Wawa, QT, Buc-ee's) already occupy the \"food + fuel done well\" position in many strong markets, so pilot site selection needs genuine white space, not a head-on fight.",
  "station.roadmap_heading": "The staged roadmap",
  "station.roadmap_body":
    "Everything in this plan collapses into three strategic tiers. Tier 1 is the actual business and must be proven before anything else is funded. Tier 2 is cheap, low-risk upside that layers directly onto a working pilot. Tier 3 is a set of genuine moonshots — each interesting, none assumed into the base case, each requiring its own validation before capital commitment.",
  "station.tier1_heading": "Tier 1 — Core pilot",
  "station.tier1_body":
    "Stages 0–2, months 0–15. Stage 0: lock the brand, select the Portland/Oregon corridor, run the state regulatory screen. Stage 1: acquire or JV an existing site (SOCAR-style entry), reconstruct the forecourt, build out café plus curated wine/retail plus standard EV charging, staff to Multnomah County's attendant requirement. Stage 2: run the single site 6–12 months, measuring food/wine attach rate, EV utilization, and labor cost — the go/no-go checkpoint for everything else.",
  "station.tier2_heading": "Tier 2 — Low-capex layer",
  "station.tier2_body":
    "Stages 3–5, months 12–24, additive to a working pilot. Stage 3: bolt on the Roviq Core tie-ins (parts locker, tow staging, diagnostic drop-off) — cheap relative to the pilot build. Stage 4: add the SOCAR-style premium fuel bay and VIP loyalty program once base traffic is proven. Stage 5: replicate the now-proven format at a second site, ideally on the same I-5 corridor.",
  "station.tier3_heading": "Tier 3 — Moonshot",
  "station.tier3_body":
    "Stages 6–8, 24+ months, each its own business case. Stage 6: motor court — boutique lodging, only at a genuine destination/road-trip site. Stage 7: battery swap — fleet-focused, most realistically via an Ample-style partnership rather than in-house tech. Stage 8: vehicle relay network — only viable once 3+ sites exist on one corridor, explicitly the last-mover module in the whole plan. Fund and de-risk Tier 1 completely before spending real capital on Tier 2, and treat every Tier 3 module as a separate pitch with its own numbers.",
  "station.expansion_heading": "Expansion concepts",
  "station.expansion_body":
    "Three Tier 3 concepts extend the Roviq Station idea past the first site. Each is presented on its own with its own diagram, and each is explicitly later-stage — none of these are part of the funded Tier 1 pilot.",
  "station.expansion_motor_court_body":
    "A boutique motor-court revival, timed with Route 66's centennial and the live 2026 trend of restored properties appearing in the MICHELIN Guide as legitimate boutique stays. EV dwell time is the enabler: a 20–30 minute charge is currently dead time at every competitor's site; a small motor court (10–20 rooms around a courtyard) turns that same dwell time into an overnight-stay opportunity instead of losing the traveler the moment charging finishes. It also reframes Oregon's attendant-service requirement as authentic branding — uniformed attendants and windshield service read as genuine \"golden age full service,\" not compliance overhead. This is a Phase 3+ concept, evaluated only at a genuine destination/road-trip site, not part of the initial pilot.",
  "station.expansion_post_station_body":
    "\"Post Station\" — named for 19th-century relay stations that swapped a tired horse for a fresh one rather than resting it for hours. Applied to EVs: exchange a depleted battery for a charged one in minutes instead of a 20–40 minute charge. This is proven at scale in China — NIO operates roughly 9,000 charging and swap facilities, completed its 100-millionth swap in February 2026, and swaps average about 3 minutes — and exists in the US today at smaller scale via Ample, a Shell Ventures/Repsol-backed startup already pairing swap stations with a Repsol fuel retail forecourt in Madrid. Honest constraint: no major US consumer EV currently ships swap-ready from the factory, so a Roviq Station swap bay would realistically serve fleet, rideshare, and delivery vehicles first — a fleet-focused module and a long-term option, not a near-term mass-market feature.",
  "station.expansion_vehicle_relay_body":
    "The more literal version of the historic analog: stagecoach lines swapped entire teams, and sometimes the coach itself, at fixed relay stations. Applied today, a traveler drops off a Roviq rental EV at one station and picks up a different, fully-charged one at the next — the same Hertz/Turo-style one-way rental logic already in Roviq's own platform strategy, applied to a fixed physical corridor. The honest risk, shared by every one-way rental network including U-Haul: vehicles pile up at popular destinations and run short at popular origins, requiring paid repositioning. This requires 3+ Roviq Station sites on one fixed corridor before it's viable at all — the natural first candidate is the I-5 Pacific Northwest spine (Seattle–Portland–Eugene) — and should be modeled and piloted separately from the core fuel/café/wine business.",
  "station.image_hero": "/photos/station_hero_v2.jpg",
  "station.image_cafe": "/photos/station_interior_cafe.jpg",
  "station.image_ev": "/photos/station_ev_charging.jpg",
  "station.image_fuel": "/photos/station_forecourt_reference.jpg",
  "station.image_competitor_ref": "/photos/reference_board.jpg",
  "station.image_socar": "",
  "station.image_portland": "",
  "station.image_motor_court": "/photos/motor_court_reference.jpg",
  "station.image_battery_swap": "/photos/swap_station_reference.jpg",
  "station.image_vehicle_relay": "/photos/relay_station_reference.jpg",

  // ---------- CONNECTION ----------
  "connection.hero_eyebrow": "Where they meet",
  "connection.hero_heading": "Roviq × Roviq Station",
  "connection.hero_sub":
    "Roviq Core is one backend feeding many digital front ends. Roviq Station is one hub housing many physical services. They're the same idea, and on the ground, they connect directly.",
  "connection.parallel_heading": "One hub, many services — twice",
  "connection.parallel_body":
    "Roviq Station isn't a separate idea from the Roviq auto-marketplace platform — it's the same architecture, applied physically. Roviq Core runs one shared backend with multiple role-based front ends (Customer, Diagnostic, Shop Partner, Parts Vendor, Tow Truck), none of which talk to each other directly; Core does all routing, ranking, and state transitions. Roviq Station is the physical equivalent: one location, multiple services (fuel, EV charging, café, wine/retail, car wash), aggregated under one operating system rather than built as five unrelated stops. This is a strategic option, not a requirement — Roviq Station stands on its own as a business even without these integrations; they're upside, not a dependency.",
  "connection.tiein_tow_body":
    "Roviq Station can serve as a designated drop-off/staging point for Roviq-dispatched tow jobs — a physical node the routing logic already knows how to send vehicles to.",
  "connection.tiein_parts_body":
    "The site's retail footprint can host a Roviq parts-locker pickup point — the same unmanned, badge-access, Amazon-Locker-style pattern already scoped for the parts hub — turning a café visit into a parts pickup errand.",
  "connection.tiein_diagnostic_body":
    "Roviq Station's EV bays and wash bay are natural dwell-time slots for a Tier 1 diagnose-and-route visit, with the café as the waiting area instead of a folding chair in a service bay.",
  "connection.tiein_custody_body":
    "Roviq Station can act as a hand-off point for ROVIC vehicle custody transfers, consistent with its role as a trusted, staffed physical location — naming it Roviq Station rather than a standalone brand keeps the physical and digital businesses legible as one ecosystem.",

  // ---------- ABOUT ----------
  "about.hero_heading": "About",
  "about.founder_heading": "Why we're building this",
  "about.founder_body":
    "Roviq is built and led by Oleksandr Dmytruk, based in Portland, Oregon. Roviq and Roviq Station both come from the same instinct: that the businesses people rely on for their vehicles are more fragmented than they need to be, and that fragmentation is a solvable design problem, not a fact of life. That instinct comes from a combination of a postgraduate diploma in Information Systems and Technology, hands-on experience in real estate and property management, and a systems-thinking approach to how physical operations and software fit together. It's also backed by direct experience building a new system from scratch — designing and deploying a full working platform, the ASCEND card system, including its data structure, live application logic, and deployment, with nothing like it to copy from. The throughline across all of it is the same: build the core system once, and let it serve more people through more doors than a single-purpose product ever could.",
  "about.team_heading": "The team",
  "about.team_body":
    "Roviq is not a solo build. Eric serves as Chief Technology Officer (CTO), owning technical architecture and build execution — apps, databases, and infrastructure across all five platform experiences and Roviq Core. Alex serves as Chief Financial Officer (CFO), bringing entrepreneurial and operating experience that complements the founder's product and technical background. This structure means Roviq is no longer a single-founder dependency for the product, technical, or financial side.",
  "about.contact_heading": "Get in touch",
  "about.contact_body":
    "For partnership, investment, or press inquiries, reach out directly — we read every message ourselves.",
  "about.contact_email": "admytruk@proton.me",
  "about.contact_phone": "",
  "about.image_founder": ""
};

export function flattenSchema() {
  const fields = [];
  for (const section of CONTENT_SECTIONS) {
    for (const field of section.fields) {
      fields.push({ ...field, section: section.title, sectionId: section.id });
    }
  }
  return fields;
}
