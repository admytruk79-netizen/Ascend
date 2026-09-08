export async function completeEnrollment(email, operations) {
  const priorStatus = await operations.begin(email);
  try {
    await operations.sync(email);
    await operations.markSubscribed(email);
  } catch (error) {
    // A previously completed enrollment stays valid when a later re-consent
    // attempt cannot reach Resend. New and incomplete attempts are marked
    // failed so the database never claims that an unsuccessful signup worked.
    if (priorStatus !== 'subscribed') await operations.markFailed(email);
    throw error;
  }
}
