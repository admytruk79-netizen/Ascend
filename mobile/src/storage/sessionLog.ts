import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types/session';

// Local session log. Append-only per spec §9 sync strategy — P3 pushes this
// queue to Supabase on reconnect and never rewrites past entries locally.

const STORAGE_KEY = 'ascend.sessions.v1';

export async function appendSession(session: Session): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const sessions: Session[] = raw ? JSON.parse(raw) : [];
  sessions.push(session);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export async function getAllSessions(): Promise<Session[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
