# Exact Contract (unofficial)

Syntax highlighting for Contract, the UI language of [Exact](https://github.com/expo/exact).
A community extension, not made by Expo. Full guide:
[github.com/a0m0rajab/exact-highlighter](https://github.com/a0m0rajab/exact-highlighter#readme).

- `*.contract`: declarations (`use`, `shape`, `fn`, `component`, `routes`, `style`,
  `keyframes`…), component members (`state`, `derive`, `resource`, `mutation`,
  `action`, `view`), view elements and components, attributes (`gap=8`, `aria-label=…`),
  state parts (`:active`, `::placeholder`), types, strings, templates with `${…}`,
  hex colours, numbers, comments and expressions.
- `*.test.contract`: tests, launch lines (`size 390x844`, `epoch`, `locale`…), steps
  (`tap`, `type`, `clock`, `expect`…) and their modifiers, state paths and hosts.
- Markdown: ```` ```contract ```` and ```` ```contract-test ```` code fences.

It also comments with `//`, closes brackets and quotes, and folds by indentation.

The Visual Studio Dark and Light themes leave type, function and variable names
uncoloured in every language. For those two themes the extension colours Contract's
shape and component names, field and state names, types, the `:` before a type and functions as Dark+ and
Light+ do. Other themes colour them already. A `editor.tokenColorCustomizations` of
your own replaces these defaults.

## Install

```sh
bun install
bun run package          # writes exact-contract-0.1.2.vsix
code --install-extension exact-contract-0.1.2.vsix
```

Or open this folder in VS Code and press F5 to try it in an Extension Development Host.

## Test

`bun run test` tokenizes sample Contract with VS Code's TextMate engine and checks the
scopes. `bun test/tokenize.test.mjs --dump path/to/app.contract` prints every token's scopes.

## Limits

TextMate grammars match line by line, so a few things are approximations: a view element is
any lowercase name that begins a line and is not a keyword or an assignment, and a type after
`:` is recognised only for `string`, `number`, `bool` and capitalised names.
