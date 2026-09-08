import test from 'node:test';
import assert from 'node:assert/strict';
import { completeEnrollment } from '../enrollment.js';

function operations(syncError) {
  const calls = [];
  return {
    calls,
    value: {
      createAttemptId: () => 'attempt-1',
      begin: async (_email, attemptId) => { calls.push(`pending:${attemptId}`); },
      sync: async () => { calls.push('sync'); if (syncError) throw syncError; },
      markSubscribed: async (_email, attemptId) => { calls.push(`subscribed:${attemptId}`); },
      markFailed: async (_email, attemptId) => { calls.push(`failed:${attemptId}`); },
    },
  };
}

test('marks a new enrollment subscribed only after provider sync succeeds', async () => {
  const op = operations();
  await completeEnrollment('person@example.com', op.value);
  assert.deepEqual(op.calls, ['pending:attempt-1', 'sync', 'subscribed:attempt-1']);
});

test('marks a new enrollment failed when provider sync fails', async () => {
  const op = operations(new Error('provider unavailable'));
  await assert.rejects(completeEnrollment('person@example.com', op.value), /provider unavailable/);
  assert.deepEqual(op.calls, ['pending:attempt-1', 'sync', 'failed:attempt-1']);
});

test('a stale failed retry cannot erase a concurrent successful enrollment', async () => {
  const row = { status: 'unsubscribed', syncStatus: 'failed', attemptId: null };
  let nextAttempt = 0;
  let releaseFirstSync;
  const firstSync = new Promise(resolve => { releaseFirstSync = resolve; });
  const value = {
    createAttemptId: () => `attempt-${++nextAttempt}`,
    begin: async (_email, attemptId) => {
      row.syncStatus = 'pending';
      row.attemptId = attemptId;
    },
    sync: async (_email, attemptId) => {
      if (attemptId === 'attempt-1') await firstSync;
      else throw new Error('provider unavailable');
    },
    markSubscribed: async () => {
      row.status = 'subscribed';
      row.syncStatus = 'synced';
      row.attemptId = null;
    },
    markFailed: async (_email, attemptId) => {
      if (row.attemptId === attemptId && row.status !== 'subscribed' && row.syncStatus === 'pending') {
        row.syncStatus = 'failed';
        row.attemptId = null;
      }
    },
  };

  const successful = completeEnrollment('person@example.com', value);
  const failed = completeEnrollment('person@example.com', value);
  await assert.rejects(failed, /provider unavailable/);
  releaseFirstSync();
  await successful;
  assert.deepEqual(row, { status: 'subscribed', syncStatus: 'synced', attemptId: null });
});
