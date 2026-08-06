import { Card } from '../types/card';

// Full 42-card manifest — mechanism-tagged mood category + acuteRecommended
// per card, from the real card manifest data. `debugLabel` is not part of
// the canonical Card model (spec §4) — it's only shown on long-press
// (DeckScreen) as a dev label.

interface PlaceholderCard extends Card {
  debugLabel: string;
}

const CARDS: Array<{
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
  { title: 'The Solar Storm', category: 'panic_crisis', acuteRecommended: true },
  { title: 'The Crystalline Silence', category: 'racing_thoughts', acuteRecommended: true },
  { title: 'The Integrity', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Illuminating Consciousness', category: 'general_reflective', acuteRecommended: false },
  { title: 'The Star Navigator', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Cosmic Harbor', category: 'anger_friction', acuteRecommended: true },
  { title: 'The Sacred Flame Rise', category: 'grief_loss', acuteRecommended: true },
  { title: 'The Source of Guidance', category: 'racing_thoughts', acuteRecommended: true },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const CARD_MANIFEST: PlaceholderCard[] = CARDS.map((card, index) => {
  const id = String(index + 1);
  return {
    id,
    assetKey: `anchor_${slugify(card.title)}`,
    category: card.category,
    acuteRecommended: card.acuteRecommended,
    version: 1,
    debugLabel: card.title,
  };
});
