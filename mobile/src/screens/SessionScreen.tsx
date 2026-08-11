import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  AppStateStatus,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { CARD_IMAGES } from '../data/cardImages';
import { recordUse } from '../storage/cardState';
import { appendSession, generateSessionId } from '../storage/sessionLog';

// Active session screen — spec §5/§2 + build guide P2.
//
// Shows ONLY the card image and a breathing cue. No Grounded/Spirit card
// text here — that belongs in the deck-browse (calm-state) screen. This is
// a deliberate design decision, not something to "complete" later: acute
// stress impairs sustained/analytical attention, so the timed activation
// view stays non-analytical on purpose.
//
// The manifest has no real per-card breathing pattern yet (only category +
// acuteRecommended came through) so the breathing cue below is a generic
// 4s-in/4s-out pulse used for every card, not real per-card data. Swap in
// real patterns once they're available the same way category/acuteRecommended
// were.

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

const PLANNED_SECONDS_DEFAULT = 120;
const EXTEND_SECONDS = 60;
const MAX_EXTENDS = 3;
const BACKGROUND_GRACE_MS = 60_000;

export default function SessionScreen({ route, navigation }: Props) {
  const { cardId, triggerSource } = route.params;

  const [secondsRemaining, setSecondsRemaining] = useState(PLANNED_SECONDS_DEFAULT);
  const [plannedSeconds, setPlannedSeconds] = useState(PLANNED_SECONDS_DEFAULT);
  const [extendCount, setExtendCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mirrors of state for reading the latest values from callbacks that
  // aren't tied to the render cycle (AppState listener, BackHandler, the
  // interval tick itself) without stale closures.
  const secondsRemainingRef = useRef(secondsRemaining);
  const plannedSecondsRef = useRef(plannedSeconds);
  const extendCountRef = useRef(extendCount);
  useEffect(() => {
    secondsRemainingRef.current = secondsRemaining;
  }, [secondsRemaining]);
  useEffect(() => {
    plannedSecondsRef.current = plannedSeconds;
  }, [plannedSeconds]);
  useEffect(() => {
    extendCountRef.current = extendCount;
  }, [extendCount]);

  const sessionIdRef = useRef(generateSessionId());
  const startedAtRef = useRef(new Date().toISOString());
  const endedRef = useRef(false); // guards against double-logging/double-nav
  const backgroundedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const artSource = CARD_IMAGES[cardId];

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const endSession = useCallback(
    (outcome: { completed: boolean; interrupted: boolean }) => {
      if (endedRef.current) return;
      endedRef.current = true;
      clearTick();

      const actualSeconds = Math.max(
        0,
        plannedSecondsRef.current - secondsRemainingRef.current
      );

      appendSession({
        sessionId: sessionIdRef.current,
        userId: null,
        cardId,
        triggerSource,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        plannedSeconds: plannedSecondsRef.current,
        actualSeconds,
        extendCount: extendCountRef.current,
        completed: outcome.completed,
        interrupted: outcome.interrupted,
      });

      if (navigation.isFocused()) {
        navigation.goBack();
      }
    },
    [cardId, triggerSource, navigation, clearTick]
  );

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          endSession({ completed: true, interrupted: false });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTick, endSession]);

  // Session start: log the anchor use, kick off the countdown.
  useEffect(() => {
    recordUse(cardId);
    startTick();
    return clearTick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AppState: pause while backgrounded, resume within the 60s grace window,
  // otherwise end the session as interrupted. The interrupt can only be
  // acted on when the app comes back to 'active' — JS doesn't run while
  // truly backgrounded, so there's no way to end it "live" during the gap.
  useEffect(() => {
    const onChange = (nextState: AppStateStatus) => {
      if (endedRef.current) return;

      if (nextState === 'background' || nextState === 'inactive') {
        if (backgroundedAtRef.current === null) {
          backgroundedAtRef.current = Date.now();
          setIsPaused(true);
          clearTick();
        }
        return;
      }

      if (nextState === 'active' && backgroundedAtRef.current !== null) {
        const gapMs = Date.now() - backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (gapMs > BACKGROUND_GRACE_MS) {
          endSession({ completed: false, interrupted: true });
        } else {
          setIsPaused(false);
          startTick();
        }
      }
    };

    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [clearTick, startTick, endSession]);

  // Android hardware back button during a session is an early exit, same as
  // the on-screen close button — log it as interrupted, don't lose the data.
  useEffect(() => {
    const onBackPress = () => {
      endSession({ completed: false, interrupted: true });
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [endSession]);

  // Unmount without a logged end (shouldn't normally happen since endSession
  // navigates back itself, but covers e.g. a parent-initiated reset) — log
  // rather than silently lose the session, per spec §12 "no data loss".
  useEffect(() => {
    return () => {
      if (!endedRef.current) {
        endSession({ completed: false, interrupted: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breathScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.12,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    if (!isPaused) {
      loop.start();
    }
    return () => loop.stop();
  }, [isPaused, breathScale]);

  const onExtend = () => {
    if (isPaused || extendCount >= MAX_EXTENDS) return;
    setSecondsRemaining((s) => s + EXTEND_SECONDS);
    setPlannedSeconds((p) => p + EXTEND_SECONDS);
    setExtendCount((c) => c + 1);
  };

  const onClose = () => {
    endSession({ completed: false, interrupted: true });
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const countdownLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {artSource && (
        <Image source={artSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}
      <View style={styles.overlay} />

      <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={16}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.countdown}>{countdownLabel}</Text>
        {isPaused && <Text style={styles.pausedLabel}>Paused</Text>}

        <Animated.View style={[styles.breathCircle, { transform: [{ scale: breathScale }] }]} />
        <Text style={styles.breathLabel}>Breathe</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.extendButton,
          (isPaused || extendCount >= MAX_EXTENDS) && styles.extendButtonDisabled,
        ]}
        onPress={onExtend}
        disabled={isPaused || extendCount >= MAX_EXTENDS}
      >
        <Text style={styles.extendButtonText}>
          {extendCount >= MAX_EXTENDS ? 'Max extended' : `Extend +${EXTEND_SECONDS}s`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '300',
    marginBottom: 8,
  },
  pausedLabel: {
    color: '#f2c14e',
    fontSize: 14,
    marginBottom: 24,
  },
  breathCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    marginTop: 24,
  },
  breathLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginTop: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  extendButton: {
    marginBottom: 56,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  extendButtonDisabled: {
    opacity: 0.4,
  },
  extendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
