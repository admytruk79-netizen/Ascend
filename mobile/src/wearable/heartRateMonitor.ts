import { getBleManager } from '../ble/bleManager';
import { createSpikeDetector } from './spikeDetector';
import { isLikelyStationary, startMotionGate, stopMotionGate } from './motionGate';

// Standard Bluetooth SIG-assigned Heart Rate Service/Characteristic UUIDs —
// not app-specific. Any GATT-compliant HR strap or watch exposes these, so
// this works with the same paired-device flow WearableScreen already has,
// no per-device custom UUIDs needed (unlike the generic "trigger button"
// case in WearableScreen's TODO, which is genuinely hardware-specific).
const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Self-contained base64 decode — avoids pulling in a Buffer polyfill just
// to read two bytes out of a BLE characteristic payload.
function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

// Bluetooth SIG Heart Rate Measurement characteristic format: byte 0 is a
// flags byte whose bit 0 says whether the bpm value is 8-bit or 16-bit.
function parseHeartRateBpm(bytes: Uint8Array): number | null {
  if (bytes.length < 2) return null;
  const is16Bit = (bytes[0] & 0x01) === 1;
  if (is16Bit) {
    if (bytes.length < 3) return null;
    return bytes[1] | (bytes[2] << 8);
  }
  return bytes[1];
}

// Connects to the paired device's standard Heart Rate service and calls
// onSpike() when a reading is both a confirmed rolling-baseline spike
// (spikeDetector.ts) AND the phone has been stationary (motionGate.ts) —
// both signals required, so an exercise-driven HR rise doesn't fire this.
// Returns a cleanup function; caller must call it on unmount/screen blur —
// per spec §6, BLE is foreground-only, this does not run in the background.
export async function connectHeartRateMonitor(
  deviceId: string,
  onSpike: () => void
): Promise<() => void> {
  const manager = getBleManager();
  const device = await manager.connectToDevice(deviceId);
  await device.discoverAllServicesAndCharacteristics();

  const detector = createSpikeDetector();
  startMotionGate();

  const subscription = device.monitorCharacteristicForService(
    HEART_RATE_SERVICE_UUID,
    HEART_RATE_MEASUREMENT_UUID,
    (error, characteristic) => {
      if (error || !characteristic?.value) return;
      const bpm = parseHeartRateBpm(base64ToBytes(characteristic.value));
      if (bpm === null) return;

      const isSpike = detector.addReading(bpm);
      if (isSpike && isLikelyStationary()) {
        onSpike();
      }
    }
  );

  return () => {
    subscription.remove();
    stopMotionGate();
    device.cancelConnection().catch(() => {});
  };
}
