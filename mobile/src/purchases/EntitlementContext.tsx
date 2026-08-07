import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  configurePurchasesIfPossible,
  hasPremiumEntitlement,
  isPurchasesConfigured,
  syncPurchasesIdentity,
} from './purchases';

interface EntitlementContextValue {
  hasPremium: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const EntitlementContext = createContext<EntitlementContextValue>({
  hasPremium: false,
  isLoading: false,
  refresh: async () => {},
});

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [hasPremium, setHasPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(isPurchasesConfigured);

  const refresh = useCallback(async () => {
    if (!isPurchasesConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const premium = await hasPremiumEntitlement();
    setHasPremium(premium);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    configurePurchasesIfPossible();
  }, []);

  // Keep RevenueCat's customer identity in step with Supabase auth, then
  // refresh the entitlement for whichever identity is now active.
  useEffect(() => {
    syncPurchasesIdentity(session?.user.id ?? null).then(refresh);
  }, [session?.user.id, refresh]);

  return (
    <EntitlementContext.Provider value={{ hasPremium, isLoading, refresh }}>
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement(): EntitlementContextValue {
  return useContext(EntitlementContext);
}
