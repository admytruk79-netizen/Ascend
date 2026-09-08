import test from 'node:test';
import assert from 'node:assert/strict';
import { ResendSyncError, syncResendContact } from '../resend.js';

const options = {
  apiKey: 're_test_key',
  segmentId: 'segment-123',
  topicId: 'topic-123',
};

test('creates a subscribed contact directly in the ASCEND Keys segment', async () => {
  const calls = [];
  await syncResendContact('person@example.com', {
    ...options,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response('{}', { status: 201 });
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/contacts');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test_key');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    email: 'person@example.com',
    unsubscribed: false,
    segments: [{ id: 'segment-123' }],
    topics: [{ id: 'topic-123', subscription: 'opt_in' }],
  });
});

test('resubscribes an existing contact and assigns the segment idempotently', async () => {
  const calls = [];
  const responses = [
    new Response('{}', { status: 409 }),
    new Response(JSON.stringify({
      object: 'list',
      data: [{ id: 'contact-456', email: 'person+news@example.com' }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    new Response('{}', { status: 200 }),
    new Response('{}', { status: 200 }),
    new Response('{}', { status: 409 }),
  ];
  await syncResendContact('person+news@example.com', {
    ...options,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return responses.shift();
    },
  });

  const contactPath = 'https://api.resend.com/contacts/contact-456';
  assert.deepEqual(calls.map(call => [call.init.method, call.url]), [
    ['POST', 'https://api.resend.com/contacts'],
    ['GET', 'https://api.resend.com/contacts'],
    ['PATCH', contactPath],
    ['PATCH', `${contactPath}/topics`],
    ['POST', `${contactPath}/segments/segment-123`],
  ]);
  assert.equal(calls.some(call => call.url.includes('person')), false);
});

test('rejects a duplicate contact when its provider ID cannot be resolved', async () => {
  const responses = [
    new Response('{}', { status: 409 }),
    new Response(JSON.stringify({ object: 'list', data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  ];

  await assert.rejects(
    syncResendContact('missing@example.com', {
      ...options,
      fetchImpl: async () => responses.shift(),
    }),
    error => error instanceof ResendSyncError && error.status === 409,
  );
});

test('rejects provider failures without exposing the API key', async () => {
  await assert.rejects(
    syncResendContact('person@example.com', {
      ...options,
      fetchImpl: async () => new Response('{}', { status: 503 }),
    }),
    error => error instanceof ResendSyncError
      && error.status === 503
      && !error.message.includes(options.apiKey),
  );
});
