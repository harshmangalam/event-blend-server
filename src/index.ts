import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { extractDuplicatePrismaField } from "./lib/utils";
import { env } from "./config/env";
import { Variables } from "./types";
import { cors } from "hono/cors";

import auth from "./feature/auth/route";
import topics from "./feature/topic/route";
import networks from "./feature/network/route";
import groups from "./feature/group/route";
import locations from "./feature/location/route";
import events from "./feature/event/route";
import categories from "./feature/category/route";
import users from "./feature/user/route";
import seed from "./feature/seed/route";
import interest from "./feature/interest/route";

const app = new Hono<{ Variables: Variables }>();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.route("/api/auth", auth);
app.route("/api/topics", topics);
app.route("/api/networks", networks);
app.route("/api/groups", groups);
app.route("/api/locations", locations);
app.route("/api/events", events);
app.route("/api/categories", categories);
app.route("/api/users", users);
app.route("/api/seed", seed);
app.route("/api/interest",interest);

app.onError((err, c) => {
  console.log(err);

  // ---------- Handle Prisma error ---------------

  // handle duplicate record  error
  if ((err as any).code === "P2002") {
    const extractedText = extractDuplicatePrismaField(err.message);
    return c.json(
      {
        success: false,
        message: `${extractedText} is already in use, please use a different ${extractedText}.`,
      },
      400
    );
  }

  // record does not exist
  if ((err as any).code === "P2025") {
    return c.json({ success: false, message: "Record does not exist" }, 410);
  }

  // ----------- Handle HTTP Error --------------

  if (err instanceof HTTPException) {
    console.log(err);
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status
    );
  }
  // ---------- Handle Rest of the Error ----------------

  return c.json({ success: false, message: "Internal server error" }, 500);
});

export default {
  fetch: app.fetch,
  port: env.PORT,
};
