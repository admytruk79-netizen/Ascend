import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DeckScreen from '../screens/DeckScreen';
import SessionScreen from '../screens/SessionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignInScreen from '../screens/SignInScreen';
import JournalScreen from '../screens/JournalScreen';
import InsightsScreen from '../screens/InsightsScreen';
import WearableScreen from '../screens/WearableScreen';
import PaywallScreen from '../screens/PaywallScreen';
import { TriggerSource } from '../types/session';

// Spec §3 IA: one main Home surface + full-screen modals for secondary
// features. All screens P1-P7 call for are wired up now.

export type RootStackParamList = {
  Home: undefined;
  Deck: undefined;
  Session: { cardId: string; triggerSource: TriggerSource };
  Settings: undefined;
  SignIn: undefined;
  Journal: { cardId?: string; sessionId?: string } | undefined;
  Insights: undefined;
  Wearable: undefined;
  Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const withCloseButton = ({ navigation }: { navigation: { goBack: () => void } }) => ({
  headerLeft: () => <HeaderCloseButton navigation={navigation} />,
});

// Native-stack's default modal back arrow isn't reliably visible on Android
// in practice — render an explicit, always-tappable close button instead of
// depending on it. Applied to every modal screen below via screenOptions'
// headerLeft, not per-screen, so nothing can miss it by omission.
function HeaderCloseButton({ navigation }: { navigation: { goBack: () => void } }) {
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  );
}

// Module-level ref so a session can be started from outside the React tree
// — e.g. a real BLE characteristic-notification handler, once one exists,
// see the TODO in WearableScreen.tsx — without needing navigation props
// threaded down to it. See ../session/startSession.ts.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1a1a24' }, headerTintColor: '#e6e6f0' }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Deck"
          component={DeckScreen}
          options={(props) => ({ presentation: 'modal', title: 'Choose your anchor', ...withCloseButton(props) })}
        />
        <Stack.Screen
          name="Session"
          component={SessionScreen}
          options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={(props) => ({ presentation: 'modal', title: 'Settings', ...withCloseButton(props) })}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={(props) => ({ presentation: 'modal', title: 'Sign in', ...withCloseButton(props) })}
        />
        <Stack.Screen
          name="Journal"
          component={JournalScreen}
          options={(props) => ({ presentation: 'modal', title: 'Journal', ...withCloseButton(props) })}
        />
        <Stack.Screen
          name="Insights"
          component={InsightsScreen}
          options={(props) => ({ presentation: 'modal', title: 'Insights', ...withCloseButton(props) })}
        />
        <Stack.Screen
          name="Wearable"
          component={WearableScreen}
          options={(props) => ({ presentation: 'modal', title: 'Wearable', ...withCloseButton(props) })}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={(props) => ({ presentation: 'modal', title: 'Upgrade', ...withCloseButton(props) })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  closeButtonText: {
    color: '#e6e6f0',
    fontSize: 16,
    fontWeight: '600',
  },
});
