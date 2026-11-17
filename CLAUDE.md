# Exact Highlighter

A VS Code extension (`vscode-contract/`) that highlights Exact's Contract language, and a
sample Exact app (`todo/`). `exact/` is a clone of expo/exact, ignored by git: read it for
the language (`exact/docs/contract-grammar.md`), never edit it.

## Changing the grammar

- `.contract` rules are in `vscode-contract/syntaxes/contract.tmLanguage.json`;
  `.test.contract` rules in `contract-test.tmLanguage.json`, which includes the main
  grammar's repository by `source.contract#<rule>`.
- Every scope name ends in `.contract`. A scope coloured in `package.json`'s
  `configurationDefaults` must be one a grammar emits; the test checks this.
- After a change, from `vscode-contract/`:
  - `bun run test` must pass. Add a check there for the case you fixed.
  - `bun test/tokenize.test.mjs --dump ../todo/app.contract` and `../todo/app.test.contract`
    show every token; read them for regressions.
- To install it locally: bump `version`, `bun run package`,
  `code --install-extension exact-contract-<version>.vsix --force`, then the person runs
  **Developer: Reload Window** (VS Code has no command-line reload).

## Publishing

Publishing is public; do it only when asked. The person logs in themselves
(`bunx @vscode/vsce login <publisher>`; an Open VSX token), so tokens never pass through you.
Bump `version` first; a published version can't be reused.
