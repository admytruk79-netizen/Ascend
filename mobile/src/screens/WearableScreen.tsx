import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { getBleManager } from '../ble/bleManager';
import { getPairedDevice, setPairedDevice, PairedDevice } from '../storage/bleDevice';
import { startPrimaryAnchorSession } from '../session/startSession';
import { RequiresPremium } from '../purchases/RequiresPremium';
import { connectHeartRateMonitor } from '../wearable/heartRateMonitor';

// Spec §6: BLE trigger device, foreground only — no background scanning or
// triggering, that's explicitly out of scope for the MVP.
//
// Two trigger paths now exist:
// 1. "Test trigger" — a manual stand-in for a real button-press device.
//    That needs the device's actual GATT service/characteristic UUIDs,
//    which weren't provided (this app was built without a real hardware
//    spec in hand) — see the TODO below for exactly where that plugs in.
// 2. "Auto-detect heart rate spikes" — a real, working characteristic
//    subscription (../wearable/heartRateMonitor.ts) against the standard
//    Bluetooth SIG Heart Rate service, which any GATT-compliant HR strap
//    or watch exposes with the same UUIDs — no device-specific wiring
//    needed here, unlike path 1. Gated on both a rolling-baseline spike
//    (spikeDetector.ts) AND the phone being stationary (motionGate.ts) so
//    an exercise-driven HR rise doesn't fire it; surfaces a tap-to-confirm
//    prompt rather than auto-launching the session, since this is a
//    passive/ambient signal, not a deliberate user action like path 1 or
//    Home's double-tap.
// Both call the same startPrimaryAnchorSession('wearable') Home's
// double-tap uses — no separate session-start path per trigger source.
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

function onHeartRateSpike() {
  Alert.alert('Elevated heart rate detected', 'Want to open your anchor?', [
    { text: 'Not now', style: 'cancel' },
    { text: 'Open anchor', onPress: () => startPrimaryAnchorSession('wearable') },
  ]);
}

export default function WearableScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [paired, setPaired] = useState<PairedDevice | null>(null);
  const [isAutoDetectOn, setIsAutoDetectOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopMonitorRef = useRef<(() => void) | null>(null);

  useFocusEffect(
    useCallback(() => {
      getPairedDevice().then(setPaired);
      // Spec §6: BLE is foreground-only. Losing focus on this screen — not
      // just backgrounding the whole app — is treated as leaving the
      // foreground context for this feature, so the connection and the
      // toggle both reset rather than silently keep running elsewhere.
      return () => {
        stopMonitorRef.current?.();
        stopMonitorRef.current = null;
        setIsAutoDetectOn(false);
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      stopMonitorRef.current?.();
      try {
        getBleManager().stopDeviceScan();
      } catch {
        // no-op — manager may not exist if this screen never actually
        // scanned (e.g. permissions were denied before Start Scan worked)
      }
    };
  }, []);

  const onToggleAutoDetect = async (next: boolean) => {
    if (!paired) return;

    if (!next) {
      stopMonitorRef.current?.();
      stopMonitorRef.current = null;
      setIsAutoDetectOn(false);
      return;
    }

    setIsConnecting(true);
    try {
      const stop = await connectHeartRateMonitor(paired.id, onHeartRateSpike);
      stopMonitorRef.current = stop;
      setIsAutoDetectOn(true);
    } catch (err) {
      Alert.alert(
        'Could not connect',
        err instanceof Error
          ? err.message
          : 'Make sure the paired device supports the standard Heart Rate service.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

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
    <RequiresPremium featureName="Wearable">
      <View style={styles.container}>
        {paired && (
          <View style={styles.pairedCard}>
            <Text style={styles.pairedLabel}>Paired device</Text>
            <Text style={styles.pairedName}>{paired.name ?? paired.id}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onTestTrigger}>
              <Text style={styles.primaryButtonText}>Test trigger</Text>
            </TouchableOpacity>

            <View style={styles.autoDetectRow}>
              <View style={styles.autoDetectTextWrap}>
                <Text style={styles.autoDetectLabel}>Auto-detect heart rate spikes</Text>
                <Text style={styles.autoDetectHint}>
                  Only prompts while you're relatively still — won't fire during
                  a workout. Requires a device with a standard Heart Rate
                  sensor. Foreground only.
                </Text>
              </View>
              {isConnecting ? (
                <ActivityIndicator color="#f2c14e" />
              ) : (
                <Switch value={isAutoDetectOn} onValueChange={onToggleAutoDetect} />
              )}
            </View>
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
    </RequiresPremium>
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
  autoDetectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  autoDetectTextWrap: {
    flex: 1,
  },
  autoDetectLabel: {
    color: '#e6e6f0',
    fontSize: 14,
    fontWeight: '600',
  },
  autoDetectHint: {
    color: '#8a8aa0',
    fontSize: 12,
    marginTop: 4,
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
