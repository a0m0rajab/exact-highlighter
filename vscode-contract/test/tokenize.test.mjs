// Tokenizes sample Contract with VS Code's own TextMate engine and checks the scopes
// that matter. `bun test/tokenize.test.mjs --dump <file>` prints every token instead.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import oniguruma from 'vscode-oniguruma';
import textmate from 'vscode-textmate';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const grammarFiles = {
  'source.contract': 'syntaxes/contract.tmLanguage.json',
  'source.contract-test': 'syntaxes/contract-test.tmLanguage.json',
};

await oniguruma.loadWASM(readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')).buffer);
const registry = new textmate.Registry({
  onigLib: Promise.resolve({
    createOnigScanner: (p) => new oniguruma.OnigScanner(p),
    createOnigString: (s) => new oniguruma.OnigString(s),
  }),
  loadGrammar: async (scope) =>
    grammarFiles[scope]
      ? textmate.parseRawGrammar(readFileSync(join(root, grammarFiles[scope]), 'utf8'), grammarFiles[scope])
      : null,
});

async function tokenize(scope, text) {
  const grammar = await registry.loadGrammar(scope);
  let stack = textmate.INITIAL;
  const out = [];
  for (const line of text.split('\n')) {
    const r = grammar.tokenizeLine(line, stack);
    for (const t of r.tokens) out.push({ text: line.slice(t.startIndex, t.endIndex), scopes: t.scopes });
    stack = r.ruleStack;
  }
  return out;
}

if (process.argv[2] === '--dump') {
  const file = process.argv[3];
  const scope = file.endsWith('.test.contract') ? 'source.contract-test' : 'source.contract';
  for (const t of await tokenize(scope, readFileSync(file, 'utf8')))
    if (t.text.trim()) console.log(JSON.stringify(t.text).padEnd(32), t.scopes.slice(1).join(' '));
  process.exit(0);
}

const view = `use SummaryCard, RowText from "exact:content"
shape Todo
  id: string
  items: Todo[]
fn leftText(n: number): string = \`\${n} \${n == 1 ? "item" : "items"} left\`
component App
  state draft = ""
  resource todos = loadTodos() as shape Todo[] else empty()
  mutation added as shape Reply refreshes todos then afterAdd
  action toggle(id: string, done: bool)
    send changed = setDone(id, done)
    draft = ""
  view
    main testId="root" navigationKey=\`\${top(nav).id}\`
      for t in todos key=t.id
        row gap=8 aria-label=t.title color=#1f9d62
          :active
            opacity=0.5
          text (todos.length == 0 ? "None.\\n" : leftText(left)) testId="left"
          SummaryCard(label="Today")
      // a comment`;

const test = `test "a todo is added" on web, ios
  size 390x844
  type "draft" "Milk"
  tap "add"
  clock data
  expect text "left" == "1 item left"
  expect state todos.0 .done == true
  expect tree missing "todo-1"`;

const expectations = [
  ['source.contract', view, [
    ['use', 'keyword.control.import'],
    ['exact:content', 'string.quoted.double'],
    ['shape', 'storage.type.shape'],
    ['Todo', 'entity.name.type'],
    ['id', 'variable.other.property'],
    ['string', 'support.type.primitive'],
    ['fn', 'storage.type.function'],
    ['leftText', 'entity.name.function'],
    ['${', 'punctuation.definition.template-expression.begin'],
    ['component', 'storage.type.component'],
    ['App', 'entity.name.type'],
    ['state', 'storage.type.state'],
    ['draft', 'variable.other.definition'],
    ['resource', 'storage.type.resource'],
    ['loadTodos', 'entity.name.function'],
    ['as', 'keyword.control.as'],
    ['else', 'keyword.control'],
    ['empty', 'support.function'],
    ['refreshes', 'keyword.other'],
    ['then', 'keyword.control'],
    ['action', 'storage.type.function'],
    ['toggle', 'entity.name.function'],
    ['bool', 'support.type.primitive'],
    ['number', 'support.type.primitive'],
    ['send', 'keyword.other.send'],
    ['view', 'storage.type.section'],
    ['main', 'entity.name.tag'],
    ['testId', 'entity.other.attribute-name'],
    ['for', 'keyword.control'],
    ['in', 'keyword.control'],
    ['key', 'entity.other.attribute-name'],
    ['row', 'entity.name.tag'],
    ['aria-label', 'entity.other.attribute-name'],
    ['#1f9d62', 'constant.other.color'],
    ['active', 'entity.other.attribute-name.pseudo-class'],
    ['0.5', 'constant.numeric'],
    ['text', 'entity.name.tag'],
    ['length', 'variable.other.property'],
    ['==', 'keyword.operator.comparison'],
    ['\\n', 'constant.character.escape'],
    ['SummaryCard', 'entity.name.type'],
    ['// a comment', 'comment.line.double-slash'],
  ]],
  ['source.contract-test', test, [
    ['test', 'storage.type.test'],
    ['a todo is added', 'entity.name.function.test'],
    ['on', 'keyword.other'],
    ['ios', 'constant.language.host'],
    ['size', 'keyword.control.launch'],
    ['390', 'constant.numeric'],
    ['type', 'keyword.control.step'],
    ['"', 'string.quoted.double'],
    ['tap', 'keyword.control.step'],
    ['clock', 'keyword.control.step'],
    ['data', 'keyword.other.step'],
    ['expect', 'keyword.control.step'],
    ['tree', 'keyword.other.step'],
    ['missing', 'keyword.other.step'],
    ['todos', 'variable.other.readwrite'],
    ['done', 'variable.other.property'],
    ['true', 'constant.language.boolean'],
  ]],
];

let failed = 0;
for (const [scope, text, checks] of expectations) {
  const tokens = await tokenize(scope, text);
  const before = failed;
  for (const [word, want] of checks) {
    const hit = tokens.find((t) => t.text === word && t.scopes.some((s) => s.startsWith(want)));
    if (!hit) {
      failed++;
      const seen = tokens.filter((t) => t.text === word).map((t) => t.scopes.slice(1).join(' '));
      console.log(`FAIL ${scope}: ${JSON.stringify(word)} wants ${want}; saw ${JSON.stringify(seen)}`);
    }
  }
  console.log(`${scope}: ${checks.length - (failed - before)} of ${checks.length} checks`);
}
if (failed) process.exit(1);
console.log('all scopes as expected');

// Every scope the extension colours for the Visual Studio themes must be one a grammar emits.
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const grammarText = Object.values(grammarFiles).map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
const themed = Object.values(pkg.contributes.configurationDefaults['editor.tokenColorCustomizations'])
  .flatMap((t) => t.textMateRules.flatMap((r) => r.scope));
const unknown = themed.filter((s) => !grammarText.includes(`"${s}"`) && !grammarText.includes(`"${s} `));
if (unknown.length) {
  console.log(`FAIL theme colours name scopes no grammar emits: ${unknown.join(', ')}`);
  process.exit(1);
}
console.log(`theme colours: ${new Set(themed).size} scopes, all emitted`);
