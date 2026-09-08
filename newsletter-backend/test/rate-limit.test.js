import test from 'node:test';
import assert from 'node:assert/strict';
import { clientAddress, consumeRateLimit } from '../rate-limit.js';

test('uses only the trusted ingress address', () => {
  const request = new Request('https://localhost', {
    headers: {
      'cf-connecting-ip': '203.0.113.7',
      'x-real-ip': '198.51.100.2',
      'x-forwarded-for': '192.0.2.5',
    },
  });
  assert.equal(clientAddress(request), '203.0.113.7');
});

test('does not trust caller-controlled forwarding headers', () => {
  const request = new Request('https://localhost', {
    headers: { 'x-real-ip': '198.51.100.2', 'x-forwarded-for': '192.0.2.5' },
  });
  assert.equal(clientAddress(request), 'unknown');
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
  assert.equal(calls[0].query.includes("interval '2 days'"), true);
  assert.equal(calls[0].query.includes('returning request_count'), true);
});
