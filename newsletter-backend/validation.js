const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
