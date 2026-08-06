import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// Spec §3 Settings: session params, privacy/AI consent, account/data.
// Account (this phase) and AI consent (P5) are the only sections built so
// far — session params has no configurable UI yet since P2 ships fixed
// defaults (120s / +60s / max 3), and account/data deletion is P3 sync
// follow-up, not built here.

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { session, isLoading } = useAuth();

  const onSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Account</Text>

      {!isSupabaseConfigured ? (
        <Text style={styles.body}>Sync isn't set up for this build yet.</Text>
      ) : isLoading ? (
        <Text style={styles.body}>Loading…</Text>
      ) : session ? (
        <>
          <Text style={styles.body}>Signed in as {session.user.email}</Text>
          <TouchableOpacity style={styles.button} onPress={onSignOut}>
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.buttonText}>Sign in to sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 24,
    gap: 12,
  },
  sectionTitle: {
    color: '#e6e6f0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: '#b8b8c8',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#e6e6f0',
    fontSize: 15,
  },
});
