// Canonical Card model — spec §4, plus acuteRecommended from the real
// card-manifest-34-final.json (mechanism-tagged mood category + whether the
// card is recommended for acute/crisis use, not just reflective browsing).
export interface Card {
  id: string;
  assetKey: string;
  category: string;
  version: number;
  acuteRecommended: boolean;
}

// Per-user card state — spec §4. Exactly one card may have isPrimaryAnchor = true.
// updatedAt drives P3's last-write-wins sync for anchor/favorites (spec §9)
// — not itself a spec §4 field, but required to implement that sync rule.
export interface UserCardState {
  cardId: string;
  isFavorite: boolean;
  isPrimaryAnchor: boolean;
  lastUsedAt: string | null;
  useCount: number;
  updatedAt: string;
}
