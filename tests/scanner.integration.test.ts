import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "@rstest/core";
import { weighRepository } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("weighRepository", () => {
  it("scans current project directory and returns a valid ScaleResult", async () => {
    const projectRoot = resolve(__dirname, "..");
    const result = await weighRepository(projectRoot);

    expect(result.rootDir).toBe(projectRoot);
    expect(result.totalFiles).toBeGreaterThan(0);
    expect(result.totalTests).toBeGreaterThan(0);
    expect(result.verdict).toBeDefined();
    expect(result.verdict.name).toBeTypeOf("string");
    expect(result.layers).toHaveProperty("static");
    expect(result.layers).toHaveProperty("unit");
    expect(result.layers).toHaveProperty("integration");
    expect(result.layers).toHaveProperty("e2e");
  });
});
