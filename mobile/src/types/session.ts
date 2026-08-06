// Session model — spec §5.
export type TriggerSource = 'manual' | 'wearable';

export interface Session {
  sessionId: string;
  userId: string | null; // no auth until P3 — local-only sessions have no user yet
  cardId: string;
  triggerSource: TriggerSource;
  startedAt: string;
  endedAt: string;
  plannedSeconds: number;
  actualSeconds: number;
  extendCount: number;
  completed: boolean;
  interrupted: boolean;
}
