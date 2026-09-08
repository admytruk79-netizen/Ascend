import { randomUUID } from 'node:crypto';

export async function completeEnrollment(email, operations) {
  const attemptId = operations.createAttemptId?.() ?? randomUUID();
  await operations.begin(email, attemptId);
  try {
    await operations.sync(email, attemptId);
    // A successful provider sync always wins, even if another retry began
    // while it was in flight.
    await operations.markSubscribed(email, attemptId);
  } catch (error) {
    // The database update is conditional on this attempt still being the
    // active pending one, so a stale failure cannot erase another success.
    await operations.markFailed(email, attemptId);
    throw error;
  }
}
