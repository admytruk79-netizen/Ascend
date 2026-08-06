import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CARD_MANIFEST } from '../data/cardManifest';
import { CARD_IMAGES } from '../data/cardImages';
import {
  getAllCardStates,
  setPrimaryAnchor,
  toggleFavorite,
} from '../storage/cardState';
import { UserCardState } from '../types/card';

// Deck modal — spec §3: "browse 11 [now 42] cards, select Primary Anchor,
// favorites, recent." Cards with an entry in CARD_IMAGES render the real
// art; the rest fall back to a placeholder color tile with a debug label
// until their art is added (see cardManifest.ts / cardImages.ts).
// Spec §4: cards are abstract images with NO embedded text in the shipped
// product — the debugLabel text is dev-only scaffolding for the fallback.

export default function DeckScreen() {
  const [states, setStates] = useState<Record<string, UserCardState>>({});

  const reload = useCallback(() => {
    getAllCardStates().then(setStates);
  }, []);

  useEffect(reload, [reload]);

  const onSelectAnchor = async (cardId: string) => {
    const next = await setPrimaryAnchor(cardId);
    setStates(next);
  };

  const onToggleFavorite = async (cardId: string) => {
    const next = await toggleFavorite(cardId);
    setStates(next);
  };

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={CARD_MANIFEST}
      numColumns={3}
      keyExtractor={(card) => card.id}
      renderItem={({ item }) => {
        const state = states[item.id];
        const isAnchor = !!state?.isPrimaryAnchor;
        const isFavorite = !!state?.isFavorite;
        const artSource = CARD_IMAGES[item.id];
        return (
          <View style={styles.tileWrap}>
            <TouchableOpacity
              style={[styles.tile, isAnchor && styles.tileAnchor]}
              onPress={() => onSelectAnchor(item.id)}
              onLongPress={() =>
                Alert.alert(item.debugLabel, `Card ${item.id} · ${item.category}`)
              }
            >
              {artSource ? (
                <Image
                  source={artSource}
                  style={styles.tileImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.tileLabel} numberOfLines={2}>
                  {item.debugLabel}
                </Text>
              )}
              {isAnchor && <Text style={styles.anchorBadge}>ANCHOR</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => onToggleFavorite(item.id)}
            >
              <Text style={isFavorite ? styles.favoriteOn : styles.favoriteOff}>
                {isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 8,
  },
  tileWrap: {
    flex: 1 / 3,
    padding: 6,
    alignItems: 'center',
  },
  tile: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: '#2b2b3a',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  tileAnchor: {
    borderWidth: 2,
    borderColor: '#f2c14e',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileLabel: {
    color: '#e6e6f0',
    fontSize: 11,
    textAlign: 'center',
  },
  anchorBadge: {
    position: 'absolute',
    bottom: 6,
    fontSize: 9,
    color: '#f2c14e',
    fontWeight: '700',
  },
  favoriteButton: {
    marginTop: 4,
  },
  favoriteOn: {
    color: '#f2c14e',
    fontSize: 16,
  },
  favoriteOff: {
    color: '#8a8aa0',
    fontSize: 16,
  },
});
