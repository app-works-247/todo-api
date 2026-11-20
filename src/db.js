// In-memory store. Good enough for a demo; swap for a real database later.

export class AlreadyDeletedError extends Error {
  constructor(id) {
    super(`todo ${id} is already deleted`);
    this.name = "AlreadyDeletedError";
  }
}

function createTodoStore() {
  const rows = new Map();
  let nextId = 1;

  return {
    async list() {
      return [...rows.values()].filter((todo) => !todo.deletedAt);
    },

    // Returns the row even when it was soft-deleted, so the admin export can see it.
    async find(id) {
      return rows.get(Number(id)) ?? null;
    },

    async create({ title }) {
      const todo = { id: nextId++, title, done: false, createdAt: new Date().toISOString(), deletedAt: null };
      rows.set(todo.id, todo);
      return todo;
    },

    async update(id, changes) {
      const todo = rows.get(Number(id));
      if (!todo || todo.deletedAt) return null;
      Object.assign(todo, changes);
      return todo;
    },

    async delete(id, { soft = false } = {}) {
      const key = Number(id);
      const todo = rows.get(key);
      if (!todo) return false;
      if (soft) {
        if (todo.deletedAt) throw new AlreadyDeletedError(key);
        todo.deletedAt = new Date().toISOString();
      } else {
        rows.delete(key);
      }
      return true;
    },

    reset() {
      rows.clear();
      nextId = 1;
    },
  };
}

export const db = { todos: createTodoStore() };
