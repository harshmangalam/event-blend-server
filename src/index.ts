import { Hono } from "hono";
import auth from "./features/auth/route";
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/auth", auth);

export default app;
