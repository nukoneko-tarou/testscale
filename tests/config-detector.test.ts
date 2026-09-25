import { afterEach, beforeEach, describe, expect, it } from "@rstest/core";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectConfigs } from "../src/scanner/config-detector.js";

describe("detectConfigs", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "testscales-detector-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("detects tsconfig.json with strict mode", () => {
    writeFileSync(
      join(tempDir, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { strict: true } }),
    );
    const result = detectConfigs(tempDir);
    expect(result.staticTools).toHaveLength(1);
    expect(result.staticTools[0]?.name).toBe("TypeScript");
    expect(result.staticTools[0]?.category).toBe("typechecker");
    expect(result.staticTools[0]?.isStrict).toBe(true);
  });

  it("detects inline Python tools from pyproject.toml", () => {
    writeFileSync(
      join(tempDir, "pyproject.toml"),
      `
[project]
name = "myapp"

[tool.ruff]
line-length = 88

[tool.mypy]
strict = true
      `,
    );
    const result = detectConfigs(tempDir);
    const toolNames = result.staticTools.map((t) => t.name);
    expect(toolNames).toContain("Ruff");
    expect(toolNames).toContain("MyPy");

    const mypy = result.staticTools.find((t) => t.name === "MyPy");
    expect(mypy?.category).toBe("typechecker");
    expect(mypy?.isStrict).toBe(true);

    const ruff = result.staticTools.find((t) => t.name === "Ruff");
    expect(ruff?.category).toBe("linter");
  });

  it("detects inline eslintConfig in package.json", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "web-pkg",
        eslintConfig: { extends: ["react-app"] },
      }),
    );
    const result = detectConfigs(tempDir);
    expect(result.staticTools.map((t) => t.name)).toContain("ESLint");
  });

  it("detects Go and Rust native type systems", () => {
    writeFileSync(join(tempDir, "go.mod"), "module example.com/app\n\ngo 1.22\n");
    const result = detectConfigs(tempDir);
    const goTool = result.staticTools.find((t) => t.name === "Go Type System");
    expect(goTool).toBeDefined();
    expect(goTool?.category).toBe("compiler");
  });

  it("detects Oxfmt and Oxlint from package.json dependencies", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "ox-app",
        devDependencies: {
          oxlint: "^1.85.0",
          oxfmt: "^0.70.0",
        },
      }),
    );
    const result = detectConfigs(tempDir);
    const names = result.staticTools.map((t) => t.name);
    expect(names).toContain("Oxlint");
    expect(names).toContain("Oxfmt");

    const oxfmt = result.staticTools.find((t) => t.name === "Oxfmt");
    expect(oxfmt?.category).toBe("formatter");
  });
});
