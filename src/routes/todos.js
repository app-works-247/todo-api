import { Router } from "express";
import { db } from "../db.js";

export const todos = Router();

todos.get("/", async (req, res) => {
  res.json(await db.todos.list());
});

todos.get("/:id", async (req, res) => {
  const todo = await db.todos.find(req.params.id);
  if (!todo || todo.deletedAt) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(todo);
});

todos.post("/", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  res.status(201).json(await db.todos.create({ title }));
});

todos.patch("/:id", async (req, res) => {
  const changes = {};
  if (typeof req.body?.title === "string") changes.title = req.body.title.trim();
  if (typeof req.body?.done === "boolean") changes.done = req.body.done;
  const todo = await db.todos.update(req.params.id, changes);
  if (!todo) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(todo);
});

todos.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const todo = await db.todos.find(id);
  if (!todo) {
    return res.status(404).json({ error: "not found" });
  }
  await db.todos.delete(id, { soft: true });
  res.status(204).end();
});
