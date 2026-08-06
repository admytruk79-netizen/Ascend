import { Card } from '../types/card';

// PLACEHOLDER MANIFEST — not the real asset manifest.
//
// The real source of truth is `card-manifest-34-final.json` (cards 1-34,
// mechanism-tagged with panic_crisis / racing_thoughts / grief_loss /
// anger_friction / general_reflective) plus 8 more from a direct-upload set
// (cards 35-42, untagged). Neither file nor any of the 42 card images were
// reachable from this environment when this manifest was written, so every
// card below is `category: 'general_reflective'` — do not treat that as a
// real mood-tag assignment, it's a placeholder pending the actual manifest.
//
// `debugLabel` is not part of the canonical Card model (spec §4) — it only
// exists so the deck screen has something legible to show before real card
// art is wired in. Delete it once real assets replace the placeholder tiles
// in DeckScreen.tsx.

interface PlaceholderCard extends Card {
  debugLabel: string;
}

const TITLED_CARDS_1_TO_34: string[] = [
  'The Flame Of Purity',
  'Cosmic Harmony',
  'The Spiral of Wisdom',
  'Celestial Awakening',
  'Flame of Glory',
  'Boundless Cycle',
  'The Dormant Spirit',
  'The Radiant Source',
  'The Rainbow Feather',
  'The Solar Axis',
  'The Star Of Justice',
  'The Voice Of Silence',
  'The Crown Of Radiance',
  'The Lotus of Renewal',
  'The Pillar of Spirit',
  'The Emerald Order',
  'The Bridge Between Worlds',
  'The Root Of Shadow',
  'The Tree Of Emanations',
  'The Spine of Crystalline Wisdom',
  'The Sacred Polarity',
  'The Radiant Crown',
  'The Veil of Maya',
  'The Sphere of Harmony',
  'The Prismatic Stream',
  'The Temporal Mirage',
  'The Alchemical Hourglass',
  'The Radiant Flame',
  'The Primordial Spark',
  'The New Order',
  'The Holy Fire',
  'The Phoenix Gateway',
  'The Inner Compass',
  'The Cosmic Cycle',
];

export const CARD_MANIFEST: PlaceholderCard[] = [
  ...TITLED_CARDS_1_TO_34.map((title, index) => {
    const id = String(index + 1);
    return {
      id,
      assetKey: `placeholder/${id}`,
      category: 'general_reflective',
      version: 1,
      debugLabel: title,
    };
  }),
  ...Array.from({ length: 8 }, (_, i) => {
    const num = 35 + i;
    const id = String(num);
    return {
      id,
      assetKey: `placeholder/${id}`,
      category: 'general_reflective',
      version: 1,
      debugLabel: `Card ${num} (untitled)`,
    };
  }),
];
