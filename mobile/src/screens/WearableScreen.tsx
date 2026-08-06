import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { getBleManager } from '../ble/bleManager';
import { getPairedDevice, setPairedDevice, PairedDevice } from '../storage/bleDevice';
import { startPrimaryAnchorSession } from '../session/startSession';

// Spec §6: BLE trigger device, foreground only — no background scanning or
// triggering, that's explicitly out of scope for the MVP.
//
// What this screen does NOT do: subscribe to a real trigger notification
// from the paired device. That needs the device's actual GATT service and
// characteristic UUIDs, which weren't provided (this app was built without
// a real hardware spec in hand) — see the TODO below for exactly where
// that would plug in. "Test trigger" below calls the same
// startPrimaryAnchorSession('wearable') a real characteristic-notification
// handler would call, so the session-start path itself is fully built and
// tested; only the "read a real button press off the device" wiring is
// missing, and it's hardware-specific by nature.
//
// UNTESTABLE in this environment: react-native-ble-plx is a native module
// (see ../ble/bleManager.ts) that only runs in a custom EAS dev client on
// a real device — not in Expo Go, not in this sandboxed session.

const SCAN_DURATION_MS = 10_000;

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted'
    );
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  return result === 'granted';
}

export default function WearableScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [paired, setPaired] = useState<PairedDevice | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      getPairedDevice().then(setPaired);
    }, [])
  );

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      try {
        getBleManager().stopDeviceScan();
      } catch {
        // no-op — manager may not exist if this screen never actually
        // scanned (e.g. permissions were denied before Start Scan worked)
      }
    };
  }, []);

  const onStartScan = async () => {
    const granted = await requestBlePermissions();
    if (!granted) {
      Alert.alert('Bluetooth permission needed', 'Enable it in system settings to scan.');
      return;
    }

    let manager;
    try {
      manager = getBleManager();
    } catch (err) {
      Alert.alert(
        'Bluetooth unavailable',
        'This build doesn\'t include native BLE support — run it from a custom dev client, not Expo Go.'
      );
      return;
    }

    setDevices([]);
    setIsScanning(true);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setIsScanning(false);
        Alert.alert('Scan error', error.message);
        return;
      }
      if (!device || !device.name) return;
      setDevices((prev) => (prev.some((d) => d.id === device.id) ? prev : [...prev, device]));
    });

    scanTimeoutRef.current = setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, SCAN_DURATION_MS);
  };

  const onSelectDevice = async (device: Device) => {
    getBleManager().stopDeviceScan();
    setIsScanning(false);
    const saved: PairedDevice = { id: device.id, name: device.name };
    await setPairedDevice(saved);
    setPaired(saved);
    // TODO(real hardware): once the device's trigger service/characteristic
    // UUIDs are known, connect here and call
    // device.monitorCharacteristicForService(serviceUUID, characteristicUUID,
    // () => startPrimaryAnchorSession('wearable')) so a real button press
    // starts a session the same way double-tap does.
  };

  const onTestTrigger = () => {
    startPrimaryAnchorSession('wearable');
  };

  return (
    <View style={styles.container}>
      {paired && (
        <View style={styles.pairedCard}>
          <Text style={styles.pairedLabel}>Paired device</Text>
          <Text style={styles.pairedName}>{paired.name ?? paired.id}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onTestTrigger}>
            <Text style={styles.primaryButtonText}>Test trigger</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.scanButton} onPress={onStartScan} disabled={isScanning}>
        {isScanning ? (
          <ActivityIndicator color="#1a1a24" />
        ) : (
          <Text style={styles.scanButtonText}>Scan for devices</Text>
        )}
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deviceRow} onPress={() => onSelectDevice(item)}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isScanning ? null : <Text style={styles.emptyText}>No devices found yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 16,
    gap: 12,
  },
  pairedCard: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 16,
  },
  pairedLabel: {
    color: '#8a8aa0',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  pairedName: {
    color: '#e6e6f0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#f2c14e',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1a1a24',
    fontWeight: '700',
  },
  scanButton: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#e6e6f0',
    fontSize: 15,
  },
  list: {
    gap: 8,
  },
  deviceRow: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
  },
  deviceName: {
    color: '#e6e6f0',
    fontSize: 15,
  },
  deviceId: {
    color: '#8a8aa0',
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    color: '#8a8aa0',
    textAlign: 'center',
    marginTop: 24,
  },
});
