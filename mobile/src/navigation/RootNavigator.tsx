import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DeckScreen from '../screens/DeckScreen';
import SessionScreen from '../screens/SessionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignInScreen from '../screens/SignInScreen';
import JournalScreen from '../screens/JournalScreen';
import InsightsScreen from '../screens/InsightsScreen';
import { TriggerSource } from '../types/session';

// Spec §3 IA: one main Home surface + full-screen modals for secondary
// features. Deck, Session, Settings, SignIn, Journal, Insights are wired up
// (P1/P2/P3/P4/P5); the Wearable modal lands in P6 and is stubbed as an
// alert on Home for now.

export type RootStackParamList = {
  Home: undefined;
  Deck: undefined;
  Session: { cardId: string; triggerSource: TriggerSource };
  Settings: undefined;
  SignIn: undefined;
  Journal: { cardId?: string; sessionId?: string } | undefined;
  Insights: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Module-level ref so a session can be started from outside the React tree —
// e.g. a future P6 BLE characteristic-notification handler — without needing
// navigation props threaded down to it. See ../session/startSession.ts.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1a1a24' }, headerTintColor: '#e6e6f0' }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Deck"
          component={DeckScreen}
          options={{ presentation: 'modal', title: 'Choose your anchor' }}
        />
        <Stack.Screen
          name="Session"
          component={SessionScreen}
          options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal', title: 'Settings' }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ presentation: 'modal', title: 'Sign in' }}
        />
        <Stack.Screen
          name="Journal"
          component={JournalScreen}
          options={{ presentation: 'modal', title: 'Journal' }}
        />
        <Stack.Screen
          name="Insights"
          component={InsightsScreen}
          options={{ presentation: 'modal', title: 'Insights' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
