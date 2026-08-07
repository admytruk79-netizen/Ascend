import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';

// Spec §10: subscriptions handled by RevenueCat (one API over both stores'
// billing), 7-day trial, restore-purchases required. Entitlement identifier
// must match whatever's configured in the RevenueCat dashboard — "premium"
// here is a guess at a reasonable name, not a confirmed one; rename this
// constant to match the real dashboard config once it exists.
export const PREMIUM_ENTITLEMENT_ID = 'premium';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export const isPurchasesConfigured = Boolean(
  Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY
);

let configured = false;

// Lazy, like ble/bleManager.ts and lib/supabase.ts — react-native-purchases
// is a native module (needs a custom EAS dev client, same as BLE) and this
// app has no RevenueCat API keys configured in this environment. Calling
// this is a no-op until both isPurchasesConfigured is true AND the app is
// actually running in a build with the native module present.
export function configurePurchasesIfPossible(): void {
  if (configured || !isPurchasesConfigured) return;
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
  try {
    Purchases.configure({ apiKey: apiKey as string });
    configured = true;
  } catch (err) {
    console.warn('[purchases] configure failed (likely running in Expo Go):', err);
  }
}

// Call after Supabase sign-in/sign-out so RevenueCat's customer identity
// tracks the same user as the rest of the app, rather than staying on an
// anonymous device-scoped id.
export async function syncPurchasesIdentity(supabaseUserId: string | null): Promise<void> {
  if (!configured) return;
  try {
    if (supabaseUserId) {
      await Purchases.logIn(supabaseUserId);
    } else {
      await Purchases.logOut();
    }
  } catch (err) {
    console.warn('[purchases] identity sync failed:', err);
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.warn('[purchases] getCustomerInfo failed:', err);
    return null;
  }
}

export async function hasPremiumEntitlement(): Promise<boolean> {
  const info = await getCustomerInfo();
  return Boolean(info?.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}
