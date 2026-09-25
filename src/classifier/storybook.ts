import type { TestLayer } from "../types.js";

export type StorybookDepth = 1 | 2 | 3 | 4;

export interface StorybookAnalysis {
  isStorybook: boolean;
  playCount: number;
  assertionCount: number;
  hasUserEvent: boolean;
  hasMsw: boolean;
  depthLevel: StorybookDepth;
  depthDescription: string;
  layer: TestLayer;
  reasons: string[];
}

const PLAY_FUNCTION_REGEX = /\bplay\s*:\s*(?:async\s*)?\([^)]*\)\s*=>|\basync\s+play\s*\(/g;
const ASSERTION_REGEX = /\bexpect\s*\(/g;
const USER_EVENT_REGEX = /\buserEvent\.(?:click|type|hover|tab|clear|selectOptions|dblClick)\b/i;
const MSW_REGEX = /\b(?:parameters\s*:\s*\{[\s\S]*?msw|msw-storybook-addon)\b/i;

export function isStorybookFile(filePath: string): boolean {
  return /\.stories\.[a-zA-Z0-9]+$/i.test(filePath);
}

export function analyzeStorybook(filePath: string, content: string): StorybookAnalysis {
  if (!isStorybookFile(filePath)) {
    return {
      isStorybook: false,
      playCount: 0,
      assertionCount: 0,
      hasUserEvent: false,
      hasMsw: false,
      depthLevel: 1,
      depthDescription: "Not a storybook file",
      layer: "unit",
      reasons: [],
    };
  }

  const playMatches = content.match(PLAY_FUNCTION_REGEX);
  const playCount = playMatches ? playMatches.length : 0;

  const assertionMatches = content.match(ASSERTION_REGEX);
  const assertionCount = assertionMatches ? assertionMatches.length : 0;

  const hasUserEvent = USER_EVENT_REGEX.test(content);
  const hasMsw = MSW_REGEX.test(content);

  const reasons: string[] = [];

  // Depth 1: Visual Catalog only (No play function)
  if (playCount === 0) {
    reasons.push("Storybook visual catalog (no play function assertions)");
    return {
      isStorybook: true,
      playCount: 0,
      assertionCount: 0,
      hasUserEvent,
      hasMsw,
      depthLevel: 1,
      depthDescription: "Visual smoke (pure component rendering catalog)",
      layer: "static",
      reasons,
    };
  }

  // Depth 4: Mocked Service Integration (Play + MSW)
  if (hasMsw && assertionCount > 0) {
    reasons.push(
      `Storybook Level 4: MSW network-mocked integration (${playCount} play(), ${assertionCount} asserts)`,
    );
    return {
      isStorybook: true,
      playCount,
      assertionCount,
      hasUserEvent,
      hasMsw: true,
      depthLevel: 4,
      depthDescription: "Network-mocked service integration (MSW + play)",
      layer: "integration",
      reasons,
    };
  }

  // Depth 3: Full Component Integration (Play + Assertions)
  if (assertionCount > 0) {
    reasons.push(
      `Storybook Level 3: Full interaction test (${playCount} play(), ${assertionCount} asserts)`,
    );
    return {
      isStorybook: true,
      playCount,
      assertionCount,
      hasUserEvent,
      hasMsw: false,
      depthLevel: 3,
      depthDescription: "Full component interaction test (play + assertions)",
      layer: "integration",
      reasons,
    };
  }

  // Depth 2: Shallow Interaction (UserEvent without assertions)
  reasons.push(`Storybook Level 2: Shallow interaction without expect() (${playCount} play())`);
  return {
    isStorybook: true,
    playCount,
    assertionCount: 0,
    hasUserEvent,
    hasMsw: false,
    depthLevel: 2,
    depthDescription: "Interaction smoke (user events without explicit assertions)",
    layer: "integration",
    reasons,
  };
}
