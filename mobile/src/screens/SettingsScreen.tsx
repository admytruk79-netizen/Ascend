import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getAiConsent } from '../ai/consent';

// Spec §3 Settings: session params, privacy/AI consent, account/data.
// Account (P3) and a privacy/AI-consent status section (P5) are built;
// session params has no configurable UI yet since P2 ships fixed defaults
// (120s / +60s / max 3), and account/data deletion isn't built here.
//
// The actual opt-in/opt-out toggle lives on InsightsScreen, not here — spec
// §11 wants a real consent screen, not a settings toggle someone glosses
// over. This section just shows status and links there, so "privacy/AI
// consent" is still findable from Settings the way spec §3 lists it.

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { session, isLoading } = useAuth();
  const [aiConsent, setAiConsentState] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (session) {
        getAiConsent(session.user.id).then(setAiConsentState);
      } else {
        setAiConsentState(null);
      }
    }, [session])
  );

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

      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Privacy</Text>
      <Text style={styles.body}>
        {!session
          ? 'AI insights need an account — sign in above first.'
          : aiConsent
          ? 'AI insights are enabled. You can turn them off from the Insights screen.'
          : 'AI insights are off. Nothing is sent to an AI model until you enable them.'}
      </Text>
      {session && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Insights')}>
          <Text style={styles.buttonText}>
            {aiConsent ? 'Manage AI insights' : 'Turn on AI insights'}
          </Text>
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
  sectionSpacing: {
    marginTop: 16,
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
