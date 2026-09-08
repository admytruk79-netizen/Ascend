import { createHash } from 'node:crypto';

function hashKey(scope, value) {
  return createHash('sha256').update(`${scope}:${value}`).digest('hex');
}

export function clientAddress(request) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function consumeRateLimit(pool, { scope, value, limit, windowSeconds }) {
  const result = await pool.query(
    `insert into newsletter_rate_limits
       (scope, key_hash, window_started_at, request_count, updated_at)
     values ($1, $2, to_timestamp(floor(extract(epoch from now()) / $3) * $3), 1, now())
     on conflict (scope, key_hash, window_started_at) do update
       set request_count = newsletter_rate_limits.request_count + 1,
           updated_at = now()
     returning request_count`,
    [scope, hashKey(scope, value), windowSeconds],
  );
  return Number(result.rows[0].request_count) <= limit;
}
