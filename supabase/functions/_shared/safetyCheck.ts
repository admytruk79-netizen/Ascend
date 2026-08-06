// Step 1 of the two-step safety check (build guide P5): a lightweight,
// deterministic pattern/keyword pass, run BEFORE any reflection is
// generated. This intentionally does NOT call the LLM — a single model
// call asked to both detect risk and write a nice reflection is exactly
// the design the build guide says not to build.
//
// IMPORTANT: this keyword list is a first pass written without clinical or
// crisis-response review. It is deliberately over-inclusive (a false
// positive just means someone gets a resource message instead of a
// reflection — mildly annoying; a false negative means someone in crisis
// gets a chatty AI response instead — unacceptable). Do not treat this list
// as adequate for production without a real safety/clinical review pass.
const SELF_HARM_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /kill(ing)?\s+myself/i,
  /end(ing)?\s+my\s+life/i,
  /\bself[\s-]?harm/i,
  /\bcutting\s+myself/i,
  /hurt(ing)?\s+myself/i,
  /want(ed)?\s+to\s+die/i,
  /no\s+reason\s+to\s+live/i,
  /better\s+off\s+dead/i,
  /don'?t\s+want\s+to\s+(be\s+alive|live)/i,
  /can'?t\s+go\s+on/i,
];

export function containsSelfHarmLanguage(text: string): boolean {
  return SELF_HARM_PATTERNS.some((pattern) => pattern.test(text));
}

// Deliberately generic and non-clinical (spec §1: ASCEND is not therapy,
// not a medical device, not a crisis counseling service) — points at a real
// resource instead of attempting to counsel.
export const NEUTRAL_RESOURCE_MESSAGE =
  "It sounds like things feel really heavy right now. ASCEND isn't able to " +
  'help with this, and you don\'t have to carry it alone. In the US, you can ' +
  'call or text 988 (Suicide & Crisis Lifeline) any time. Outside the US, ' +
  'please reach out to a local crisis line or someone you trust.';
