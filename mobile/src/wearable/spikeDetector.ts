// Rolling-baseline heart-rate spike detection — not a fixed bpm threshold,
// since resting HR varies too much person to person. A "spike" is a
// reading meaningfully above this person's own recent average, not above
// some universal number.

export interface SpikeDetectorOptions {
  baselineWindowMs?: number; // how far back to average for the baseline
  spikeDeltaBpm?: number; // bpm above baseline that counts as a spike
  cooldownMs?: number; // minimum gap between triggers, avoids re-firing
}

const DEFAULT_BASELINE_WINDOW_MS = 5 * 60_000;
const DEFAULT_SPIKE_DELTA_BPM = 25;
const DEFAULT_COOLDOWN_MS = 10 * 60_000;
const MIN_READINGS_FOR_BASELINE = 3;

export function createSpikeDetector(options: SpikeDetectorOptions = {}) {
  const baselineWindowMs = options.baselineWindowMs ?? DEFAULT_BASELINE_WINDOW_MS;
  const spikeDeltaBpm = options.spikeDeltaBpm ?? DEFAULT_SPIKE_DELTA_BPM;
  const cooldownMs = options.cooldownMs ?? DEFAULT_COOLDOWN_MS;

  const readings: Array<{ bpm: number; at: number }> = [];
  let lastTriggeredAt = 0;

  return {
    // Feed one new reading. Returns true only when this reading is a
    // confirmed spike above the rolling baseline AND outside the cooldown
    // window. Caller is responsible for any additional gating (e.g. motion).
    addReading(bpm: number, now: number = Date.now()): boolean {
      readings.push({ bpm, at: now });
      while (readings.length > 1 && now - readings[0].at > baselineWindowMs) {
        readings.shift();
      }

      if (readings.length < MIN_READINGS_FOR_BASELINE) return false;

      // Baseline excludes the just-added reading so a spike can't inflate
      // its own comparison point.
      const priorReadings = readings.slice(0, -1);
      const baseline =
        priorReadings.reduce((sum, r) => sum + r.bpm, 0) / priorReadings.length;

      if (bpm - baseline < spikeDeltaBpm) return false;
      if (now - lastTriggeredAt < cooldownMs) return false;

      lastTriggeredAt = now;
      return true;
    },
  };
}
