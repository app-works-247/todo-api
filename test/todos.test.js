import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { createApp } from "../src/app.js";
import { db } from "../src/db.js";

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

beforeEach(() => db.todos.reset());

const call = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

test("creates and lists todos", async () => {
  const created = await call("POST", "/todos", { title: "write the README" });
  assert.equal(created.status, 201);
  const list = await (await call("GET", "/todos")).json();
  assert.deepEqual(list.map((t) => t.title), ["write the README"]);
});

test("rejects a todo without a title", async () => {
  const res = await call("POST", "/todos", { title: "  " });
  assert.equal(res.status, 400);
});

test("marks a todo as done", async () => {
  const { id } = await (await call("POST", "/todos", { title: "ship it" })).json();
  const res = await call("PATCH", `/todos/${id}`, { done: true });
  assert.equal((await res.json()).done, true);
});

test("deletes a todo", async () => {
  const { id } = await (await call("POST", "/todos", { title: "old task" })).json();
  assert.equal((await call("DELETE", `/todos/${id}`)).status, 204);
  assert.equal((await call("GET", `/todos/${id}`)).status, 404);
});

test("returns 404 for a todo that never existed", async () => {
  assert.equal((await call("DELETE", "/todos/999")).status, 404);
});
