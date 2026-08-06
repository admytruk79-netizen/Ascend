import { BleManager } from 'react-native-ble-plx';

let manager: BleManager | null = null;

// Lazily constructed on purpose. react-native-ble-plx's native module only
// exists in a custom EAS dev client build (build guide P6), not in plain
// Expo Go — constructing a BleManager at import time would throw and take
// down every screen in the app the moment Metro evaluated this module, not
// just the Wearable one. Only WearableScreen calls this, and only once it
// has actually mounted, so P1-P5 stay fully usable in Expo Go regardless of
// whether this file is ever imported.
export function getBleManager(): BleManager {
  if (!manager) {
    manager = new BleManager();
  }
  return manager;
}
