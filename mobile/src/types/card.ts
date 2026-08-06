// Canonical Card model — spec §4.
export interface Card {
  id: string;
  assetKey: string;
  category: string;
  version: number;
}

// Per-user card state — spec §4. Exactly one card may have isPrimaryAnchor = true.
export interface UserCardState {
  cardId: string;
  isFavorite: boolean;
  isPrimaryAnchor: boolean;
  lastUsedAt: string | null;
  useCount: number;
}
