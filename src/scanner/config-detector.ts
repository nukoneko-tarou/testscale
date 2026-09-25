import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { StaticAnalysisRecord, StaticToolCategory } from "../types.js";

export interface DetectedConfigs {
  staticTools: StaticAnalysisRecord[];
  hasCiEnforcement: boolean;
  hasPlaywright: boolean;
  hasCypress: boolean;
  hasVitest: boolean;
  hasRstest: boolean;
  hasJest: boolean;
  hasStorybook: boolean;
}

interface StaticPattern {
  name: string;
  files: string[];
  category: StaticToolCategory;
}

const STATIC_CONFIG_PATTERNS: StaticPattern[] = [
  {
    name: "TypeScript",
    files: ["tsconfig.json", "tsconfig.base.json", "tsconfig.app.json"],
    category: "typechecker",
  },
  {
    name: "ESLint",
    files: [
      "eslint.config.js",
      "eslint.config.mjs",
      "eslint.config.ts",
      ".eslintrc.js",
      ".eslintrc.cjs",
      ".eslintrc.json",
      ".eslintrc.yaml",
      ".eslintrc.yml",
    ],
    category: "linter",
  },
  { name: "Biome", files: ["biome.json", "biome.jsonc"], category: "linter" },
  { name: "Oxlint", files: [".oxlintrc.json", "oxlint.json"], category: "linter" },
  { name: "Oxfmt", files: [".oxfmtrc.json", ".oxfmtrc", "oxfmt.json"], category: "formatter" },
  {
    name: "Prettier",
    files: [".prettierrc", ".prettierrc.json", ".prettierrc.js", "prettier.config.js"],
    category: "formatter",
  },
  { name: "MyPy", files: ["mypy.ini", ".mypy.ini"], category: "typechecker" },
  { name: "Pyright", files: ["pyrightconfig.json"], category: "typechecker" },
  { name: "Ruff", files: ["ruff.toml", ".ruff.toml"], category: "linter" },
  { name: "Flake8", files: [".flake8"], category: "linter" },
  {
    name: "GolangCI-Lint",
    files: [".golangci.yml", ".golangci.yaml", ".golangci.toml", ".golangci.json"],
    category: "linter",
  },
  { name: "RuboCop", files: [".rubocop.yml"], category: "linter" },
  { name: "Sorbet", files: ["sorbet/config"], category: "typechecker" },
  { name: "Steep", files: ["Steepfile"], category: "typechecker" },
];

export function detectConfigs(rootDir: string): DetectedConfigs {
  const staticTools: StaticAnalysisRecord[] = [];
  const recordedTools = new Set<string>();

  // 1. Check standalone config files
  for (const { name, files, category } of STATIC_CONFIG_PATTERNS) {
    for (const file of files) {
      const fullPath = join(rootDir, file);
      if (existsSync(fullPath)) {
        let isStrict = false;
        if (name === "TypeScript") {
          try {
            const content = readFileSync(fullPath, "utf8");
            if (
              /"strict"\s*:\s*true/i.test(content) ||
              /"strictNullChecks"\s*:\s*true/i.test(content)
            ) {
              isStrict = true;
            }
          } catch {
            // ignore read error
          }
        }
        staticTools.push({
          name,
          configFile: file,
          category,
          ...(isStrict ? { isStrict: true } : {}),
        });
        recordedTools.add(name);
        break;
      }
    }
  }

  // 2. Check pyproject.toml for inline Python static tools
  const pyprojectPath = join(rootDir, "pyproject.toml");
  if (existsSync(pyprojectPath)) {
    try {
      const content = readFileSync(pyprojectPath, "utf8");
      if (!recordedTools.has("Ruff") && /\[tool\.ruff/i.test(content)) {
        staticTools.push({ name: "Ruff", configFile: "pyproject.toml", category: "linter" });
        recordedTools.add("Ruff");
      }
      if (!recordedTools.has("MyPy") && /\[tool\.mypy/i.test(content)) {
        const isStrict = /strict\s*=\s*true/i.test(content);
        staticTools.push({
          name: "MyPy",
          configFile: "pyproject.toml",
          category: "typechecker",
          ...(isStrict ? { isStrict: true } : {}),
        });
        recordedTools.add("MyPy");
      }
      if (!recordedTools.has("Pyright") && /\[tool\.pyright/i.test(content)) {
        staticTools.push({
          name: "Pyright",
          configFile: "pyproject.toml",
          category: "typechecker",
        });
        recordedTools.add("Pyright");
      }
      if (!recordedTools.has("Flake8") && /\[tool\.flake8/i.test(content)) {
        staticTools.push({ name: "Flake8", configFile: "pyproject.toml", category: "linter" });
        recordedTools.add("Flake8");
      }
    } catch {
      // ignore
    }
  }

  // 3. Check package.json for inline eslint, biome, oxlint, or oxfmt
  const pkgJsonPath = join(rootDir, "package.json");
  if (existsSync(pkgJsonPath)) {
    try {
      const content = readFileSync(pkgJsonPath, "utf8");
      if (!recordedTools.has("ESLint") && /"eslintConfig"/i.test(content)) {
        staticTools.push({ name: "ESLint", configFile: "package.json", category: "linter" });
        recordedTools.add("ESLint");
      }
      if (!recordedTools.has("Biome") && /"biome"/i.test(content)) {
        staticTools.push({ name: "Biome", configFile: "package.json", category: "linter" });
        recordedTools.add("Biome");
      }
      if (!recordedTools.has("Oxlint") && /"(?:@oxc-project\/oxlint|oxlint)"/i.test(content)) {
        staticTools.push({ name: "Oxlint", configFile: "package.json", category: "linter" });
        recordedTools.add("Oxlint");
      }
      if (!recordedTools.has("Oxfmt") && /"(?:@oxc-project\/oxfmt|oxfmt)"/i.test(content)) {
        staticTools.push({ name: "Oxfmt", configFile: "package.json", category: "formatter" });
        recordedTools.add("Oxfmt");
      }
    } catch {
      // ignore
    }
  }

  // 4. Native statically-typed language indicators (Go, Rust)
  if (existsSync(join(rootDir, "go.mod")) && !recordedTools.has("Go Compiler/Types")) {
    staticTools.push({ name: "Go Type System", configFile: "go.mod", category: "compiler" });
    recordedTools.add("Go Type System");
  }
  if (existsSync(join(rootDir, "Cargo.toml")) && !recordedTools.has("Rust Type System")) {
    staticTools.push({ name: "Rust Type System", configFile: "Cargo.toml", category: "compiler" });
    recordedTools.add("Rust Type System");
  }

  const hasPlaywright = [
    "playwright.config.ts",
    "playwright.config.js",
    "playwright.config.mjs",
  ].some((f) => existsSync(join(rootDir, f)));

  const hasCypress = ["cypress.config.ts", "cypress.config.js", "cypress.json"].some((f) =>
    existsSync(join(rootDir, f)),
  );

  const hasVitest = ["vitest.config.ts", "vitest.config.js", "vitest.config.mjs"].some((f) =>
    existsSync(join(rootDir, f)),
  );

  const hasRstest = ["rstest.config.ts", "rstest.config.js", "rstest.config.mjs"].some((f) =>
    existsSync(join(rootDir, f)),
  );

  const hasJest = ["jest.config.ts", "jest.config.js", "jest.config.mjs", "jest.config.json"].some(
    (f) => existsSync(join(rootDir, f)),
  );

  const hasStorybook = [
    ".storybook/main.ts",
    ".storybook/main.js",
    ".storybook/main.mjs",
    ".storybook/main.cjs",
  ].some((f) => existsSync(join(rootDir, f)));

  const hasCiEnforcement = checkCiEnforcement(rootDir);

  return {
    staticTools,
    hasCiEnforcement,
    hasPlaywright,
    hasCypress,
    hasVitest,
    hasRstest,
    hasJest,
    hasStorybook,
  };
}

function checkCiEnforcement(rootDir: string): boolean {
  // 1. Check GitHub Actions workflows
  const workflowsDir = join(rootDir, ".github", "workflows");
  if (existsSync(workflowsDir)) {
    try {
      const entries = readdirSync(workflowsDir);
      for (const entry of entries) {
        if (entry.endsWith(".yml") || entry.endsWith(".yaml")) {
          const content = readFileSync(join(workflowsDir, entry), "utf8");
          if (
            /\b(?:typecheck|tsc\b|eslint\b|oxlint\b|biome\s+check|ruff\s+check|mypy\b|golangci-lint\b|rubocop\b|cargo\s+(?:check|clippy))\b/i.test(
              content,
            )
          ) {
            return true;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Check pre-commit hooks
  if (existsSync(join(rootDir, ".pre-commit-config.yaml"))) return true;
  const huskyPreCommit = join(rootDir, ".husky", "pre-commit");
  if (existsSync(huskyPreCommit)) {
    try {
      const content = readFileSync(huskyPreCommit, "utf8");
      if (/\b(?:lint|typecheck|tsc|oxlint|eslint|ruff|mypy)\b/i.test(content)) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  return false;
}
