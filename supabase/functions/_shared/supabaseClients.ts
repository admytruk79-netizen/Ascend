import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Two clients, deliberately kept separate:
//   - "caller" client: scoped to the request's own JWT, used only to verify
//     who's calling (auth.getUser()). Never trust a user_id passed in the
//     request body — always resolve identity from the verified token.
//   - "service" client: uses the service-role key, bypasses RLS. Needed
//     because ai_insights has no client-insert policy (spec §8: clients
//     never write ai_insights directly) — only this key can insert there.
export function getCallerClient(authHeader: string) {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
}

export function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
