import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CARD_MANIFEST } from '../data/cardManifest';
import { CARD_IMAGES } from '../data/cardImages';
import { getPrimaryAnchorId } from '../storage/cardState';
import { startPrimaryAnchorSession } from '../session/startSession';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Home — spec §3: primary anchor, quick activate, stats preview, entry points.

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function notBuiltYet(feature: string) {
  Alert.alert(feature, 'Not built yet — see the phase plan in the build guide.');
}

const DOUBLE_TAP_DELAY_MS = 300;

export default function HomeScreen({ navigation }: Props) {
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const lastTapRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      getPrimaryAnchorId().then(setAnchorId);
    }, [])
  );

  const anchorCard = anchorId
    ? CARD_MANIFEST.find((c) => c.id === anchorId)
    : null;

  const onAnchorPress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY_MS) {
      lastTapRef.current = 0;
      startPrimaryAnchorSession('manual');
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ASCEND</Text>

      <View style={styles.anchorCard}>
        {anchorCard ? (
          <>
            {CARD_IMAGES[anchorCard.id] ? (
              <Image
                source={CARD_IMAGES[anchorCard.id]}
                style={styles.anchorImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.anchorLabel}>{anchorCard.debugLabel}</Text>
            )}
            <TouchableOpacity style={styles.activateButton} onPress={onAnchorPress}>
              <Text style={styles.activateButtonText}>Double-tap to activate</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.anchorLabel}>No Primary Anchor selected yet</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.entryButton}
        onPress={() => navigation.navigate('Deck')}
      >
        <Text style={styles.entryButtonText}>Deck — choose your anchor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.entryButton}
        onPress={() => notBuiltYet('Journal (P4)')}
      >
        <Text style={styles.entryButtonText}>Journal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.entryButton}
        onPress={() => notBuiltYet('AI insights (P5)')}
      >
        <Text style={styles.entryButtonText}>Insights</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.entryButton}
        onPress={() => notBuiltYet('Wearable setup (P6)')}
      >
        <Text style={styles.entryButtonText}>Wearable</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.entryButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.entryButtonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a24',
    padding: 20,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: '#e6e6f0',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  anchorCard: {
    backgroundColor: '#2b2b3a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  anchorLabel: {
    color: '#e6e6f0',
    fontSize: 16,
    marginBottom: 12,
  },
  anchorImage: {
    width: 220,
    aspectRatio: 2 / 3,
    borderRadius: 16,
    marginBottom: 12,
  },
  activateButton: {
    backgroundColor: '#f2c14e',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activateButtonText: {
    color: '#1a1a24',
    fontWeight: '700',
  },
  entryButton: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  entryButtonText: {
    color: '#e6e6f0',
    fontSize: 15,
  },
});
