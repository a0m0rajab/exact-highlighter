import type { Answer, Result, Sources, Storage } from './app.contract.d.ts';

export const grants = 'fs.read app:/data/todos.json\nfs.write app:/data/todos.json';

type Todo = Result<'loadTodos'>[number];
type Reply = { ok: boolean; error: string };

const FILE = 'app:/data/todos.json';

// No file yet means an empty list (the build's bake reads before anything is written).
const load = (storage: Storage): Promise<Todo[]> =>
  storage.fs.readFile(FILE).then(
    (bytes) => JSON.parse(new TextDecoder().decode(bytes)),
    (e) => {
      if (e.code === 'ENOENT') return [];
      throw e;
    },
  );

const save = async (storage: Storage, todos: Todo[]): Promise<Reply> => {
  await storage.fs.atomicWriteFile(FILE, new TextEncoder().encode(JSON.stringify(todos)));
  return { ok: true, error: '' };
};

// Ids are never reused after a delete, so a row's key stays its own.
const nextId = (todos: Todo[]) => String(todos.reduce((max, t) => Math.max(max, Number(t.id)), 0) + 1);

const sources: Sources = {
  loadTodos: (_args, _store, storage) => load(storage),
  addTodo: async ([title], _store, storage) => {
    const todos = await load(storage);
    const same = todos.find((t) => t.title.toLowerCase() === title.toLowerCase());
    if (same) return { ok: false, error: `${same.title} is already on the list.` };
    return save(storage, [...todos, { id: nextId(todos), title, done: false }]);
  },
  setDone: async ([id, done], _store, storage) =>
    save(storage, (await load(storage)).map((t) => (t.id === id ? { ...t, done } : t))),
  removeTodo: async ([id], _store, storage) =>
    save(storage, (await load(storage)).filter((t) => t.id !== id)),
};

export const answer: Answer = (source, args, store, storage, native) =>
  sources[source](args, store, storage, native);
