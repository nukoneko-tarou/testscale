import type { ArchetypeType, ArchetypeVerdict } from "../types.js";

export const ARCHETYPES: Record<ArchetypeType, Omit<ArchetypeVerdict, "type">> = {
  trophy: {
    name: "The Testing Trophy",
    tagline: "Integration-centric pragmatic harmony",
    emoji: "🏆",
    asciiArt: `
        .---------------.
       /   ___________   \\
      |   /           \\   |      [E2E]
       \\  \\___________/  /
        '.             .'
       .-'             '-.
      /                   \\
     |                     |    [INTEGRATION]
     |                     |    (The Golden Center)
      \\                   /
       '-.             .-'
         |     ===     |        [UNIT]
         |    =====    |
       .-'             '-.
     /=====================\\    [STATIC]
    '-----------------------'
    `,
    philosophy: "Write tests. Not too many. Mostly integration. (Kent C. Dodds doctrine)",
    strengths: [
      "Highest return on investment (ROI) for developer effort",
      "High resilience against internal refactoring without breaking tests",
      "Directly safeguards real user flows without brittle mocks",
    ],
    cautions: [
      "Complex pure algorithms or edge cases still benefit from unit test isolation",
      "Watch out for slow integration setup bottlenecks",
    ],
    humor: "You buy confidence with precision and sleep soundly on release days.",
  },

  pyramid: {
    name: "The Classic Pyramid",
    tagline: "Foundational bedrock of unit purity",
    emoji: "🔺",
    asciiArt: `
               /\\               [E2E]
              /  \\
             /----\\
            /      \\            [INTEGRATION]
           /        \\
          /----------\\
         /            \\         [UNIT]
        /              \\        (Solid Granite Base)
       /                \\
      /------------------\\      [STATIC]
    `,
    philosophy:
      "Solid foundation first. Fast, deterministic, and isolated unit tests. (Mike Cohn / Martin Fowler)",
    strengths: [
      "Sub-second test suite execution speeds",
      "Near 100% coverage on branch permutations and domain algorithms",
      "Pins down regressions instantly to exact lines of code",
    ],
    cautions: [
      "Heavy mocking can verify the mocks rather than the system",
      "Individual parts may work impeccably while failing when connected",
    ],
    humor: "Your math is mathematically proven, but does clicking the button actually submit?",
  },

  diamond: {
    name: "The Integration Diamond",
    tagline: "Service boundary and contract fortress",
    emoji: "💎",
    asciiArt: `
               /\\               [E2E]
             .'  '.
           .'      '.
         .'          '.         [INTEGRATION]
        <              >        (Massive Middle Nexus)
         '.          .'
           '.      .'           [UNIT]
             '.  .'
               \\/               [STATIC]
    `,
    philosophy: "Contracts, APIs, and module boundaries are where value and defects meet.",
    strengths: [
      "Ideal for microservices, API servers, and backend gateways",
      "Verifies protocol boundaries and database transactions effectively",
      "Minimal mocking with maximum component confidence",
    ],
    cautions: [
      "Internal branching algorithms may lack fine-grained unit coverage",
      "UI/browser smoke paths might be thin",
    ],
    humor: "You live and die by contracts and network boundaries.",
  },

  "ice-cream-cone": {
    name: "The Ice Cream Cone",
    tagline: "Top-heavy browser marathon",
    emoji: "🍦",
    asciiArt: `
         .----------------.
        (   E2E & UI Heavy )     [E2E: Melting Top]
         '----------------'
           \\            /
            \\          /         [INTEGRATION]
             \\        /
              \\      /           [UNIT]
               \\    /
                \\  /
                 \\/              [STATIC: Needle Point]
    `,
    philosophy: "Trust only what the user can see through a real browser.",
    strengths: [
      "True end-to-end user journey validation",
      "Finds real browser and network integration quirks early",
    ],
    cautions: [
      "CI execution times can balloon to dozens of minutes",
      "Flakiness and timing race conditions require constant maintenance",
      "Slow feedback loop hurts development velocity",
    ],
    humor: "Your tests give you great confidence, right after you wait 25 minutes for CI.",
  },

  hourglass: {
    name: "The Hourglass",
    tagline: "Extremes aligned, middle omitted",
    emoji: "⌛",
    asciiArt: `
        |==================|    [E2E: Full Suite]
         \\                /
          \\              /
           \\            /
            >==========<        [INTEGRATION: Pinched Out!]
           /            \\
          /              \\
         /                \\     [UNIT: Full Suite]
        |==================|
    `,
    philosophy: "We test pure logic at the bottom and entire apps at the top.",
    strengths: ["Pure calculation logic is tested and final journeys are verified"],
    cautions: [
      'Missing the "sweet spot" where components collaborate',
      "Failures in E2E take long debugging sessions because integration tests were absent",
    ],
    humor: "The hardest middle path was systematically avoided.",
  },

  "monolith-spike": {
    name: "The Monolith Spike",
    tagline: "Hyper-specialized single-layer pillar",
    emoji: "🗡️",
    asciiArt: `
               ||
               ||               [Dominant Layer: 90%+]
               ||
               ||
               ||
              ====
    `,
    philosophy: "One layer to rule them all. Hyper-focused testing methodology.",
    strengths: ["Maximum focus and zero overhead in non-essential testing tiers"],
    cautions: ["Blind spots exist in every other layer of the software lifecycle"],
    humor: "A sharp spear that pierces deep, but guards only one angle.",
  },

  balanced: {
    name: "The Scales of Equanimity",
    tagline: "Symmetrical equilibrium across all strata",
    emoji: "⚖️",
    asciiArt: `
            .----^----.
           /     |     \\
          /|     |     |\\
         / |     |     | \\
        (==)     |     (==)
         ||      |      ||
                 |
             .---'---.
            /_________\\
    `,
    philosophy: "Deliberate, balanced distribution from static typing to full browser smoke.",
    strengths: [
      "Consistent defense-in-depth across the entire stack",
      "No obvious blind spot or single point of test failure",
    ],
    cautions: ["Ensure the team is not maintaining tests simply for the sake of balance"],
    humor: "The ancient scales nod in quiet mathematical approval.",
  },

  void: {
    name: "The Prayer-Driven Void",
    tagline: "Faith-based continuous deployment",
    emoji: "🛡️",
    asciiArt: `
          .-----------------.
         /                   \\
        |      (EMPTY)        |    "I don't always test,
        |    Zero Tests       |     but when I do,
         \\                   /      I test in production."
          '-----------------'
                  ||
                  ||
              ( Prayers )
    `,
    philosophy: "Production is the ultimate crucible. Move fast, fix forward.",
    strengths: [
      "Instantaneous local builds with 0 milliseconds of test overhead",
      "Infinite flexibility to rewrite code without updating assertions",
    ],
    cautions: [
      "High psychological tension when deploying on Friday evening",
      "Users double as your distributed QA department",
    ],
    humor: "May the runtime gods shine their benevolent light upon your edge cases.",
  },
};
