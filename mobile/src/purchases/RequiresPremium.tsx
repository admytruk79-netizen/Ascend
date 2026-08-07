import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useEntitlement } from './EntitlementContext';
import { isPurchasesConfigured } from './purchases';

// Spec §10 entitlement gate: wearable + AI insights are premium features.
// When RevenueCat isn't configured for this build (no live project here),
// the gate is skipped entirely rather than locking every feature behind an
// unusable paywall — matches how the Supabase/AI gates behave when unset.
export function RequiresPremium({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { hasPremium, isLoading } = useEntitlement();

  if (!isPurchasesConfigured || hasPremium) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#f2c14e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{featureName} is a premium feature</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Paywall')}
      >
        <Text style={styles.buttonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: '#e6e6f0',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f2c14e',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#1a1a24',
    fontWeight: '700',
  },
});
