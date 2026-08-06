import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { getAiConsent, setAiConsent } from '../ai/consent';
import {
  AIInsight,
  getInsights,
  requestReflection,
  requestWeeklySummary,
  setInsightFeedback,
} from '../ai/aiClient';
import { getAllSessions } from '../storage/sessionLog';

// Spec §8: post-session reflection + weekly summary, thumbs up/down
// feedback. Spec §11: explicit opt-in required before ANY AI processing —
// the consent step below is a real screen state, not a settings toggle
// someone could miss. AI features need an account (the Edge Function has
// to know who's asking and check their consent server-side), so signed-out
// users are prompted to sign in here — the one place in the app where
// that's actually required, everything else works signed-out.

type Props = NativeStackScreenProps<RootStackParamList, 'Insights'>;

type ConsentState = 'loading' | 'granted' | 'not-granted';

export default function InsightsScreen({ navigation }: Props) {
  const { session } = useAuth();
  const [consent, setConsent] = useState<ConsentState>('loading');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState<'reflection' | 'weekly' | null>(null);

  const reload = useCallback(() => {
    if (!session) return;
    getAiConsent(session.user.id).then((granted) =>
      setConsent(granted ? 'granted' : 'not-granted')
    );
    getInsights().then(setInsights);
    getAllSessions().then((sessions) => {
      setLastSessionId(sessions[sessions.length - 1]?.sessionId ?? null);
    });
  }, [session]);

  useFocusEffect(reload);

  if (!isSupabaseConfigured) {
    return (
      <Centered>
        <Text style={styles.body}>
          AI insights need a Supabase project to be configured for this build
          — see mobile/README.md.
        </Text>
      </Centered>
    );
  }

  if (!session) {
    return (
      <Centered>
        <Text style={styles.title}>Sign in for AI insights</Text>
        <Text style={styles.body}>
          Reflections and weekly summaries are generated server-side and need
          an account so we know whose data we're looking at.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.primaryButtonText}>Sign in</Text>
        </TouchableOpacity>
      </Centered>
    );
  }

  if (consent === 'loading') {
    return (
      <Centered>
        <ActivityIndicator color="#f2c14e" />
      </Centered>
    );
  }

  if (consent === 'not-granted') {
    return (
      <Centered>
        <Text style={styles.title}>Turn on AI insights?</Text>
        <Text style={styles.body}>
          When you ask for a reflection or weekly summary, your session and
          journal text is sent to our server, checked for crisis language,
          and — if it's safe to — passed to an AI model to generate a short,
          calm reflection. Nothing is sent to the AI model without this step
          first. You can turn this off again any time from here.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            await setAiConsent(session.user.id, true);
            setConsent('granted');
          }}
        >
          <Text style={styles.primaryButtonText}>Enable AI insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Not now</Text>
        </TouchableOpacity>
      </Centered>
    );
  }

  const onGetReflection = async () => {
    if (!lastSessionId) {
      Alert.alert('No sessions yet', 'Complete a session first.');
      return;
    }
    setBusy('reflection');
    try {
      await requestReflection(lastSessionId);
      reload();
    } catch (err) {
      Alert.alert('Couldn\'t get a reflection', String(err));
    } finally {
      setBusy(null);
    }
  };

  const onGetWeeklySummary = async () => {
    setBusy('weekly');
    try {
      await requestWeeklySummary();
      reload();
    } catch (err) {
      Alert.alert('Couldn\'t get a summary', String(err));
    } finally {
      setBusy(null);
    }
  };

  const onFeedback = async (insight: AIInsight, feedback: 'up' | 'down') => {
    await setInsightFeedback(insight.insight_id, feedback);
    reload();
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onGetReflection}
          disabled={busy !== null}
        >
          {busy === 'reflection' ? (
            <ActivityIndicator color="#1a1a24" />
          ) : (
            <Text style={styles.primaryButtonText}>Reflect on last session</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onGetWeeklySummary}
          disabled={busy !== null}
        >
          {busy === 'weekly' ? (
            <ActivityIndicator color="#1a1a24" />
          ) : (
            <Text style={styles.primaryButtonText}>Weekly summary</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={insights}
        keyExtractor={(i) => i.insight_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.insightCard}>
            <Text style={styles.insightKind}>
              {item.kind === 'post_session' ? 'Session reflection' : 'Weekly summary'}
              {item.safety_flagged ? ' · resource message' : ''}
            </Text>
            <Text style={styles.insightContent}>{item.content}</Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity onPress={() => onFeedback(item, 'up')}>
                <Text style={item.feedback === 'up' ? styles.feedbackOn : styles.feedbackOff}>
                  👍
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onFeedback(item, 'down')}>
                <Text style={item.feedback === 'down' ? styles.feedbackOn : styles.feedbackOff}>
                  👎
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.body}>No insights yet.</Text>}
      />

      <TouchableOpacity
        style={styles.disableLink}
        onPress={async () => {
          await setAiConsent(session.user.id, false);
          setConsent('not-granted');
        }}
      >
        <Text style={styles.disableLinkText}>Turn off AI insights</Text>
      </TouchableOpacity>
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
  },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#e6e6f0',
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    color: '#b8b8c8',
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#f2c14e',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1a1a24',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 12,
  },
  secondaryButtonText: {
    color: '#b8b8c8',
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  insightCard: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
  },
  insightKind: {
    color: '#8a8aa0',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightContent: {
    color: '#e6e6f0',
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  feedbackOn: {
    fontSize: 18,
    opacity: 1,
  },
  feedbackOff: {
    fontSize: 18,
    opacity: 0.35,
  },
  disableLink: {
    padding: 16,
    alignItems: 'center',
  },
  disableLinkText: {
    color: '#8a8aa0',
    fontSize: 13,
  },
});
