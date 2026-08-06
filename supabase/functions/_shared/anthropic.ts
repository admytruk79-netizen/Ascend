// Thin wrapper around the Anthropic Messages API. The API key only ever
// lives in this Edge Function's environment (`supabase secrets set
// ANTHROPIC_API_KEY=...`) — it is never sent to or bundled in the app.
//
// Model id is env-overridable (ANTHROPIC_MODEL) so a model deprecation
// doesn't require a code change/redeploy, just a secret update.
const DEFAULT_MODEL = 'claude-sonnet-5';

export async function generateText(params: {
  system: string;
  userContent: string;
  maxTokens: number;
}): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in this function\'s secrets');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('ANTHROPIC_MODEL') ?? DEFAULT_MODEL,
      max_tokens: params.maxTokens,
      system: params.system,
      messages: [{ role: 'user', content: params.userContent }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new Error('Unexpected Anthropic API response shape');
  }
  return text;
}
