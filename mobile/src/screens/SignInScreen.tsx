import React, { useState } from 'react';
import * as Linking from 'expo-linking';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// Spec §9: email + magic link, the stated preferred auth method. Signing in
// only enables cross-device sync (P3) — everything else works signed-out.

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onSendLink = async () => {
    if (!supabase) return;
    setStatus('sending');
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: Linking.createURL('auth/callback'),
      },
    });
    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }
    setStatus('sent');
  };

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sync not set up yet</Text>
        <Text style={styles.body}>
          This app isn't connected to a Supabase project, so sign-in and
          cross-device sync aren't available. Everything else (anchor
          selection, sessions) still works locally on this device.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to sync</Text>
      <Text style={styles.body}>
        We'll email you a link — no password needed. Your Primary Anchor and
        session history will sync across devices once you're signed in.
      </Text>

      {status === 'sent' ? (
        <Text style={styles.sentText}>Check your email for the sign-in link.</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#8a8aa0"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={onSendLink}
            disabled={status === 'sending' || !email.includes('@')}
          >
            {status === 'sending' ? (
              <ActivityIndicator color="#1a1a24" />
            ) : (
              <Text style={styles.buttonText}>Send sign-in link</Text>
            )}
          </TouchableOpacity>
          {status === 'error' && <Text style={styles.errorText}>{errorMessage}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#e6e6f0',
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    color: '#b8b8c8',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
    color: '#e6e6f0',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#f2c14e',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1a1a24',
    fontWeight: '700',
    fontSize: 15,
  },
  sentText: {
    color: '#8fd19e',
    fontSize: 15,
  },
  errorText: {
    color: '#e88787',
    fontSize: 13,
  },
});
