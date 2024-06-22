import { Hono } from "hono";

const app = new Hono();

app.post("/login", (c) => {
  return c.json({
    message: "Login successfully",
  });
});

app.post("/signup", (c) => {
  return c.json({
    message: "Account created successfully",
  });
});

app.post("/logout", (c) => {
  return c.json({
    message: "Logout successfully",
  });
});

app.get("/me", (c) => {
  return c.json({
    message: "Fetch current user",
  });
});

export default app;
