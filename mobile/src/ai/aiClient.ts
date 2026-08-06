import { supabase } from '../lib/supabase';

export interface AIInsight {
  insight_id: string;
  user_id: string;
  session_id: string | null;
  kind: 'post_session' | 'weekly_summary';
  content: string;
  safety_flagged: boolean;
  feedback: 'up' | 'down' | null;
  created_at: string;
}

// Both calls hit Edge Functions, never Anthropic directly — see
// supabase/functions/ai-reflection and ai-weekly-summary. supabase-js
// forwards the current session's access token automatically, which is how
// the function identifies the caller server-side.

export async function requestReflection(sessionId: string): Promise<AIInsight> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.functions.invoke('ai-reflection', {
    body: { sessionId },
  });
  if (error) throw error;
  return data.insight as AIInsight;
}

export async function requestWeeklySummary(): Promise<AIInsight> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.functions.invoke('ai-weekly-summary', {
    body: {},
  });
  if (error) throw error;
  return data.insight as AIInsight;
}

export async function getInsights(): Promise<AIInsight[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as AIInsight[];
}

export async function setInsightFeedback(
  insightId: string,
  feedback: 'up' | 'down'
): Promise<void> {
  if (!supabase) return;
  await supabase.from('ai_insights').update({ feedback }).eq('insight_id', insightId);
}
