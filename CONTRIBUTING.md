# Contributing to testscales

Thank you for your interest in contributing to `testscales`! We welcome bug reports, heuristics improvements for test frameworks, and documentation enhancements.

## 🛠️ Development Setup

`testscales` is built with [Bun](https://bun.sh/) and TypeScript:

```bash
# Clone the repository
git clone https://github.com/nukoneko-tarou/testscale.git
cd testscale

# Install dependencies
bun install
```

## 🧪 Quality Checks

Before submitting a Pull Request, make sure all local checks pass:

```bash
# Check code formatting (oxfmt)
bun run fmt:check

# Run linter (oxlint)
bun run lint

# Run TypeScript typechecker
bun run typecheck

# Run test suite (rstest)
bun run test

# Verify production build
bun run build
```

You can auto-format your code with:
```bash
bun run fmt
```

## 📜 Pull Request Guidelines

1. **Focused Diffs**: Keep changes focused on a single feature, bug fix, or language heuristic.
2. **Include Tests**: If adding support for a new framework or layer pattern, include runnable tests under `tests/`.
3. **Preserve Performance**: `testscales` is engineered for sub-second execution across large repositories. Avoid heavy AST parsers or blocking disk operations in the fast paths.
4. **CI Passing**: All GitHub Actions CI checks must pass before a PR can be merged.

## 📄 License

By contributing to `testscales`, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
