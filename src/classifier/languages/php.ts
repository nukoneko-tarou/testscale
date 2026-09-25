import type { TestLayer } from "../../types.js";

// 1. Path-based conventions
const PHP_E2E_PATH_REGEX = /(?:^|\/)(?:tests?|specs?)\/(?:Browser|acceptance|e2e|system)\//i;

const PHP_INTEGRATION_PATH_REGEX =
  /(?:^|\/)(?:tests?\/(?:Feature|functional|integration|api)\/|tests?\/TestCase\/(?:Controller|Integration)\/)/i;

const PHP_UNIT_PATH_REGEX =
  /(?:^|\/)(?:tests?\/(?:Unit|unit)\/|tests?\/TestCase\/(?:Model|Command|Entity|Table)\/)/i;

// 2. Content indicators
const PHP_E2E_INDICATORS = [
  {
    pattern:
      /\b(?:Laravel\\Dusk\\Browser|use\s+Laravel\\Dusk\b|\$browser->visit\b|\$browser->assertSee\b)/i,
    reason: "Laravel Dusk browser automation",
  },
  {
    pattern: /\b(?:Symfony\\Component\\Panther\b|PantherTestCase\b)/i,
    reason: "Symfony Panther browser testing",
  },
  {
    pattern: /\bFacebook\\WebDriver\b/i,
    reason: "Facebook WebDriver browser automation",
  },
  {
    pattern: /\bCodeception\\Test\\Acceptance\b/i,
    reason: "Codeception acceptance testing",
  },
];

const PHP_INTEGRATION_INDICATORS = [
  {
    pattern: /\$this->(?:get|post|put|patch|delete|json|call)\s*\(\s*['"]/i,
    reason: "Laravel HTTP API / Controller test",
  },
  {
    pattern:
      /\$this->(?:assertDatabaseHas|assertDatabaseMissing|assertDatabaseCount|assertAuthenticated|assertSessionHas)\s*\(/i,
    reason: "Laravel Database/Session integration assertion",
  },
  {
    pattern: /\bIntegrationTestTrait\b/i,
    reason: "CakePHP IntegrationTestTrait HTTP integration",
  },
  {
    pattern: /\b(?:WebTestCase|KernelTestCase)\b/i,
    reason: "Symfony Web/Kernel integration test case",
  },
  {
    pattern: /\$this->actingAs\s*\(/i,
    reason: "Laravel authentication session integration",
  },
];

const PHP_UNIT_INDICATORS = [
  {
    pattern: /\$this->(?:createMock|getMockBuilder|createPartialMock)\s*\(/i,
    reason: "PHPUnit test double mocking",
  },
  {
    pattern: /\bMockery::(?:mock|spy)\s*\(/i,
    reason: "Mockery test double isolation",
  },
];

export const phpClassifier = {
  language: "PHP",
  supports(filePath: string): boolean {
    return /\.php$/i.test(filePath);
  },
  classify(filePath: string, content: string): { layer: TestLayer; reasons: string[] } | null {
    const reasons: string[] = [];
    const normalizedPath = filePath.replace(/\\/g, "/");

    // 1. Path conventions (Laravel Dusk, Feature, CakePHP TestCase, etc.)
    if (PHP_E2E_PATH_REGEX.test(normalizedPath)) {
      reasons.push("PHP browser/acceptance test path convention");
      return { layer: "e2e", reasons };
    }

    if (PHP_INTEGRATION_PATH_REGEX.test(normalizedPath)) {
      reasons.push("PHP feature/controller/integration test path convention");
      return { layer: "integration", reasons };
    }

    if (PHP_UNIT_PATH_REGEX.test(normalizedPath)) {
      reasons.push("PHP unit/model test path convention");
      return { layer: "unit", reasons };
    }

    // 2. Content indicators
    for (const ind of PHP_E2E_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "e2e", reasons };
      }
    }

    for (const ind of PHP_INTEGRATION_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "integration", reasons };
      }
    }

    for (const ind of PHP_UNIT_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "unit", reasons };
      }
    }

    return null;
  },
};
