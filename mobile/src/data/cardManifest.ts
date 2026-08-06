import { Card } from '../types/card';

// Cards 1-34 use the real card-manifest-34-final.json (mechanism-tagged mood
// category + acuteRecommended). Cards 35-42 have real art (see cardImages.ts)
// but no manifest entry exists for them yet — per the build guide they were
// never tagged, so they stay `general_reflective` / acuteRecommended: false
// as an explicit placeholder, not a real assignment.
//
// `debugLabel` is not part of the canonical Card model (spec §4) — it's
// only shown on long-press (DeckScreen) as a dev label, and as the
// deck-tile fallback for any card without art in cardImages.ts.

interface PlaceholderCard extends Card {
  debugLabel: string;
}

const CARDS_1_TO_34: Array<{
  title: string;
  category: string;
  acuteRecommended: boolean;
}> = [
  { title: 'The Flame Of Purity', category: 'panic_crisis', acuteRecommended: true },
  { title: 'Cosmic Harmony', category: 'anger_friction', acuteRecommended: true },
  { title: 'The Spiral of Wisdom', category: 'racing_thoughts', acuteRecommended: true },
  { title: 'Celestial Awakening', category: 'general_reflective', acuteRecommended: false },
  { title: 'Flame of Glory', category: 'general_reflective', acuteRecommended: false },
  { title: 'Boundless Cycle', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Dormant Spirit', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Radiant Source', category: 'panic_crisis', acuteRecommended: true },
  { title: 'The Rainbow Feather', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Solar Axis', category: 'panic_crisis', acuteRecommended: true },
  { title: 'The Star Of Justice', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Voice Of Silence', category: 'panic_crisis', acuteRecommended: true },
  { title: 'The Crown Of Radiance', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Lotus of Renewal', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Pillar of Spirit', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Emerald Order', category: 'racing_thoughts', acuteRecommended: true },
  { title: 'The Bridge Between Worlds', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Root Of Shadow', category: 'anger_friction', acuteRecommended: true },
  { title: 'The Tree Of Emanations', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Spine of Crystalline Wisdom', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Sacred Polarity', category: 'racing_thoughts', acuteRecommended: true },
  { title: 'The Radiant Crown', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Veil of Maya', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Sphere of Harmony', category: 'panic_crisis', acuteRecommended: true },
  { title: 'The Prismatic Stream', category: 'anger_friction', acuteRecommended: true },
  { title: 'The Temporal Mirage', category: 'racing_thoughts', acuteRecommended: true },
  { title: 'The Alchemical Hourglass', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Radiant Flame', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Primordial Spark', category: 'general_reflective', acuteRecommended: false },
  { title: 'The New Order', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Holy Fire', category: 'anger_friction', acuteRecommended: true },
  { title: 'The Phoenix Gateway', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Inner Compass', category: 'racing_thoughts', acuteRecommended: true },
  { title: 'The Cosmic Cycle', category: 'racing_thoughts', acuteRecommended: true },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const CARD_MANIFEST: PlaceholderCard[] = [
  ...CARDS_1_TO_34.map((card, index) => {
    const id = String(index + 1);
    return {
      id,
      assetKey: `anchor_${slugify(card.title)}`,
      category: card.category,
      acuteRecommended: card.acuteRecommended,
      version: 1,
      debugLabel: card.title,
    };
  }),
  ...Array.from({ length: 8 }, (_, i) => {
    const num = 35 + i;
    const id = String(num);
    return {
      id,
      assetKey: `placeholder/${id}`,
      category: 'general_reflective',
      acuteRecommended: false,
      version: 1,
      debugLabel: `Card ${num} (untitled)`,
    };
  }),
];
