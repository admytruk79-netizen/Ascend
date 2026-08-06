import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DeckScreen from '../screens/DeckScreen';

// Spec §3 IA: one main Home surface + full-screen modals for secondary
// features. Deck is wired up (P1); Journal/Insights/Wearable modals land in
// their own phases (P4/P5/P6) and are stubbed as alerts on Home for now.

export type RootStackParamList = {
  Home: undefined;
  Deck: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1a1a24' }, headerTintColor: '#e6e6f0' }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Deck"
          component={DeckScreen}
          options={{ presentation: 'modal', title: 'Choose your anchor' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
