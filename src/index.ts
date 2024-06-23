import { Hono } from "hono";
import auth from "./features/auth/route";
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/auth", auth);
app.onError((err: any, c) => {
  return c.json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;
