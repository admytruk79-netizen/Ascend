import { attachDatabasePool } from '@neon/functions';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { completeEnrollment } from './enrollment.js';
import { clientAddress, consumeRateLimit } from './rate-limit.js';
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

function json(origin, body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), ...extraHeaders },
  });
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

    try {
      const withinIpLimit = await consumeRateLimit(pool, {
        scope: 'ip-15m',
        value: clientAddress(request),
        limit: 20,
        windowSeconds: 15 * 60,
      });
      if (!withinIpLimit) {
        return json(origin, { error: 'rate_limited' }, 429, { 'Retry-After': '900' });
      }
    } catch (error) {
      console.error('[newsletter] rate limit unavailable', { name: error.name, message: error.message });
      return json(origin, { error: 'subscription_service_unavailable' }, 503);
    }

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

    try {
      const withinEmailLimit = await consumeRateLimit(pool, {
        scope: 'email-24h',
        value: email,
        limit: 5,
        windowSeconds: 24 * 60 * 60,
      });
      if (!withinEmailLimit) {
        return json(origin, { error: 'rate_limited' }, 429, { 'Retry-After': '86400' });
      }

      await completeEnrollment(email, {
        begin: async address => {
          const result = await db.execute(sql`
            insert into newsletter_subscribers
              (email, status, sync_status, source, consent_at, updated_at)
            values (${address}, 'unsubscribed', 'pending', 'ascend-keys-app', now(), now())
            on conflict (email_normalized) do update
            set email = excluded.email,
                sync_status = case
                  when newsletter_subscribers.status = 'subscribed' then 'synced'
                  else 'pending'
                end,
                consent_at = now(),
                updated_at = now()
            returning status
          `);
          return result.rows[0].status;
        },
        sync: syncResendContact,
        markSubscribed: address => db.execute(sql`
          update newsletter_subscribers
          set status = 'subscribed', sync_status = 'synced', updated_at = now()
          where email_normalized = ${address}
        `),
        markFailed: address => db.execute(sql`
          update newsletter_subscribers
          set status = 'unsubscribed', sync_status = 'failed', updated_at = now()
          where email_normalized = ${address}
        `),
      });
    } catch (error) {
      console.error('[newsletter] subscription failed', {
        name: error.name,
        status: error.status,
        message: error.message,
      });
      return json(origin, { error: 'subscription_service_unavailable' }, 502);
    }

    return json(origin, { subscribed: true });
  },
};
