import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Supabase's magic-link email points at `ascend://auth/callback#access_token=
// ...&refresh_token=...` (implicit-grant style — Supabase's default for
// email OTP links). detectSessionInUrl is off in lib/supabase.ts because RN
// has no URL bar for the SDK to read from automatically, so this parses the
// redirect URL by hand and hands the tokens to supabase.auth.setSession.
//
// UNVERIFIED: this needs a real Supabase project (to actually send a magic
// link email), the redirect URL allowlisted in that project's Auth settings,
// and a device/simulator to open the link on — none of which exist in this
// sandboxed environment. The token-parsing approach follows Supabase's
// documented RN deep-link pattern, but treat this as unverified until
// someone runs it against a live project.
export async function handleAuthDeepLink(url: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  if (!url.includes('access_token')) return;

  const fragment = url.split('#')[1] ?? url.split('?')[1] ?? '';
  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) return;

  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}
