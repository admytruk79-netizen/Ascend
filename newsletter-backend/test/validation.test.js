import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allowedOrigin,
  BodyTooLargeError,
  normalizeEmail,
  readJsonBody,
  validEmail,
} from '../validation.js';

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

test('parses a JSON body within the byte limit', async () => {
  const request = new Request('https://localhost/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email: 'person@example.com' }),
  });
  assert.deepEqual(await readJsonBody(request), { email: 'person@example.com' });
});

test('rejects an oversized streamed body without relying on Content-Length', async () => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('{"email":"'));
      controller.enqueue(encoder.encode('a'.repeat(5000)));
      controller.enqueue(encoder.encode('@example.com"}'));
      controller.close();
    },
  });
  const request = new Request('https://localhost/newsletter', {
    method: 'POST',
    body: stream,
    duplex: 'half',
  });

  assert.equal(request.headers.has('content-length'), false);
  await assert.rejects(readJsonBody(request), BodyTooLargeError);
});
