import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/auth/AuthContext';
import { handleAuthDeepLink } from './src/auth/handleAuthDeepLink';
import { SyncManager } from './src/sync/SyncManager';
import { EntitlementProvider } from './src/purchases/EntitlementContext';

export default function App() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthDeepLink(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthDeepLink(url);
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <EntitlementProvider>
        <SyncManager />
        <RootNavigator />
        <StatusBar style="light" />
      </EntitlementProvider>
    </AuthProvider>
  );
}
