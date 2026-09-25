import type { TestLayer } from "../../types.js";

const GO_E2E_INDICATORS = [
  {
    pattern:
      /\bgithub\.com\/(?:chromedp\/chromedp|playwright-community\/playwright-go|go-rod\/rod)\b/i,
    reason: "Go headless browser framework import",
  },
];

const GO_INTEGRATION_INDICATORS = [
  {
    pattern: /"net\/http\/httptest"|\bhttptest\.(?:NewServer|NewRecorder|NewRequest)\b/i,
    reason: "Go net/http/httptest API integration",
  },
  {
    pattern: /\bgithub\.com\/(?:testcontainers\/testcontainers-go|ory\/dockertest)\b/i,
    reason: "Go container integration testing",
  },
  {
    pattern:
      /"(?:database\/sql|github\.com\/jmoiron\/sqlx|gorm\.io\/gorm|github\.com\/jackc\/pgx)"[\s\S]*?\b(?:Open|Query|Exec)\b/i,
    reason: "Go database integration",
  },
  {
    pattern: /"google\.golang\.org\/grpc"[\s\S]*?\b(?:Dial|NewServer)\b/i,
    reason: "Go gRPC integration",
  },
];

const GO_UNIT_INDICATORS = [
  {
    pattern: /\bgithub\.com\/(?:golang\/mock|stretchr\/testify\/mock|uber-go\/mock)\b/i,
    reason: "Go mock isolation framework",
  },
];

export const goClassifier = {
  language: "Go",
  supports(filePath: string): boolean {
    return /\.go$/i.test(filePath);
  },
  classify(filePath: string, content: string): { layer: TestLayer; reasons: string[] } | null {
    const reasons: string[] = [];

    for (const ind of GO_E2E_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "e2e", reasons };
      }
    }

    for (const ind of GO_INTEGRATION_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "integration", reasons };
      }
    }

    for (const ind of GO_UNIT_INDICATORS) {
      if (ind.pattern.test(content)) {
        reasons.push(ind.reason);
        return { layer: "unit", reasons };
      }
    }

    return null;
  },
};
