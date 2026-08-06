import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getAllCardStates, replaceAllCardStates } from '../storage/cardState';
import { getAllSessions } from '../storage/sessionLog';
import { getAllEntries, replaceAllEntries } from '../storage/journalLog';
import { UserCardState } from '../types/card';
import { Session } from '../types/session';
import { JournalEntry } from '../types/journal';

// Spec §9 sync strategy, deliberately simple (not a full sync engine —
// WatermelonDB-style conflict resolution is overkill for these three rules):
//   - Sessions: append-only. Push whatever hasn't been pushed yet.
//   - UserCardState (Primary Anchor + favorites): last-write-wins by
//     updatedAt, merged client-side.
//   - JournalEntries: mostly append-only, but edits are permitted (spec §7),
//     so entries sync the same last-write-wins-by-updatedAt way card state
//     does, not the pure-insert way sessions do.
//
// Known simplification: user_card_state has a DB constraint allowing only
// one is_primary_anchor row per user. If two devices set different anchors
// within the same sync window, one push can fail that constraint — this
// engine logs and skips the failure rather than resolving it, which is a
// reasonable tradeoff for a single-user app (the same person switching
// anchors on two devices at literally the same instant is a rare edge case,
// not a design the MVP needs to solve for).

const SYNCED_SESSION_IDS_KEY = 'ascend.sessions.syncedIds.v1';

async function getSyncedSessionIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(SYNCED_SESSION_IDS_KEY);
  return new Set(raw ? (JSON.parse(raw) as string[]) : []);
}

async function markSessionsSynced(ids: string[]): Promise<void> {
  const existing = await getSyncedSessionIds();
  ids.forEach((id) => existing.add(id));
  await AsyncStorage.setItem(SYNCED_SESSION_IDS_KEY, JSON.stringify([...existing]));
}

function toDbCardStateRow(userId: string, state: UserCardState) {
  return {
    user_id: userId,
    card_id: state.cardId,
    is_favorite: state.isFavorite,
    is_primary_anchor: state.isPrimaryAnchor,
    last_used_at: state.lastUsedAt,
    use_count: state.useCount,
    updated_at: state.updatedAt,
  };
}

function fromDbCardStateRow(row: {
  card_id: string;
  is_favorite: boolean;
  is_primary_anchor: boolean;
  last_used_at: string | null;
  use_count: number;
  updated_at: string;
}): UserCardState {
  return {
    cardId: row.card_id,
    isFavorite: row.is_favorite,
    isPrimaryAnchor: row.is_primary_anchor,
    lastUsedAt: row.last_used_at,
    useCount: row.use_count,
    updatedAt: row.updated_at,
  };
}

function toDbSessionRow(userId: string, session: Session) {
  return {
    session_id: session.sessionId,
    user_id: userId,
    card_id: session.cardId,
    trigger_source: session.triggerSource,
    started_at: session.startedAt,
    ended_at: session.endedAt,
    planned_seconds: session.plannedSeconds,
    actual_seconds: session.actualSeconds,
    extend_count: session.extendCount,
    completed: session.completed,
    interrupted: session.interrupted,
  };
}

function toDbJournalRow(userId: string, entry: JournalEntry) {
  return {
    entry_id: entry.entryId,
    user_id: userId,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    text: entry.text,
    mood: entry.mood,
    card_id: entry.cardId,
    session_id: entry.sessionId,
  };
}

function fromDbJournalRow(row: {
  entry_id: string;
  created_at: string;
  updated_at: string;
  text: string;
  mood: number | null;
  card_id: string | null;
  session_id: string | null;
}): JournalEntry {
  return {
    entryId: row.entry_id,
    userId: null, // filled in by the caller if ever needed; local records don't carry it
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    text: row.text,
    mood: row.mood,
    cardId: row.card_id,
    sessionId: row.session_id,
  };
}

// Pull remote UserCardState, merge into local by updatedAt (last write wins
// per card), write the merged map back locally.
async function pullAndMergeCardState(userId: string): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('user_card_state')
    .select('*')
    .eq('user_id', userId);
  if (error || !data) return;

  const local = await getAllCardStates();
  const merged = { ...local };

  for (const row of data) {
    const remote = fromDbCardStateRow(row);
    const existing = merged[remote.cardId];
    if (!existing || new Date(remote.updatedAt) > new Date(existing.updatedAt)) {
      merged[remote.cardId] = remote;
    }
  }

  // Primary-anchor invariant: if the merge left more than one card flagged,
  // keep only the one with the latest updatedAt (mirrors the DB's partial
  // unique index, since the merge above operates per-card, not globally).
  const anchors = Object.values(merged).filter((s) => s.isPrimaryAnchor);
  if (anchors.length > 1) {
    const latest = anchors.reduce((a, b) =>
      new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
    );
    for (const card of anchors) {
      if (card.cardId !== latest.cardId) {
        merged[card.cardId] = { ...card, isPrimaryAnchor: false };
      }
    }
  }

  await replaceAllCardStates(merged);
}

async function pushCardState(userId: string): Promise<void> {
  if (!supabase) return;
  const local = await getAllCardStates();
  const rows = Object.values(local).map((s) => toDbCardStateRow(userId, s));
  if (rows.length === 0) return;
  const { error } = await supabase.from('user_card_state').upsert(rows);
  if (error) {
    console.warn('[sync] user_card_state push failed:', error.message);
  }
}

// Same last-write-wins merge shape as pullAndMergeCardState, keyed by
// entryId instead of cardId — entries have no single-row invariant to
// re-check afterward, so this is simpler than the card-state version.
async function pullAndMergeJournal(userId: string): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId);
  if (error || !data) return;

  const local = await getAllEntries();
  const byId = new Map(local.map((e) => [e.entryId, e]));

  for (const row of data) {
    const remote = fromDbJournalRow(row);
    const existing = byId.get(remote.entryId);
    if (!existing || new Date(remote.updatedAt) > new Date(existing.updatedAt)) {
      byId.set(remote.entryId, remote);
    }
  }

  await replaceAllEntries([...byId.values()]);
}

async function pushJournal(userId: string): Promise<void> {
  if (!supabase) return;
  const local = await getAllEntries();
  if (local.length === 0) return;
  const rows = local.map((e) => toDbJournalRow(userId, e));
  const { error } = await supabase.from('journal_entries').upsert(rows);
  if (error) {
    console.warn('[sync] journal_entries push failed:', error.message);
  }
}

async function pushPendingSessions(userId: string): Promise<void> {
  if (!supabase) return;
  const [allSessions, syncedIds] = await Promise.all([
    getAllSessions(),
    getSyncedSessionIds(),
  ]);
  const pending = allSessions.filter((s) => !syncedIds.has(s.sessionId));
  if (pending.length === 0) return;

  const rows = pending.map((s) => toDbSessionRow(userId, s));
  const { error } = await supabase.from('sessions').insert(rows);
  if (error) {
    console.warn('[sync] sessions push failed:', error.message);
    return;
  }
  await markSessionsSynced(pending.map((s) => s.sessionId));
}

// Pull-then-push, in that order: merge remote state in first so the push
// that follows reflects the merge result rather than clobbering a newer
// remote value with a stale local one. Best-effort — errors are logged, not
// thrown, so a flaky connection never crashes the app around this.
export async function runSync(userId: string): Promise<void> {
  try {
    await pullAndMergeCardState(userId);
    await pushCardState(userId);
    await pullAndMergeJournal(userId);
    await pushJournal(userId);
    await pushPendingSessions(userId);
  } catch (err) {
    console.warn('[sync] runSync failed:', err);
  }
}
