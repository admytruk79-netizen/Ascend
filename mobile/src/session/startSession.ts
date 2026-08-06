import { Alert } from 'react-native';
import { navigationRef } from '../navigation/RootNavigator';
import { getPrimaryAnchorId } from '../storage/cardState';
import { TriggerSource } from '../types/session';

// Single entry point for launching a session on the current Primary Anchor —
// spec §5: "manual double-tap and BLE trigger both launch the Primary Anchor
// by default." Manual (HomeScreen double-tap) calls this today; P6's BLE
// characteristic-notification handler should call
// `startPrimaryAnchorSession('wearable')` the same way, no other wiring
// needed on that end.
export async function startPrimaryAnchorSession(triggerSource: TriggerSource): Promise<void> {
  const cardId = await getPrimaryAnchorId();
  if (!cardId) {
    Alert.alert('No Primary Anchor selected', 'Choose a card in the Deck first.');
    return;
  }
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.navigate('Session', { cardId, triggerSource });
}
