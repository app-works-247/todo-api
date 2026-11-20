# todo-api

A small REST API for to-do items.

Endpoints: `GET /todos`, `GET /todos/:id`, `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`.

Deleting a todo is a soft delete: the row stays in the store with `deletedAt` set.
