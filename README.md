# Exact Highlighter

Syntax highlighting for **Contract**, the UI language of [Exact](https://github.com/expo/exact),
in VS Code and editors built on it (Cursor, Windsurf, VSCodium). This is a community project,
not made by Expo.

The repository holds two things:

| Folder | What it is |
|---|---|
| [`vscode-contract/`](vscode-contract) | The VS Code extension: TextMate grammars for `.contract` and `.test.contract` files. |
| [`todo/`](todo) | A todo app built with Exact, used as a real sample for the grammar. |

## What gets highlighted

```contract
shape Todo                       // "shape" a keyword, "Todo" a type
  id: string                     // field, ":" and the type each coloured
  done: bool

component App
  state draft = ""               // "state" a keyword, "draft" its name
  resource todos = loadTodos() as shape Todo[] else empty()
  action add
    if draft.trim() != ""
      send added = addTodo(draft.trim())
  view
    row gap=8 align-items="center"            // element, attributes
      text `${left} left` testId="left"       // template with ${…}
```

- **`.contract`**: declarations (`use`, `shape`, `fn`, `component`, `routes`, `style`,
  `keyframes`…), members (`state`, `derive`, `resource`, `mutation`, `action`, `view`),
  view elements and components, attributes, state parts (`:active`, `::placeholder`),
  types, strings, templates, hex colours, numbers, comments and expressions.
- **`.test.contract`**: `test` names and hosts, launch lines (`size 390x844`, `locale`…),
  steps (`tap`, `type`, `clock`, `expect`…) and their words, state paths.
- **Markdown**: ```` ```contract ```` and ```` ```contract-test ```` code blocks.
- **Editing**: `//` comments with Cmd+/, bracket and quote closing, folding by indentation.

## Add it to VS Code

### From the Marketplace

Search the Extensions view (Cmd+Shift+X) for **Exact Contract (unofficial)** and press
Install. In Cursor, Windsurf or VSCodium, the same search finds it on Open VSX.

### From a `.vsix` file

```sh
cd vscode-contract
bun install
bun run package                          # writes exact-contract-<version>.vsix
code --install-extension exact-contract-*.vsix
```

Then run **Developer: Reload Window** from the Command Palette (Cmd+Shift+P). Cursor takes
the same file with `cursor --install-extension`. Without a terminal: Command Palette →
**Extensions: Install from VSIX…**.

To remove it: `code --uninstall-extension <publisher>.exact-contract`.

### Check it works

Open any `.contract` file. The status bar's language reads **Contract** (or **Contract Test**
for a `*.test.contract`). If it reads Plain Text, click it and pick Contract. To see what a
word was matched as, put the cursor on it and run **Developer: Inspect Editor Tokens and Scopes**.

### Themes

Most themes (Dark+, Light+, Dark Modern, and the marketplace themes) colour everything the
grammar marks. **Visual Studio Dark** and **Visual Studio Light** leave type, field and function
names plain in every language, so for those two the extension supplies Dark+/Light+ colours
for Contract's types, fields, functions and the `:` before a type. A
`editor.tokenColorCustomizations` setting of your own replaces those defaults.

## Use it with Claude Code

Claude Code reads and writes `.contract` files like any other text; this extension changes
how they look in your editor, not what Claude sees.

- **Install it by asking.** In a Claude Code session, say *"install the Contract highlighter
  from `vscode-contract`"*: Claude runs the `.vsix` commands above. VS Code still needs
  **Developer: Reload Window** afterwards.
- **See Claude's edits highlighted.** Run Claude Code in VS Code's terminal and connect it with
  `/ide`. Claude Code then opens its proposed edits in VS Code's own diff viewer, where this
  extension colours the Contract. The Claude Code extension's chat panel shows edits in its
  own side-by-side view; its docs don't say whether editor extensions colour that view.
- **The terminal itself.** Claude Code's terminal output has its own highlighter. Its docs
  describe no way to load a VS Code or TextMate grammar into it, so Contract shows there
  uncoloured or approximated.
- **Working on the grammar with Claude.** [`CLAUDE.md`](CLAUDE.md) tells Claude Code how
  this repository is laid out and how to test a grammar change. Claude Code loads it
  automatically when you start a session in this folder.

## Develop the extension

```sh
cd vscode-contract
bun install
bun run test                                        # checks token scopes with VS Code's TextMate engine
bun test/tokenize.test.mjs --dump ../todo/app.contract   # every token and its scopes
```

To try a change live, open `vscode-contract/` in VS Code and press **F5**: a second window
opens with the extension loaded and `todo/` open. After editing a grammar, press Cmd+R in
that window.

| File | Role |
|---|---|
| `syntaxes/contract.tmLanguage.json` | `.contract` grammar (`source.contract`) |
| `syntaxes/contract-test.tmLanguage.json` | `.test.contract` grammar; reuses the main one's rules |
| `syntaxes/contract-markdown.tmLanguage.json` | Markdown code-block injection |
| `language-configuration.json` | Comments, brackets, folding |
| `package.json` | Languages, grammars, and the Visual Studio theme colours |
| `test/tokenize.test.mjs` | Scope checks |

The grammars match line by line, so some rules approximate the language: a view element is a
lowercase name that begins a line and is not a keyword or an assignment, and a type after `:`
is recognised for `string`, `number`, `bool` and capitalised names. The authority on syntax is
Exact's [`docs/contract-grammar.md`](https://github.com/expo/exact/blob/main/docs/contract-grammar.md).

## Publish a new version

Bump `version` in `vscode-contract/package.json`, then:

```sh
cd vscode-contract
bun run test
bun run publish:vsce             # VS Code Marketplace (after `bunx @vscode/vsce login <publisher>`)
bun run publish:ovsx -- -p <token>   # Open VSX (token from open-vsx.org)
```

## The sample app

`todo/` is an Exact app: add todos, check them off, delete them, see how many are left.
It needs a clone of `expo/exact` beside it at `../exact` (see Exact's README for setup):

```sh
cd todo
bun exact.mjs web          # http://127.0.0.1:8765/
bun exact.mjs test web     # runs app.test.contract
```

## License

MIT. Exact and Contract are Expo's; this project is not affiliated with Expo.
