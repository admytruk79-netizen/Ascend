import AsyncStorage from '@react-native-async-storage/async-storage';

// Spec §6: "pair and save the device ID." Foreground-only per spec — this
// just remembers which device to reconnect to; it never scans/connects in
// the background.

const STORAGE_KEY = 'ascend.pairedBleDevice.v1';

export interface PairedDevice {
  id: string;
  name: string | null;
}

export async function getPairedDevice(): Promise<PairedDevice | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setPairedDevice(device: PairedDevice): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(device));
}

export async function clearPairedDevice(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
