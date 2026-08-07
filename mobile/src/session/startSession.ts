import { Alert } from 'react-native';
import { navigationRef } from '../navigation/RootNavigator';
import { getPrimaryAnchorId } from '../storage/cardState';
import { getAllSessions } from '../storage/sessionLog';
import { TriggerSource } from '../types/session';
import { hasPremiumEntitlement, isPurchasesConfigured } from '../purchases/purchases';

// Spec §10: unlimited sessions is a premium entitlement, meaning the free
// tier has *some* cap — spec doesn't say what number, so this is a guess,
// not a confirmed product decision. Easy to change in one place once
// there's a real answer; don't treat "3" as meaningful.
const FREE_TIER_SESSIONS_PER_DAY = 3;

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// Single entry point for launching a session on the current Primary Anchor —
// spec §5: "manual double-tap and BLE trigger both launch the Primary Anchor
// by default." HomeScreen's double-tap and WearableScreen's Test trigger
// both call this the same way — no separate BLE-specific path needed.
export async function startPrimaryAnchorSession(triggerSource: TriggerSource): Promise<void> {
  const cardId = await getPrimaryAnchorId();
  if (!cardId) {
    Alert.alert('No Primary Anchor selected', 'Choose a card in the Deck first.');
    return;
  }
  if (!navigationRef.isReady()) {
    return;
  }

  if (isPurchasesConfigured) {
    const hasPremium = await hasPremiumEntitlement();
    if (!hasPremium) {
      const sessions = await getAllSessions();
      const todayCount = sessions.filter((s) => isToday(s.startedAt)).length;
      if (todayCount >= FREE_TIER_SESSIONS_PER_DAY) {
        Alert.alert(
          'Daily session limit reached',
          `Free accounts get ${FREE_TIER_SESSIONS_PER_DAY} sessions a day. Upgrade for unlimited sessions.`,
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigationRef.navigate('Paywall') },
          ]
        );
        return;
      }
    }
  }

  navigationRef.navigate('Session', { cardId, triggerSource });
}
