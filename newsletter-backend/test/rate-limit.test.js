import test from 'node:test';
import assert from 'node:assert/strict';
import { clientAddress, consumeRateLimit } from '../rate-limit.js';

test('prefers proxy-provided client addresses', () => {
  const request = new Request('https://localhost', {
    headers: { 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.2' },
  });
  assert.equal(clientAddress(request), '203.0.113.7');
});

test('enforces the configured atomic request count', async () => {
  const calls = [];
  const pool = {
    query: async (query, values) => {
      calls.push({ query, values });
      return { rows: [{ request_count: 21 }] };
    },
  };
  assert.equal(await consumeRateLimit(pool, {
    scope: 'ip-15m', value: '203.0.113.7', limit: 20, windowSeconds: 900,
  }), false);
  assert.equal(calls[0].values[0], 'ip-15m');
  assert.equal(calls[0].values[1].length, 64);
  assert.equal(calls[0].values[2], 900);
  assert.equal(calls[0].query.includes('returning request_count'), true);
});
