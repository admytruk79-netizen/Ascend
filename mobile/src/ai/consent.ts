import { supabase } from '../lib/supabase';

// Spec §8/§11: explicit opt-in required before any AI processing, with an
// ability to opt out. This is client-side convenience only — the actual
// enforcement is server-side in the Edge Functions (see
// supabase/functions/ai-reflection), which check profiles.ai_consent
// themselves rather than trusting the app to have gated the button.

export async function getAiConsent(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from('profiles')
    .select('ai_consent')
    .eq('id', userId)
    .single();
  return data?.ai_consent ?? false;
}

export async function setAiConsent(userId: string, consent: boolean): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('profiles')
    .update({ ai_consent: consent, ai_consent_updated_at: new Date().toISOString() })
    .eq('id', userId);
}
