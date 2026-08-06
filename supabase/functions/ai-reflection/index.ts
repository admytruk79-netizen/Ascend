// P5 post-session reflection. Two separate steps, not one clever prompt
// (build guide P5, explicit): a deterministic safety pass runs first; only
// if it doesn't flag anything does this call the LLM at all. The two steps
// never share a model call.
import { containsSelfHarmLanguage, NEUTRAL_RESOURCE_MESSAGE } from '../_shared/safetyCheck.ts';
import { generateText } from '../_shared/anthropic.ts';
import { getCallerClient, getServiceClient, jsonResponse } from '../_shared/supabaseClients.ts';

const REFLECTION_SYSTEM_PROMPT =
  'You are a calm, non-directive reflection assistant inside ASCEND, a ' +
  'nervous-system regulation app. ASCEND is not therapy, not a medical ' +
  'device, and not a treatment. You will be given a short account of a ' +
  "grounding session and, optionally, a recent journal entry. Write 1-3 " +
  'short, calm sentences that reflect back what was described — no advice, ' +
  'no diagnosis, no clinical or therapeutic language, no questions, no ' +
  'suggested actions. Just reflect.';

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

  // Spec §8/§11: explicit opt-in required before ANY AI processing. Checked
  // server-side, not just gated in the app UI — the app should never even
  // let this be called without consent, but this is the actual enforcement.
  const { data: profile } = await service
    .from('profiles')
    .select('ai_consent')
    .eq('id', user.id)
    .single();
  if (!profile?.ai_consent) {
    return jsonResponse({ error: 'ai_consent_required' }, 403);
  }

  let sessionId: string | null = null;
  try {
    const body = await req.json();
    sessionId = typeof body.sessionId === 'string' ? body.sessionId : null;
  } catch {
    return jsonResponse({ error: 'invalid_json_body' }, 400);
  }

  // Only the caller's own data — session_id is trusted from the request,
  // but the query is still scoped to user_id so a session that isn't
  // theirs simply returns nothing rather than leaking another user's data.
  let sessionContext = '';
  if (sessionId) {
    const { data: session } = await service
      .from('sessions')
      .select('card_id, completed, interrupted, actual_seconds, extend_count')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single();
    if (session) {
      sessionContext = `Session: card ${session.card_id}, ${
        session.completed ? 'completed' : session.interrupted ? 'interrupted' : 'ended'
      }, ran ${session.actual_seconds}s with ${session.extend_count} extension(s).`;
    }
  }

  const { data: recentJournal } = await service
    .from('journal_entries')
    .select('text, mood')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const journalContext = recentJournal?.[0]
    ? `Most recent journal entry (mood ${recentJournal[0].mood ?? 'not given'}/5): ${recentJournal[0].text}`
    : '';

  const combinedText = [sessionContext, journalContext].filter(Boolean).join('\n');

  if (!combinedText) {
    return jsonResponse({ error: 'no_content_to_reflect_on' }, 400);
  }

  // STEP 1 — safety pass, before any LLM call.
  const flagged = containsSelfHarmLanguage(combinedText);

  let content: string;
  if (flagged) {
    // STEP 2a — flagged: skip reflection generation entirely.
    content = NEUTRAL_RESOURCE_MESSAGE;
  } else {
    // STEP 2b — not flagged: generate the actual reflection.
    try {
      content = await generateText({
        system: REFLECTION_SYSTEM_PROMPT,
        userContent: combinedText,
        maxTokens: 200,
      });
    } catch (err) {
      console.error('[ai-reflection] generation failed:', err);
      return jsonResponse({ error: 'generation_failed' }, 502);
    }
  }

  const { data: insight, error: insertError } = await service
    .from('ai_insights')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      kind: 'post_session',
      content,
      safety_flagged: flagged,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[ai-reflection] insert failed:', insertError);
    return jsonResponse({ error: 'insert_failed' }, 500);
  }

  return jsonResponse({ insight });
});
