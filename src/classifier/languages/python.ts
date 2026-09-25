import type { TestLayer } from "../../types.js";

const PYTHON_E2E_INDICATORS = [
  {
    pattern: /\bfrom\s+playwright\.(?:sync_api|async_api)\s+import\b|\bimport\s+playwright\b/i,
    reason: "Python Playwright import",
  },
  {
    pattern: /\bfrom\s+selenium(?:\.webdriver)?\s+import\b|\bimport\s+selenium\b/i,
    reason: "Python Selenium import",
  },
  { pattern: /\bsplinter\b/i, reason: "Splinter browser automation" },
];

const PYTHON_INTEGRATION_INDICATORS = [
  {
    pattern:
      /\bfrom\s+(?:django\.test|pytest_django)\b|\bTestCase\b[\s\S]*?\bself\.client\.(?:get|post|put|delete)\b/i,
    reason: "Django Client integration test",
  },
  {
    pattern: /\b(?:fastapi|starlette)\.testclient\b|\bTestClient\s*\(/i,
    reason: "FastAPI/Starlette TestClient integration",
  },
  {
    pattern: /\bflask\.testing\b|\bapp\.test_client\s*\(/i,
    reason: "Flask test client integration",
  },
  { pattern: /\bhttpx\.(?:AsyncClient|Client)\s*\(/i, reason: "HTTPX API client integration" },
  { pattern: /\btestcontainers\b/i, reason: "Testcontainers Python integration" },
  {
    pattern: /\b(?:responses|requests_mock|aioresponses)\b/i,
    reason: "HTTP mock adapter integration",
  },
  {
    pattern: /\b(?:sqlalchemy|tortoise|peewee)\b[\s\S]*?\b(?:session|engine|database)\b/i,
    reason: "Database session integration",
  },
];

const PYTHON_UNIT_INDICATORS = [
  { pattern: /\b(?:unittest\.mock|mocker\.patch|monkeypatch)\b/i, reason: "Python mock isolation" },
];

export const pythonClassifier = {
  language: "Python",
  supports(filePath: string): boolean {
    return /\.py$/i.test(filePath);
  },
  classify(filePath: string, content: string): { layer: TestLayer; reasons: string[] } | null {
    const reasons: string[] = [];

    for (const ind of PYTHON_E2E_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "e2e", reasons };
      }
    }

    for (const ind of PYTHON_INTEGRATION_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "integration", reasons };
      }
    }

    for (const ind of PYTHON_UNIT_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "unit", reasons };
      }
    }

    return null;
  },
};
