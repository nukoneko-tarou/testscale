import { describe, expect, it } from "@rstest/core";
import { calculateLanguageProfiles, evaluateScale } from "../src/judge/weigher.js";
import type { TestFileRecord } from "../src/types.js";

describe("Polyglot Monorepo & Composite Suite Profiling", () => {
  it("correctly aggregates multiple languages into languageProfiles", () => {
    const records: TestFileRecord[] = [
      {
        filePath: "frontend/Button.test.tsx",
        language: "TypeScript",
        layer: "integration",
        testCaseCount: 10,
        linesOfCode: 80,
        reasons: [],
      },
      {
        filePath: "frontend/utils.test.ts",
        language: "TypeScript",
        layer: "unit",
        testCaseCount: 5,
        linesOfCode: 40,
        reasons: [],
      },
      {
        filePath: "backend/test_api.py",
        language: "Python",
        layer: "integration",
        testCaseCount: 8,
        linesOfCode: 60,
        reasons: [],
      },
      {
        filePath: "backend/test_calc.py",
        language: "Python",
        layer: "unit",
        testCaseCount: 12,
        linesOfCode: 90,
        reasons: [],
      },
      {
        filePath: "e2e/checkout.spec.ts",
        language: "TypeScript",
        layer: "e2e",
        testCaseCount: 2,
        linesOfCode: 50,
        reasons: [],
      },
    ];

    const profiles = calculateLanguageProfiles(records);

    expect(profiles).toHaveLength(2);
    expect(profiles[0]?.language).toBe("TypeScript");
    expect(profiles[0]?.fileCount).toBe(3);
    expect(profiles[0]?.testCaseCount).toBe(17);
    expect(profiles[0]?.percentage).toBe(60); // 3/5 = 60%

    expect(profiles[1]?.language).toBe("Python");
    expect(profiles[1]?.fileCount).toBe(2);
    expect(profiles[1]?.testCaseCount).toBe(20);
    expect(profiles[1]?.percentage).toBe(40); // 2/5 = 40%
  });

  it("evaluates holistic scale across polyglot test files", () => {
    const records: TestFileRecord[] = [
      {
        filePath: "web/app.test.tsx",
        language: "TypeScript",
        layer: "integration",
        testCaseCount: 20,
        linesOfCode: 150,
        reasons: [],
      },
      {
        filePath: "api/test_routes.py",
        language: "Python",
        layer: "integration",
        testCaseCount: 15,
        linesOfCode: 120,
        reasons: [],
      },
      {
        filePath: "core/math_test.go",
        language: "Go",
        layer: "unit",
        testCaseCount: 8,
        linesOfCode: 60,
        reasons: [],
      },
    ];

    const result = evaluateScale("/mock/repo", records, [], 10);
    expect(result.languageProfiles).toHaveLength(3);
    expect(result.dominantLayer).toBe("integration");
    expect(result.totalFiles).toBe(3);
    expect(result.totalTests).toBe(43);
  });
});
