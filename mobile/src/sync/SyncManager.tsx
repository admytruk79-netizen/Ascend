import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../auth/AuthContext';
import { runSync } from './syncEngine';

// Mounted once near the app root (see App.tsx). Runs no UI — pure side
// effect component wiring the two trigger points spec §9 asks for:
// "on launch: pull remote → local" and "on reconnect: push pending queue".
// Both are implemented as the same pull-then-push runSync call for
// simplicity (spec explicitly says this doesn't need to be a full sync
// engine); running pull again on reconnect is redundant but harmless.
export function SyncManager() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const wasOfflineRef = useRef(false);

  // Launch / sign-in: sync once as soon as we have a user.
  useEffect(() => {
    if (userId) {
      runSync(userId);
    }
  }, [userId]);

  // Reconnect: sync again after coming back online mid-session.
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      if (isOnline && wasOfflineRef.current) {
        runSync(userId);
      }
      wasOfflineRef.current = !isOnline;
    });
    return unsubscribe;
  }, [userId]);

  return null;
}
