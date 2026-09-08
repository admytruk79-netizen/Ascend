const RESEND_API_URL = 'https://api.resend.com';

export class ResendSyncError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ResendSyncError';
    this.status = status;
  }
}

async function requireSuccess(response, operation, acceptedStatuses = []) {
  if (response.ok || acceptedStatuses.includes(response.status)) return;
  throw new ResendSyncError(`Resend ${operation} failed.`, response.status);
}

export async function syncResendContact(email, options = {}) {
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY;
  const segmentId = options.segmentId ?? process.env.RESEND_SEGMENT_ID;
  const topicId = options.topicId ?? process.env.RESEND_TOPIC_ID;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!apiKey || !segmentId || !topicId) {
    throw new ResendSyncError('Resend is not configured.');
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': 'ascend-keys-newsletter/1.0',
  };
  const createResponse = await fetchImpl(`${RESEND_API_URL}/contacts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
      topics: [{ id: topicId, subscription: 'opt_in' }],
    }),
  });

  if (createResponse.ok) return;
  if (createResponse.status !== 409) {
    await requireSuccess(createResponse, 'contact creation');
  }

  // A global contact with this address already exists. A fresh form submission
  // is explicit consent to resubscribe it and include it in this app's segment.
  const contactPath = `${RESEND_API_URL}/contacts/${encodeURIComponent(email)}`;
  const updateResponse = await fetchImpl(contactPath, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ unsubscribed: false }),
  });
  await requireSuccess(updateResponse, 'contact update');

  const topicsResponse = await fetchImpl(`${contactPath}/topics`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      topics: [{ id: topicId, subscription: 'opt_in' }],
    }),
  });
  await requireSuccess(topicsResponse, 'topic subscription');

  const segmentResponse = await fetchImpl(`${contactPath}/segments/${segmentId}`, {
    method: 'POST',
    headers,
  });
  await requireSuccess(segmentResponse, 'segment assignment', [409]);
}
