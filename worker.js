/**
 * Invisible Strike — paywall worker (Cloudflare Workers)
 *
 * Stub for the Stripe/session-verification piece referenced in the build
 * spec. Not wired to a live Stripe account in this build — fill in
 * STRIPE_SECRET_KEY, STRIPE_PRICE_ID, and an ENTITLEMENTS KV binding in
 * wrangler.toml before deploying, then this becomes a drop-in unlock flow
 * for the client's paywallSheet() / startCheckout() calls in js/app.js.
 *
 * Routes:
 *   POST /api/create-checkout-session  -> { url }            create a Stripe Checkout session
 *   GET  /api/verify-session?session_id=...  -> { unlocked, token }   confirm payment, mint a device token
 *   GET  /api/check-entitlement?token=...    -> { unlocked }         look up an existing token
 *   POST /api/stripe-webhook                  -> 200                 record entitlement server-side on checkout.session.completed
 */

const STRIPE_API = "https://api.stripe.com/v1";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/create-checkout-session") {
      return createCheckoutSession(env, url);
    }
    if (request.method === "GET" && url.pathname === "/api/verify-session") {
      return verifySession(request, env, url);
    }
    if (request.method === "GET" && url.pathname === "/api/check-entitlement") {
      return checkEntitlement(request, env, url);
    }
    if (request.method === "POST" && url.pathname === "/api/stripe-webhook") {
      return stripeWebhook(request, env);
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  }
};

async function createCheckoutSession(env, url) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    return json({ error: "Stripe not configured" }, 501);
  }
  const origin = url.origin;
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": env.STRIPE_PRICE_ID,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/index.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/index.html?checkout=cancelled`
  });
  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data.error?.message || "Stripe error" }, 502);
  return json({ url: data.url });
}

async function verifySession(request, env, url) {
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return json({ error: "missing session_id" }, 400);
  if (!env.STRIPE_SECRET_KEY) return json({ error: "Stripe not configured" }, 501);

  const res = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  const session = await res.json();
  if (!res.ok) return json({ error: session.error?.message || "Stripe error" }, 502);

  const paid = session.payment_status === "paid";
  if (paid && env.ENTITLEMENTS) {
    const token = crypto.randomUUID();
    await env.ENTITLEMENTS.put(token, "unlocked", { expirationTtl: 60 * 60 * 24 * 365 });
    return json({ unlocked: true, token });
  }
  return json({ unlocked: paid });
}

async function checkEntitlement(request, env, url) {
  const token = url.searchParams.get("token");
  if (!token || !env.ENTITLEMENTS) return json({ unlocked: false });
  const value = await env.ENTITLEMENTS.get(token);
  return json({ unlocked: value === "unlocked" });
}

async function stripeWebhook(request, env) {
  // TODO: verify the Stripe-Signature header against env.STRIPE_WEBHOOK_SECRET
  // before trusting the payload, once Stripe is configured for this project.
  const event = await request.json().catch(() => null);
  if (event?.type === "checkout.session.completed" && env.ENTITLEMENTS) {
    const token = crypto.randomUUID();
    await env.ENTITLEMENTS.put(token, "unlocked", { expirationTtl: 60 * 60 * 24 * 365 });
  }
  return new Response("ok", { status: 200 });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  });
}
