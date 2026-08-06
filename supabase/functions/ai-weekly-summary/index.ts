// P5 weekly summary — separate, lower-stakes function per the build guide
// (patterns across a week of sessions, not a fresh in-the-moment reflection).
// Same key-security rule as ai-reflection: the Anthropic key lives only in
// this function's secrets.
//
// Judgment call beyond the literal build-guide instructions: the guide only
// says "same key-security rule applies" for this function and doesn't
// mention the two-step safety check, since it's framed as lower-stakes than
// the post-session reflection. But this function still reads a week of raw
// journal text, which can just as easily contain self-harm language as any
// single entry — so it reuses the same deterministic safety pass rather
// than skipping it. If that's not what was intended, it's a one-line
// removal, but skipping a safety check on real journal text felt like the
// wrong default to guess.
import { containsSelfHarmLanguage, NEUTRAL_RESOURCE_MESSAGE } from '../_shared/safetyCheck.ts';
import { generateText } from '../_shared/anthropic.ts';
import { getCallerClient, getServiceClient, jsonResponse } from '../_shared/supabaseClients.ts';

const SUMMARY_SYSTEM_PROMPT =
  'You are a calm, non-directive summary assistant inside ASCEND, a ' +
  'nervous-system regulation app. ASCEND is not therapy, not a medical ' +
  "device, and not a treatment. You'll be given a week's worth of session " +
  'and journal data. Write a short (3-5 sentence), calm, non-directive ' +
  'summary of patterns you notice — which cards were used, roughly how ' +
  'often, and any recurring mood themes from the journal. No advice, no ' +
  'diagnosis, no clinical language, no suggested actions.';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'missing_authorization' }, 401);
  }

  const caller = getCallerClient(authHeader);
  const {
    data: { user },
    error: authError,
  } = await caller.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const service = getServiceClient();

  const { data: profile } = await service
    .from('profiles')
    .select('ai_consent')
    .eq('id', user.id)
    .single();
  if (!profile?.ai_consent) {
    return jsonResponse({ error: 'ai_consent_required' }, 403);
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: sessions }, { data: journalEntries }] = await Promise.all([
    service
      .from('sessions')
      .select('card_id, completed, interrupted, started_at')
      .eq('user_id', user.id)
      .gte('started_at', weekAgo),
    service
      .from('journal_entries')
      .select('text, mood, created_at')
      .eq('user_id', user.id)
      .gte('created_at', weekAgo),
  ]);

  if (!sessions?.length && !journalEntries?.length) {
    return jsonResponse({ error: 'no_activity_this_week' }, 400);
  }

  const sessionLines = (sessions ?? []).map(
    (s) => `- card ${s.card_id}, ${s.completed ? 'completed' : s.interrupted ? 'interrupted' : 'ended'}`
  );
  const journalLines = (journalEntries ?? []).map(
    (j) => `- (mood ${j.mood ?? 'n/a'}/5) ${j.text}`
  );
  const combinedText = [
    `Sessions this week (${sessionLines.length}):`,
    ...sessionLines,
    `Journal entries this week (${journalLines.length}):`,
    ...journalLines,
  ].join('\n');

  const flagged = containsSelfHarmLanguage(combinedText);

  let content: string;
  if (flagged) {
    content = NEUTRAL_RESOURCE_MESSAGE;
  } else {
    try {
      content = await generateText({
        system: SUMMARY_SYSTEM_PROMPT,
        userContent: combinedText,
        maxTokens: 300,
      });
    } catch (err) {
      console.error('[ai-weekly-summary] generation failed:', err);
      return jsonResponse({ error: 'generation_failed' }, 502);
    }
  }

  const { data: insight, error: insertError } = await service
    .from('ai_insights')
    .insert({
      user_id: user.id,
      session_id: null,
      kind: 'weekly_summary',
      content,
      safety_flagged: flagged,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[ai-weekly-summary] insert failed:', insertError);
    return jsonResponse({ error: 'insert_failed' }, 500);
  }

  return jsonResponse({ insight });
});
