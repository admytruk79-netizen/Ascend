import { attachDatabasePool } from '@neon/functions';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { syncResendContact } from './resend.js';
import {
  allowedOrigin,
  BodyTooLargeError,
  normalizeEmail,
  readJsonBody,
  validEmail,
} from './validation.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);
const db = drizzle(pool);

function cors(origin) {
  const allowed = allowedOrigin(origin);
  return {
    ...(allowed ? { 'Access-Control-Allow-Origin': allowed } : {}),
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
  };
}

function json(origin, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors(origin) });
}

export default {
  async fetch(request) {
    const origin = request.headers.get('origin');
    const allowed = allowedOrigin(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: allowed ? 204 : 403, headers: cors(origin) });
    }
    if (request.method !== 'POST') return json(origin, { error: 'not_found' }, 404);
    if (!allowed) return json(origin, { error: 'origin_not_allowed' }, 403);

    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        return json(origin, { error: 'request_too_large' }, 413);
      }
      return json(origin, { error: 'invalid_json' }, 400);
    }

    // Hidden field: bots commonly fill it; humans never see it.
    if (body.company) return json(origin, { subscribed: true });

    const email = normalizeEmail(body.email);
    if (!validEmail(email)) return json(origin, { error: 'invalid_email' }, 400);

    await db.execute(sql`
      insert into newsletter_subscribers (email, status, source, consent_at, updated_at)
      values (${email}, 'subscribed', 'ascend-keys-app', now(), now())
      on conflict (email_normalized) do update
      set email = excluded.email,
          status = 'subscribed',
          consent_at = now(),
          updated_at = now()
    `);

    try {
      await syncResendContact(email);
    } catch (error) {
      console.error('[newsletter] Resend sync failed', {
        name: error.name,
        status: error.status,
        message: error.message,
      });
      return json(origin, { error: 'subscription_service_unavailable' }, 502);
    }

    return json(origin, { subscribed: true });
  },
};
