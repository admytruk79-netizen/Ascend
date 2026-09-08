import test from 'node:test';
import assert from 'node:assert/strict';
import { completeEnrollment } from '../enrollment.js';

function operations(priorStatus, syncError) {
  const calls = [];
  return {
    calls,
    value: {
      begin: async () => { calls.push('pending'); return priorStatus; },
      sync: async () => { calls.push('sync'); if (syncError) throw syncError; },
      markSubscribed: async () => { calls.push('subscribed'); },
      markFailed: async () => { calls.push('failed'); },
    },
  };
}

test('marks a new enrollment subscribed only after provider sync succeeds', async () => {
  const op = operations('pending');
  await completeEnrollment('person@example.com', op.value);
  assert.deepEqual(op.calls, ['pending', 'sync', 'subscribed']);
});

test('marks a new enrollment failed when provider sync fails', async () => {
  const op = operations('pending', new Error('provider unavailable'));
  await assert.rejects(completeEnrollment('person@example.com', op.value), /provider unavailable/);
  assert.deepEqual(op.calls, ['pending', 'sync', 'failed']);
});

test('preserves a prior successful enrollment when a retry fails', async () => {
  const op = operations('subscribed', new Error('provider unavailable'));
  await assert.rejects(completeEnrollment('person@example.com', op.value), /provider unavailable/);
  assert.deepEqual(op.calls, ['pending', 'sync']);
});
