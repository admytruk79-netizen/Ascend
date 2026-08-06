// JournalEntry model — spec §7, plus updatedAt for P4's edit-and-sync
// support (edits are permitted per spec; edit *history* is explicitly not
// required, so this is the only extra field, not a whole audit log).
export interface JournalEntry {
  entryId: string;
  userId: string | null; // local-only entries have no user until synced
  createdAt: string;
  updatedAt: string;
  text: string;
  mood: number | null; // 1-5, optional per spec
  cardId: string | null;
  sessionId: string | null;
}
