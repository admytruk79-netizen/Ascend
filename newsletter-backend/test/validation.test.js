import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedOrigin, normalizeEmail, validEmail } from '../validation.js';

test('normalizes and validates subscriber email addresses', () => {
  assert.equal(normalizeEmail('  Person@Example.COM '), 'person@example.com');
  assert.equal(validEmail('person@example.com'), true);
  assert.equal(validEmail('not-an-email'), false);
  assert.equal(validEmail('a'.repeat(250) + '@example.com'), false);
});

test('allows only the app and its web preview origins', () => {
  assert.equal(allowedOrigin('https://localhost'), 'https://localhost');
  assert.equal(allowedOrigin('capacitor://localhost'), 'capacitor://localhost');
  assert.equal(allowedOrigin('https://admytruk79-netizen.github.io'), 'https://admytruk79-netizen.github.io');
  assert.equal(allowedOrigin('https://example.com'), null);
});
