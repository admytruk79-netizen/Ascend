import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserCardState } from '../types/card';

// Local-first card state (spec §9 sync strategy: last-write-wins for anchor
// and favorites). This remains the source of truth signed-out; P3's sync
// engine (../sync/syncEngine.ts) merges it with Supabase when signed in.

const STORAGE_KEY = 'ascend.userCardState.v1';

type StateMap = Record<string, UserCardState>;

function emptyState(cardId: string): UserCardState {
  return {
    cardId,
    isFavorite: false,
    isPrimaryAnchor: false,
    lastUsedAt: null,
    useCount: 0,
    updatedAt: new Date(0).toISOString(),
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

// Sync engine only — replaces the whole map after a pull/merge. Not for
// regular app code (use the mutators below, which stamp updatedAt).
export async function replaceAllCardStates(state: StateMap): Promise<void> {
  await writeAll(state);
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
  const now = new Date().toISOString();
  for (const key of Object.keys(state)) {
    if (state[key].isPrimaryAnchor) {
      state[key] = { ...state[key], isPrimaryAnchor: false, updatedAt: now };
    }
  }
  state[cardId] = {
    ...(state[cardId] ?? emptyState(cardId)),
    isPrimaryAnchor: true,
    updatedAt: now,
  };
  await writeAll(state);
  return state;
}

export async function toggleFavorite(cardId: string): Promise<StateMap> {
  const state = await readAll();
  const current = state[cardId] ?? emptyState(cardId);
  state[cardId] = {
    ...current,
    isFavorite: !current.isFavorite,
    updatedAt: new Date().toISOString(),
  };
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
    updatedAt: new Date().toISOString(),
  };
  await writeAll(state);
  return state;
}
