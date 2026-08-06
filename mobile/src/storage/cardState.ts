import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserCardState } from '../types/card';

// Local-first card state (spec §9 sync strategy: last-write-wins for anchor
// and favorites). P3 adds the Supabase push/pull; until then this is the
// only source of truth, matching the build guide's P1 instruction to store
// locally first.

const STORAGE_KEY = 'ascend.userCardState.v1';

type StateMap = Record<string, UserCardState>;

function emptyState(cardId: string): UserCardState {
  return {
    cardId,
    isFavorite: false,
    isPrimaryAnchor: false,
    lastUsedAt: null,
    useCount: 0,
  };
}

async function readAll(): Promise<StateMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StateMap) : {};
}

async function writeAll(state: StateMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function getAllCardStates(): Promise<StateMap> {
  return readAll();
}

export async function getPrimaryAnchorId(): Promise<string | null> {
  const state = await readAll();
  const entry = Object.values(state).find((s) => s.isPrimaryAnchor);
  return entry?.cardId ?? null;
}

// Enforces spec §4's "exactly one Primary Anchor at a time" rule by clearing
// the flag on every other card before setting it on the chosen one.
export async function setPrimaryAnchor(cardId: string): Promise<StateMap> {
  const state = await readAll();
  for (const key of Object.keys(state)) {
    state[key] = { ...state[key], isPrimaryAnchor: false };
  }
  state[cardId] = {
    ...(state[cardId] ?? emptyState(cardId)),
    isPrimaryAnchor: true,
  };
  await writeAll(state);
  return state;
}

export async function toggleFavorite(cardId: string): Promise<StateMap> {
  const state = await readAll();
  const current = state[cardId] ?? emptyState(cardId);
  state[cardId] = { ...current, isFavorite: !current.isFavorite };
  await writeAll(state);
  return state;
}

export async function recordUse(cardId: string): Promise<StateMap> {
  const state = await readAll();
  const current = state[cardId] ?? emptyState(cardId);
  state[cardId] = {
    ...current,
    lastUsedAt: new Date().toISOString(),
    useCount: current.useCount + 1,
  };
  await writeAll(state);
  return state;
}
