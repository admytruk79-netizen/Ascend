import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '../types/journal';

// Local journal storage. Offline-first per spec §7 — same local-then-sync
// pattern as sessions/card state, except entries are editable (spec: "edits
// permitted, edit history optional"), so this isn't strictly append-only
// like sessionLog.ts — updateEntry rewrites the entry in place.

const STORAGE_KEY = 'ascend.journalEntries.v1';

function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getAllEntries(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const entries: JournalEntry[] = raw ? JSON.parse(raw) : [];
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Sync engine only — replaces the whole list after a pull/merge.
export async function replaceAllEntries(entries: JournalEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function addEntry(input: {
  text: string;
  mood?: number | null;
  cardId?: string | null;
  sessionId?: string | null;
}): Promise<JournalEntry> {
  const entries = await getAllEntries();
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    entryId: generateEntryId(),
    userId: null,
    createdAt: now,
    updatedAt: now,
    text: input.text,
    mood: input.mood ?? null,
    cardId: input.cardId ?? null,
    sessionId: input.sessionId ?? null,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...entries]));
  return entry;
}

export async function updateEntry(
  entryId: string,
  changes: { text?: string; mood?: number | null }
): Promise<void> {
  const entries = await getAllEntries();
  const next = entries.map((e) =>
    e.entryId === entryId
      ? { ...e, ...changes, updatedAt: new Date().toISOString() }
      : e
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
