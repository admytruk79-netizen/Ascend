import { Accelerometer } from 'expo-sensors';

// Gates the heart-rate spike trigger on motion: an elevated heart rate
// while the phone is actively moving is far more likely exercise than a
// stress spike, and that's exactly the false-positive case to avoid (see
// spikeDetector.ts). This has no opinion on *why* someone is moving —
// it only tracks "has there been meaningful motion recently."

const STILLNESS_WINDOW_MS = 15_000;
// At rest, accelerometer magnitude is ~1g (gravity) regardless of phone
// orientation. A deviation from that beyond this threshold means the
// phone itself is moving, not just sitting in a pocket or on a table.
const MOTION_DEVIATION_G = 0.15;

let monitorStartedAt = 0;
// null = no motion detected since monitoring started, not "never checked".
let recentMotionAt: number | null = null;
let subscription: { remove: () => void } | null = null;

export function startMotionGate(): void {
  if (subscription) return;
  monitorStartedAt = Date.now();
  recentMotionAt = null;
  Accelerometer.setUpdateInterval(500);
  subscription = Accelerometer.addListener(({ x, y, z }) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    if (Math.abs(magnitude - 1) > MOTION_DEVIATION_G) {
      recentMotionAt = Date.now();
    }
  });
}

export function stopMotionGate(): void {
  subscription?.remove();
  subscription = null;
  monitorStartedAt = 0;
  recentMotionAt = null;
}

export function isLikelyStationary(now: number = Date.now()): boolean {
  if (recentMotionAt === null) {
    // No motion detected yet. A phone that's genuinely been still the
    // whole time correctly reads as stationary once we've monitored for
    // at least the stillness window; before that, we just don't know yet,
    // so default to "not stationary" (conservative — see spikeDetector.ts
    // comment on why a missed prompt beats an unwanted one).
    return monitorStartedAt !== 0 && now - monitorStartedAt > STILLNESS_WINDOW_MS;
  }
  return now - recentMotionAt > STILLNESS_WINDOW_MS;
}
