import express from "express";
import { todos } from "./routes/todos.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/todos", todos);

  // Anything thrown in a route ends up here.
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  });

  return app;
}
