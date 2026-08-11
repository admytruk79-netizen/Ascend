import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
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

// Deck modal — spec §3: "browse cards, select Primary Anchor, favorites,
// recent." Cards with an entry in CARD_IMAGES render the real art; the rest
// fall back to a placeholder color tile with a debug label until their art
// is added (see cardManifest.ts / cardImages.ts).
// Spec §4: cards are abstract images with NO embedded text in the shipped
// product — the debugLabel text is dev-only scaffolding for the fallback.
//
// Grouped by category (not one flat 42-card grid) so the mechanism
// categories from the manifest are actually visible/browsable, not just
// metadata sitting unused in a long-press alert.

const CATEGORY_LABELS: Record<string, string> = {
  panic_crisis: 'Panic / Crisis',
  anger_friction: 'Anger / Friction',
  racing_thoughts: 'Racing Thoughts',
  grief_loss: 'Grief / Loss',
  general_reflective: 'General / Reflective',
};

function groupByCategory() {
  const groups = new Map<string, typeof CARD_MANIFEST>();
  for (const card of CARD_MANIFEST) {
    const existing = groups.get(card.category);
    if (existing) {
      existing.push(card);
    } else {
      groups.set(card.category, [card]);
    }
  }
  return Array.from(groups.entries());
}

const SECTIONS = groupByCategory();

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
    <ScrollView contentContainerStyle={styles.list}>
      {SECTIONS.map(([category, cards]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {CATEGORY_LABELS[category] ?? category}
          </Text>
          <View style={styles.row}>
            {cards.map((item) => {
              const state = states[item.id];
              const isAnchor = !!state?.isPrimaryAnchor;
              const isFavorite = !!state?.isFavorite;
              const artSource = CARD_IMAGES[item.id];
              return (
                <View key={item.id} style={styles.tileWrap}>
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
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#e6e6f0',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tileWrap: {
    width: '33.33%',
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
