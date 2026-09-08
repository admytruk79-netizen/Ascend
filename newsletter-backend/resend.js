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

async function findContactId(email, headers, fetchImpl) {
  // Never put an email address in a request URL. Resend's contacts list is
  // pages locally, using only opaque provider IDs as cursors and later paths.
  const seenCursors = new Set();
  let after = null;

  while (true) {
    const url = new URL(`${RESEND_API_URL}/contacts`);
    url.searchParams.set('limit', '100');
    if (after) url.searchParams.set('after', after);

    const response = await fetchImpl(url.toString(), {
      method: 'GET',
      headers,
    });
    await requireSuccess(response, 'contact lookup');

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new ResendSyncError('Resend contact lookup returned invalid JSON.', response.status);
    }
    if (payload?.object !== 'list'
      || typeof payload.has_more !== 'boolean'
      || !Array.isArray(payload.data)) {
      throw new ResendSyncError('Resend contact lookup returned an invalid page.', response.status);
    }

    const contact = payload.data.find(item => (
      typeof item?.email === 'string' && item.email.toLowerCase() === email.toLowerCase()
    ));
    if (contact) {
      if (typeof contact.id !== 'string' || !contact.id) {
        throw new ResendSyncError('Resend contact lookup returned an invalid contact.', response.status);
      }
      return contact.id;
    }
    if (!payload.has_more) break;

    const nextCursor = payload.data.at(-1)?.id;
    if (typeof nextCursor !== 'string' || !nextCursor || seenCursors.has(nextCursor)) {
      throw new ResendSyncError('Resend contact lookup returned an invalid cursor.', response.status);
    }
    seenCursors.add(nextCursor);
    after = nextCursor;
  }

  throw new ResendSyncError('Resend contact lookup did not find the existing contact.', 409);
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

  // A global contact with this address already exists. Resolve its opaque ID
  // without putting the email into a request URL, then resubscribe it.
  const contactId = await findContactId(email, headers, fetchImpl);
  const contactPath = `${RESEND_API_URL}/contacts/${encodeURIComponent(contactId)}`;
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
