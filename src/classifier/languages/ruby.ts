import type { TestLayer } from "../../types.js";

const RUBY_E2E_PATH_REGEX = /(?:^|\/)(?:spec|test)\/(?:system|features)\//i;
const RUBY_INTEGRATION_PATH_REGEX =
  /(?:^|\/)(?:spec|test)\/(?:requests|controllers|integration|api)\//i;
const RUBY_UNIT_PATH_REGEX =
  /(?:^|\/)(?:spec|test)\/(?:models|services|lib|helpers|mailers|workers)\//i;

const RUBY_E2E_INDICATORS = [
  {
    pattern: /\bdriven_by\s*\(:?(?:selenium|cuprite|playwright)\b/i,
    reason: "RSpec/Minitest browser driver setup",
  },
  {
    pattern: /\bvisit\s+[a-zA-Z0-9_]+_path\b|\bclick_on\b|\bfill_in\b/i,
    reason: "Capybara browser interaction",
  },
];

const RUBY_INTEGRATION_INDICATORS = [
  {
    pattern: /\b(?:get|post|put|patch|delete)\s+['"][^'"]+['"]\s*,\s*(?:headers|params):/i,
    reason: "Rails request/integration API spec",
  },
  {
    pattern: /\b(?:VCR\.use_cassette|WebMock\.stub_request)\b/i,
    reason: "VCR / WebMock HTTP integration",
  },
  { pattern: /\brack[/-]test\b/i, reason: "Rack::Test API integration" },
];

const RUBY_UNIT_INDICATORS = [
  {
    pattern: /\b(?:allow\b[\s\S]*?\.to\s+receive|instance_double\s*\(|class_double\s*\()/i,
    reason: "RSpec test double mocking",
  },
];

export const rubyClassifier = {
  language: "Ruby",
  supports(filePath: string): boolean {
    return /\.rb$/i.test(filePath);
  },
  classify(filePath: string, content: string): { layer: TestLayer; reasons: string[] } | null {
    const reasons: string[] = [];
    const normalizedPath = filePath.replace(/\\/g, "/");

    // 1. Ruby path convention (system specs vs request specs vs model specs)
    if (RUBY_E2E_PATH_REGEX.test(normalizedPath)) {
      reasons.push("Ruby system/feature spec convention");
      return { layer: "e2e", reasons };
    }

    if (RUBY_INTEGRATION_PATH_REGEX.test(normalizedPath)) {
      reasons.push("Ruby request/controller/api spec convention");
      return { layer: "integration", reasons };
    }

    if (RUBY_UNIT_PATH_REGEX.test(normalizedPath)) {
      reasons.push("Ruby model/service unit spec convention");
      return { layer: "unit", reasons };
    }

    // 2. Content indicators
    for (const ind of RUBY_E2E_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "e2e", reasons };
      }
    }

    for (const ind of RUBY_INTEGRATION_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "integration", reasons };
      }
    }

    for (const ind of RUBY_UNIT_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "unit", reasons };
      }
    }

    return null;
  },
};
