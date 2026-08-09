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
      { key: "roviq.revenue_heading", label: "Revenue model heading", type: "text" },
      { key: "roviq.revenue_body", label: "Revenue model body", type: "textarea" },
      { key: "roviq.market_heading", label: "Market opportunity heading", type: "text" },
      { key: "roviq.market_body", label: "Market opportunity body", type: "textarea" },
      { key: "roviq.dealership_heading", label: "Dealership partnerships heading", type: "text" },
      { key: "roviq.dealership_body", label: "Dealership partnerships body", type: "textarea" },
      { key: "roviq.playbook_heading", label: "Competitive landscape heading", type: "text" },
      { key: "roviq.playbook_body", label: "Competitive landscape body", type: "textarea" },
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
      { key: "station.service_fuel_body", label: "Fuel service body", type: "textarea" },
      { key: "station.service_ev_body", label: "EV charging body", type: "textarea" },
      { key: "station.service_cafe_body", label: "Café body", type: "textarea" },
      { key: "station.service_wine_body", label: "Wine & retail body", type: "textarea" },
      { key: "station.service_wash_body", label: "Car wash body", type: "textarea" },
      { key: "station.layout_heading", label: "Layout section heading", type: "text" },
      { key: "station.layout_body", label: "Layout section body", type: "textarea" },
      { key: "station.portland_heading", label: "Portland section heading", type: "text" },
      { key: "station.portland_body", label: "Portland section body", type: "textarea" },
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
      { key: "station.image_okko", label: "OKKO reference image", type: "image" },
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
  "home.image_roviq": "",
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
    "Entry (Customer App): a customer submits a request with an urgency level — warning light, dead battery, tire trouble, and similar\nDiagnosis (Diagnostic App): a technician claims the request, diagnoses on-site, and logs findings\nTriage: simple jobs (battery, tire) are handled directly; jobs needing a shop move to the next step\nShop choice (Customer App): the customer sees the findings alongside eligible shops (distance, rating, job types) and picks one\nAcceptance (Shop Partner App): the chosen shop accepts, and provides a loaner if the vehicle must stay\nParts, if needed (Parts Vendor App): additional parts are sourced through the vendor layer and added as their own line item\nTowing or valet, as an alternate path (Tow Truck App): a non-drivable vehicle or a premium-tier driven transfer routes through a separate, real-time layer instead",
  "roviq.frontend_customer_body":
    "Booking, diagnostic intake, choosing a shop once diagnosis is complete, live status, and payment — optimized for speed and zero friction.",
  "roviq.frontend_diagnostic_body":
    "Shows a queue of new requests. The technician claims one, logs findings, and decides whether to handle it directly or send it to the customer for a shop choice.",
  "roviq.frontend_shop_body":
    "Job acceptance, scheduling, and payout tracking — showing a shop only the jobs a customer actually chose them for, not an open pool every shop competes over.",
  "roviq.frontend_vendor_body":
    "Receives part orders tied to a specific job, confirms cost and delivery time, and updates fulfillment status.",
  "roviq.frontend_tow_body":
    "A genuinely separate, real-time layer — because towing is GPS-tracked and urgent-by-definition, closer to a rideshare driver app than a shop dashboard. Covers both towing a non-drivable vehicle and valet (a driver takes the customer's own car to the shop instead), primarily for premium and luxury-tier customers.",
  "roviq.revenue_heading": "Three revenue streams, not one referral fee",
  "roviq.revenue_body":
    "Shops choose how they participate. Self-Priced shops keep full control of their own pricing and pay a flat monthly subscription for lead access instead of a per-job cut (Founding Shop free trial, then roughly $99–$499/month by tier). Platform-Priced shops accept jobs at a Roviq-calculated price once a firm diagnosis exists, keep 100% of the labor, while Roviq's margin comes from a markup on parts sourced through its vendor network. Underneath both sits the one standardized, high-frequency transaction in the system: a flat, platform-set diagnostic visit fee, paid at the point of dispatch regardless of what repair follows — the steady, predictable base the rest of the model builds on.",
  "roviq.market_heading": "A structural, well-documented pain point",
  "roviq.market_body":
    "Portland metro's population is approximately 2.27 million, and U.S. consumers will spend an estimated $435 billion on vehicle repair and maintenance this year. The average U.S. vehicle is now 12.8 years old — the oldest on record — and needs more frequent service. Industry-wide average appointment wait is 3.2 days, and some dealership backlogs run four weeks or more. Roughly 967,000 technicians serve 270,300 independent repair shops nationally, against a Bureau of Labor Statistics-projected shortfall of 68,000 technicians a year for the next decade. This isn't a cyclical gap — it's a multi-year structural trend, and shops already see it in their own booking calendars.",
  "roviq.dealership_heading": "Extending dealership diagnostic capacity",
  "roviq.dealership_body":
    "Beyond repair-bay overflow, most dealerships face a distinct, often larger constraint: diagnostic throughput itself — a multi-day wait just to find out what's wrong, before repair even enters the picture. Roviq's technicians function as an extension of a dealership's own diagnostic capacity, reaching into the customer's driveway on the dealership's behalf. Our technicians carry professional-grade diagnostic equipment, not OEM-certified factory tools — so any case needing certified warranty determination still routes straight back to the dealership, exactly like every other warranty and OEM job. Customers rotate through the network over time, not permanently to whichever partner handled one job: warranty and OEM work always comes back, and as a dealership's own capacity opens up, the network routes business their way too.",
  "roviq.playbook_heading": "A validated, well-capitalized category",
  "roviq.playbook_body":
    "The \"Uber for car maintenance\" concept has already attracted real capital: YourMechanic and Wrench (mobile-first, contractor mechanics, $90M+ raised), RepairSmith (mobile-first, employee technicians, acquired by Mercedes-Benz AG after a $42M round), and RepairPal (a certification and referral directory, acquired by Yelp for roughly $80 million) have collectively raised over $150 million. Every existing player has optimized for one half of the problem — the mobile-first players never offer a diagnostic-only first step, and RepairPal has no dispatch or diagnostic layer at all. Roviq is the only model combining a doorstep diagnostic-first entry point with active routing into brick-and-mortar shops, plus a loaner-vehicle layer sourced from partner shops' and dealerships' unsold inventory — a pain point (idle, depreciating inventory) none of the researched competitors address at all.",
  "roviq.dispatch_image": "",

  // ---------- STATION ----------
  "station.hero_eyebrow": "Roviq Station",
  "station.hero_heading": "One stop. Every service you actually need.",
  "station.tagline": "A Luxury Experience, at an Affordable Price.",
  "station.hero_sub":
    "Fuel, EV charging, a café, curated wine and retail, and a car wash — aggregated under one brand, at one location, instead of built as five unrelated stops.",
  "station.concept_heading": "The concept",
  "station.concept_body":
    "Roviq Station is an independent brand. We are not licensed by, affiliated with, or operating under the OKKO or SOCAR name — those two chains are strategic reference models only: OKKO for its hospitality and food-service playbook, SOCAR for its premium-fuel positioning and acquisition-led market entry. We borrowed the logic, not the brand, and built our own identity around it.",
  "station.service_fuel_body":
    "Premium and standard fuel grades under a canopy designed to feel like arrival, not a commodity stop.",
  "station.service_ev_body":
    "Fast-charging bays positioned as a first-class use case, not an afterthought retrofit — built for the wait, not just the plug.",
  "station.service_cafe_body":
    "A real café, not a warmer case — quality coffee and food worth the stop on its own merits.",
  "station.service_wine_body":
    "A curated, small-format wine and retail selection that treats the stop as a destination, not a convenience aisle.",
  "station.service_wash_body":
    "A fast, high-quality wash bundled into the same visit, so the stop covers the whole vehicle, not just the tank.",
  "station.layout_heading": "How the site is laid out",
  "station.layout_body":
    "Every service line shares one forecourt and one building envelope by design: fuel and EV charging sit under a shared canopy at the perimeter, the café and retail anchor the center so foot traffic from fuel and charging both pass through it, and the wash sits at the rear for a clean traffic flow in and out. The interior is built around the same principle — one counter, one queue, multiple revenue lines.",
  "station.portland_heading": "Why Portland, Oregon first",
  "station.portland_body":
    "Portland gives us a SOCAR-style acquisition entry: buy or convert an existing site rather than build from raw ground, which shortens time to open. Oregon's attendant-pump law (self-service is only legal in larger counties as of recent reform, and full-service remains the norm in many areas) is a real operating constraint we're designing staffing around from day one, not discovering later. OLCC rules limit on-site retail to wine and beer, not spirits, which shapes the retail assortment. And Oregon has no state sales tax, which is a genuine, if modest, margin and pricing advantage on every retail and food item sold on-site.",
  "station.roadmap_heading": "The staged roadmap",
  "station.roadmap_body":
    "We are sequencing this deliberately in three tiers, and we want that sequencing to be unmistakable everywhere it shows up — what we're building now is not the same claim as what we might build later.",
  "station.tier1_heading": "Tier 1 — Core pilot",
  "station.tier1_body":
    "The first Roviq Station location: fuel, EV charging, café, wine and retail, and car wash, operating as one integrated site. This is what gets built and funded first, and it's the only tier we're making near-term commitments against.",
  "station.tier2_heading": "Tier 2 — Low-capex layer",
  "station.tier2_body":
    "Additional revenue and service lines that can be added to an operating Tier 1 site without major new construction — expanded retail assortment, loyalty and membership tie-ins to the Roviq platform, and added charging capacity as utilization proves out.",
  "station.tier3_heading": "Tier 3 — Moonshot",
  "station.tier3_body":
    "Later-stage, higher-capex concepts that extend the same one-hub-many-services logic well beyond a single site: motor court hospitality, battery swap infrastructure, and vehicle relay. These are directional, not committed, and are presented here as concepts, not plans.",
  "station.expansion_heading": "Expansion concepts",
  "station.expansion_body":
    "Three Tier 3 concepts extend the Roviq Station idea past the first site. Each is presented on its own with its own diagram, and each is explicitly later-stage — none of these are part of the funded Tier 1 pilot.",
  "station.expansion_motor_court_body":
    "A boutique motor-court revival, in the spirit of the Route 66 restoration trend: short-stay lodging built around the same forecourt, for travelers who want to fuel, charge, eat, and rest without leaving one site.",
  "station.expansion_post_station_body":
    "\"Post Station\" — a battery-swap layer inspired by NIO and Ample, letting EV drivers exchange a depleted pack for a charged one in minutes instead of waiting to charge, for vehicles built to support it.",
  "station.expansion_vehicle_relay_body":
    "A vehicle relay concept: using the station network as custody hand-off points for vehicles in transit — service, delivery, or fleet repositioning — tying the physical network back into Roviq Core's dispatch logic.",
  "station.image_hero": "/photos/station_forecourt_dusk.jpg",
  "station.image_cafe": "/photos/station_interior_cafe.jpg",
  "station.image_ev": "",
  "station.image_fuel": "/photos/station_forecourt_reference.jpg",
  "station.image_okko": "/photos/reference_board.jpg",
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
    "The parallel isn't a metaphor we reached for after the fact — it's the design principle both were built on. Roviq Core routes a job to the right provider from a single source of truth; Roviq Station routes a customer to the right service from a single physical location. Put them in the same place and the two systems start doing real work together.",
  "connection.tiein_tow_body":
    "A Roviq Station location doubles as a staging point for tow dispatch — a known, mapped site where a tow job can be routed to hand off a vehicle, rather than an arbitrary curb.",
  "connection.tiein_parts_body":
    "Parts ordered through the Parts Vendor app can be routed to a locker at a Roviq Station for pickup, turning the station into a fulfillment point for the platform, not just a stop for gas.",
  "connection.tiein_diagnostic_body":
    "A customer dropping a vehicle off for diagnostic work has somewhere real to wait — the café — instead of a folding chair in a service bay.",
  "connection.tiein_custody_body":
    "Vehicle relay hand-offs (ROVIC) use Roviq Station sites as the custody point where a vehicle formally changes hands between legs of a trip, logged in the same system that dispatched it.",

  // ---------- ABOUT ----------
  "about.hero_heading": "About",
  "about.founder_heading": "Why we're building this",
  "about.founder_body":
    "Roviq is built and led by Oleksandr Dmytruk, based in Portland, Oregon. Roviq and Roviq Station both come from the same instinct: that the businesses people rely on for their vehicles are more fragmented than they need to be, and that fragmentation is a solvable design problem, not a fact of life. That instinct has roots in a Ukrainian upbringing where resourcefulness wasn't optional, a postgraduate background in Information Systems and Technology, and hands-on experience designing and deploying a full working platform from concept to production — the ASCEND card system, including its data structure, live application logic, and deployment. The throughline across all of it is the same: build the core system once, and let it serve more people through more doors than a single-purpose product ever could.",
  "about.team_heading": "The team",
  "about.team_body":
    "Roviq is not a solo build. Eric serves as Chief Technology Officer, owning technical architecture and build execution — apps, databases, and infrastructure across all five platform experiences and Roviq Core. Alex is Co-Founder, bringing entrepreneurial and operating experience that complements the founder's product and technical background. This structure means Roviq is no longer a single-founder dependency for either the product or the business side.",
  "about.contact_heading": "Get in touch",
  "about.contact_body":
    "For partnership, investment, or press inquiries, reach out directly — we read every message ourselves.",
  "about.contact_email": "admytruk@proton.me",
  "about.contact_phone": "360-865-8192",
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
