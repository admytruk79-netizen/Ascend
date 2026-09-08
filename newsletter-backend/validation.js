const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export class BodyTooLargeError extends Error {
  constructor() {
    super('Request body is too large.');
    this.name = 'BodyTooLargeError';
  }
}

export async function readJsonBody(request, maxBytes = 4096) {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new BodyTooLargeError();
  }

  if (!request.body) throw new SyntaxError('Missing request body.');

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export function validEmail(value) {
  const email = normalizeEmail(value);
  return email.length >= 3 && email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function allowedOrigin(origin) {
  if (!origin) return null;
  if (origin === 'https://localhost' || origin === 'capacitor://localhost') return origin;
  if (origin === 'https://admytruk79-netizen.github.io') return origin;
  return null;
}
