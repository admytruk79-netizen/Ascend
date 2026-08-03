/* Invisible Strike — sourced practice content
   Source: manuscript Ch. 3, Ch. 12, Ch. 13, Appendix A.
   Every string here is quoted or paraphrased directly from
   invisible-strike-practice-content-v2.md — no invented content. */

const CONTENT = {

  /* ---------------- Quick Shield ---------------- */
  threeBreathReset: {
    id: "three-breath-reset",
    name: "The Three-Breath Reset",
    tagline: "The book's most-used tool. Under 15 seconds. Eyes open.",
    steps: [
      {
        breath: 1,
        cue: "Inhale down past the chest into the belly.",
        detail: "Re-engage the manipura (will) before it collapses under pressure."
      },
      {
        breath: 2,
        cue: "Exhale. Drop the shoulders, unclench the jaw.",
        detail: "Most people under attack hold tension in exactly these two spots without noticing. Bring attention to the soles of your feet."
      },
      {
        breath: 3,
        cue: "Simply notice which center feels most activated right now.",
        detail: "Without trying to change anything yet."
      }
    ],
    seconds: 15
  },

  /* ---------------- Daily Practice ---------------- */
  greenDome: {
    id: "green-dome",
    name: "The Green Dome",
    tier: "free",
    why: "Green is the color of the heart center and balanced growth — not the active push of red or the passive pull of blue. A stable middle tone that neither invites nor repels, simply holds.",
    quick: {
      label: "Quick version",
      seconds: 4,
      steps: [
        "One full, slow breath. On the exhale, call up the dome complete around you — closed fully beneath you, a whole sphere."
      ]
    },
    full: {
      label: "Full version",
      seconds: 30,
      steps: [
        { phase: "Settle", detail: "Sit or stand comfortably, settle the breath." },
        { phase: "Rise (inhale)", detail: "Visualize a dome of green light extending from a point below your feet, up and over your head." },
        { phase: "Close (exhale)", detail: "Close the dome fully beneath you — a complete sphere, not a half-shell. An open-bottomed dome leaves the lower centers exposed." }
      ]
    }
  },

  grounding: {
    id: "grounding",
    name: "Grounding",
    tier: "paid",
    purpose: "Resolves chronic, free-floating depletion that isn't from any single dramatic attack — much of it comes from a field that never discharges ordinary daily friction. Best done before any conversation expected to be demanding.",
    steps: [
      { detail: "Feel the actual physical contact between your feet and the ground.", seconds: 30 },
      { detail: "If visualization capacity allows: imagine a cord of energy running from the base of the spine, down through the floor, into the earth.", seconds: 20 }
    ]
  },

  dailyFieldCheck: {
    id: "daily-field-check",
    name: "The Daily Field Check",
    tier: "paid",
    purpose: "Purely diagnostic, not fixing. Builds the same recognition reflex as Ch. 3, applied to baseline state. A weak center in the morning tends to predict which kind of raid you're vulnerable to that day.",
    centers: [
      { id: "svadhisthana", label: "Sacral", note: "Svadhisthana" },
      { id: "manipura", label: "Solar Plexus", note: "Manipura" },
      { id: "anahata", label: "Heart", note: "Anahata" },
      { id: "vishuddha", label: "Throat", note: "Vishuddha" },
      { id: "ajna", label: "Brow", note: "Ajna" }
    ],
    states: ["Open", "Guarded", "Tight", "Depleted"]
  },

  eveningClearing: {
    id: "evening-clearing",
    name: "Evening Clearing",
    tier: "paid",
    purpose: "Aftercare, not amortization — clears residue that even a successfully amortized attack can leave behind if never deliberately released. Best used after any day involving a real or suspected raid.",
    steps: [
      "Sit comfortably.",
      "Place a hand over whichever center felt most affected today.",
      "Breathe slowly; on each exhale, visualize the charge draining downward and out through the grounding cord."
    ]
  },

  /* ---------------- Situational Check-In: The Four Checks ---------------- */
  fourChecks: [
    {
      n: 1,
      title: "Body before mind",
      prompt: "Bring the exchange to mind. Before anything else — what did your body do? The mind supplies a cover story (\"that was a fair point,\" \"I'm overreacting\"). The body doesn't lie.",
      options: ["Stomach tightened", "Jaw clenched", "Chest caved", "Breath went shallow", "Nothing noticeable"]
    },
    {
      n: 2,
      title: "The obligation question",
      prompt: "Did you suddenly feel you owed this person something — an explanation, an apology, deference — with no traceable, concrete reason?",
      options: ["Yes, out of nowhere", "Yes, but I can name why", "No"]
    },
    {
      n: 3,
      title: "Notice the role being offered",
      prompt: "Every raid comes with an implicit casting call. Silently name it: \"this person is trying to cast me as ___.\"",
      options: ["Victim", "Student", "Fool", "Seductress / seducer", "Threat", "Disappointment", "None of these"]
    },
    {
      n: 4,
      title: "Pace vs. clarity",
      prompt: "Was there a flood of fast, complex language outrunning your ability to evaluate it? Had you stopped following the logic and started just nodding?",
      options: ["Yes — I was just nodding along", "It was fast but I followed", "No — pace was normal"]
    }
  ],
  fourChecksNote: "Recognition often only happens in hindsight at first — replaying a conversation hours later. That's normal, not failure. The gap between event and recognition tends to close over a few months of consistent practice, not years.",

  /* ---------------- Amortization Drill Decks ---------------- */
  amortizationDecks: [
    {
      center: "ajna",
      label: "Ajna — Brow",
      subtitle: "Belief / frame attacks",
      technique: "Mediation",
      principle: "Detach the claim from reality, reattach it to the person holding it.",
      cards: [
        {
          front: "“A human being is a social creature!”",
          back: "“You genuinely hold the position that human beings are social creatures?”",
          technique: "Mediation",
          note: "Can be layered: “There's a certain number of people who hold this view, and from what I can see, you're one of them.” Add a reflective question to intensify: “How long have you held this position?”"
        }
      ]
    },
    {
      center: "vishuddha",
      label: "Vishuddha — Throat",
      subtitle: "Word / information floods",
      technique: "Redirect & specify",
      principle: "Vishuddha attacks tend to weaken the heart and sacral centers most.",
      cards: [
        {
          front: "A flood of fast, dense, jargon-heavy talk you can't track.",
          back: "Redirect attention to something pleasurable — visibly savor a sip of coffee rather than tracking content.",
          technique: "Redirect attention",
          note: "Humor, mild crudeness, ordinary clowning are reliably effective too."
        },
        {
          front: "“...congenial...” (vague, sweeping term dropped into the flood)",
          back: "“What exactly did you mean by 'congenial'?”",
          technique: "Ajna counter-question",
          note: "Engaging the brow drains the throat's charge."
        },
        {
          front: "“All men are scum.”",
          back: "“Who specifically are you talking about?”",
          technique: "Force the particular",
          note: "Forces the generalization to collapse into a defensible particular or evaporate."
        }
      ]
    },
    {
      center: "anahata",
      label: "Anahata — Heart",
      subtitle: "Compliment / pity attacks",
      technique: "Separate gratitude from demand",
      principle: "A sincere compliment causing disproportionate discomfort, or induced pity, is the signature.",
      cards: [
        {
          front: "A compliment or plea that leaves you with guilt or pity at the chest, with no clean account of wrongdoing.",
          back: "Separate the real gratitude or genuine feeling from the demand riding on top of it — name the demand to yourself without rejecting the sincere part.",
          technique: "Separate gratitude from demand",
          note: "The felt signal is guilt/pity with no clean account of wrongdoing — that mismatch is the tell."
        }
      ]
    },
    {
      center: "manipura",
      label: "Manipura — Solar Plexus",
      subtitle: "Insult / threat / command attacks",
      technique: "Warm agreement, counter-question, or cheerful pre-emption",
      principle: "The felt signal is the “soft belly” — will switched off, can't leave a conversation you want to leave.",
      cards: [
        {
          front: "“You're an idiot!”",
          back: "“Yes, I'm an idiot!” — delivered with real, unguarded warmth.",
          technique: "Warm sincere agreement",
          note: "Two failure modes: this is not an admission of guilt, it's equanimity — and it must land genuinely warm, not through gritted teeth, or it becomes a counterattack. Milder variant: “Well, do you know who I am?” Fuller variant: “Yes, I'm an idiot, and also a scoundrel, a fraud, and frankly a dishonest person — and I can prove every word of it,” held with sincere warmth."
        },
        {
          front: "“You're a jerk.”",
          back: "“Tell me why you think that, specifically?”",
          technique: "Ajna counter-question",
          note: "Neutralizes the attack and opens space to check if there's a legitimate grievance underneath."
        },
        {
          front: "“You're a jerk.” (from a cross-gender attacker)",
          back: "“You're so attractive when you're angry.”",
          technique: "Redirect through svadhisthana",
          note: "Or sustained mild crudeness: “What languages do you speak fluently?” / “English, German, and the language of love.”"
        },
        {
          front: "“I'd like to share some criticism with you—”",
          back: "“Go right ahead!”",
          technique: "Cheerful pre-emption",
          note: "Delivered briskly with genuine, visible willingness — invite the very thing they were threatening."
        }
      ]
    },
    {
      center: "svadhisthana",
      label: "Svadhisthana — Sacral",
      subtitle: "Sexual charge / crude gesture attacks",
      technique: "Name the dynamic lightly",
      principle: "The felt signal is hard-to-name exposure — not quite fear, not quite anger.",
      cards: [
        {
          front: "Unwanted sexual charge, a crude joke, or an inviting gesture.",
          back: "Name the dynamic lightly rather than freezing or absorbing it.",
          technique: "Name the dynamic lightly",
          note: "The goal is not to escalate, but to refuse to let the exposure pass as if unnoticed."
        }
      ]
    }
  ],

  /* ---------------- Astral Aikido (nonverbal amortization) ---------------- */
  astralAikido: {
    intro: "Common nonverbal raids: the overly familiar shoulder clap, unsolicited clothing-straightening, expansive gesturing inside your personal space, closing physical distance uninvited.",
    closingNote: "A successful amortization ends the specific attack, but the same aggressor may try again later with a different method. Settled, continuously available inner readiness discourages attempts over time — the same way hiding, avoiding, or carrying resentment tends to attract more of them.",
    techniques: [
      {
        id: "matched-countergesture",
        name: "Matched Countergesture",
        principle: "Meet the gesture with a synchronized countergesture at the same height rather than retreating. Must be genuinely unexpected, running contrary to what the aggressor braced for.",
        examples: [
          { raid: "Shoulder clap", response: "Full embrace, pinning the arms." },
          { raid: "Collar-straightening", response: "Reach to adjust one of their buttons in turn." }
        ],
        frames: [
          { label: "Approach", desc: "Aggressor closes distance, hand rising toward your shoulder." },
          { label: "Contact", desc: "Their hand lands on your shoulder — the raid registers." },
          { label: "Release", desc: "You turn the contact into a full embrace or matched gesture; their stream visibly stalls." }
        ]
      },
      {
        id: "broken-approach",
        name: "The Broken Approach",
        principle: "When someone is trying to hold you in their field, slowly enter their personal space at heart or sacral height, then abruptly withdraw.",
        examples: [
          { raid: "Someone leaning in to hold you in their field", response: "Slow entry into their space, then sudden withdrawal." }
        ],
        frames: [
          { label: "Approach", desc: "You slowly close distance into their heart/sacral-height space." },
          { label: "Contact", desc: "Held for a beat — full presence, no retreat." },
          { label: "Release", desc: "Abrupt withdrawal. The held field breaks; their attempt loses its anchor." }
        ]
      }
    ]
  },

  /* ---------------- Quick Reference Cheat Sheet (Appendix A) ---------------- */
  cheatSheet: [
    {
      center: "Ajna (brow)",
      attack: "Categorical claim as fact; induced reflection on a tender subject",
      felt: "Pull to accept the frame or seem to be “arguing with the obvious”",
      amortization: "Mediation — “You genuinely believe that...?”"
    },
    {
      center: "Vishuddha (throat)",
      attack: "Jargon, speed, density, presupposition, double binds",
      felt: "You've stopped following the logic, started nodding",
      amortization: "Redirect attention; humor; ask for specifics"
    },
    {
      center: "Anahata (heart)",
      attack: "Sincere compliment causing disproportionate discomfort; induced pity",
      felt: "Guilt/pity at the chest with no clean account of wrongdoing",
      amortization: "Separate real gratitude from the demand riding on it"
    },
    {
      center: "Manipura (solar plexus)",
      attack: "Insult, threat, command; can't leave a conversation you want to leave",
      felt: "The “soft belly” — will switched off",
      amortization: "Warm sincere agreement; specific counter-question; cheerful pre-emption"
    },
    {
      center: "Svadhisthana (sacral)",
      attack: "Unwanted sexual charge, crude jokes, inviting gestures",
      felt: "Hard-to-name exposure — not quite fear, not quite anger",
      amortization: "Name the dynamic lightly rather than freezing/absorbing"
    },
    {
      center: "Egregore-backed",
      attack: "Appeals to rank, lineage, tradition, sanctioned authority",
      felt: "Dread/compliance before evaluating actual content",
      amortization: "Separate the institution's weight from the individual claim"
    }
  ]
};

if (typeof module !== "undefined") { module.exports = CONTENT; }
