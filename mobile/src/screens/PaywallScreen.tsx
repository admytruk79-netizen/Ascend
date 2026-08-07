import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useEntitlement } from '../purchases/EntitlementContext';
import { isPurchasesConfigured } from '../purchases/purchases';

// Spec §10: subscription via RevenueCat, 7-day trial (configured per-store,
// not here), restore-purchases required by both stores' review guidelines.
// Price/trial-length disclosure below is a Play Store compliance
// requirement too (see the paywall backlog doc referenced in the build
// materials) — it has to be visible with no extra taps, not behind a link.

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

export default function PaywallScreen({ navigation }: Props) {
  const { refresh } = useEntitlement();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!isPurchasesConfigured) {
      setIsLoadingOfferings(false);
      return;
    }
    Purchases.getOfferings()
      .then((offerings) => {
        setPkg(offerings.current?.availablePackages[0] ?? null);
      })
      .catch((err) => console.warn('[paywall] getOfferings failed:', err))
      .finally(() => setIsLoadingOfferings(false));
  }, []);

  if (!isPurchasesConfigured) {
    return (
      <Centered>
        <Text style={styles.body}>
          Subscriptions aren't set up for this build yet — no RevenueCat API
          key is configured. See mobile/README.md.
        </Text>
      </Centered>
    );
  }

  const onPurchase = async () => {
    if (!pkg) return;
    setIsPurchasing(true);
    try {
      await Purchases.purchasePackage(pkg);
      await refresh();
      navigation.goBack();
    } catch (err: any) {
      if (!err?.userCancelled) {
        Alert.alert('Purchase failed', err?.message ?? String(err));
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const onRestore = async () => {
    try {
      await Purchases.restorePurchases();
      await refresh();
      Alert.alert('Restored', 'Your purchases have been restored.');
    } catch (err: any) {
      Alert.alert('Restore failed', err?.message ?? String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ASCEND Premium</Text>
      <Text style={styles.body}>
        Unlocks the wearable trigger, AI reflections and weekly summaries,
        unlimited sessions, and cloud sync across devices.
      </Text>

      {isLoadingOfferings ? (
        <ActivityIndicator color="#f2c14e" />
      ) : pkg ? (
        <>
          <Text style={styles.priceDisclosure}>
            {pkg.product.priceString} / {pkg.packageType.toLowerCase()} · 7-day free trial ·
            auto-renews unless cancelled
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onPurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#1a1a24" />
            ) : (
              <Text style={styles.primaryButtonText}>Start free trial</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.body}>
          No offering is configured in RevenueCat yet for this build.
        </Text>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={onRestore}>
        <Text style={styles.secondaryButtonText}>Restore purchases</Text>
      </TouchableOpacity>

      {/* PLACEHOLDER URLS — both stores require real Terms/Privacy links on
          a paywall before they'll approve the app. example.com will fail
          review; replace with the actual published pages before shipping. */}
      <View style={styles.legalRow}>
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/terms')}>
          <Text style={styles.legalLink}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/privacy')}>
          <Text style={styles.legalLink}>Privacy</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.disclaimer}>
        ASCEND is a wellness tool, not therapy, a medical device, or a
        treatment.
      </Text>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#e6e6f0',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: '#b8b8c8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  priceDisclosure: {
    color: '#e6e6f0',
    fontSize: 13,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#f2c14e',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1a1a24',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 10,
  },
  secondaryButtonText: {
    color: '#b8b8c8',
    fontSize: 14,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legalLink: {
    color: '#8a8aa0',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    color: '#6a6a80',
    fontSize: 11,
    textAlign: 'center',
  },
});
