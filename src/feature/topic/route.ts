import { Hono } from "hono";
import { Variables } from "../../types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAdmin, isAuthenticated } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { createTopicSchema } from "./schema";

const app = new Hono<{ Variables: Variables }>();

app.post(
  "/",
  zValidator("json", createTopicSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    return c.json(
      {
        status: true,
        message: "Group created successfully",
      },
      201
    );
  }
);
export default app;
