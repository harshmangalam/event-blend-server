import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { extractDuplicatePrismaField } from "./lib/utils";
import { env } from "./config/env";
import { Variables } from "./types";

import auth from "./feature/auth/route";
import topics from "./feature/topic/route";

const app = new Hono<{ Variables: Variables }>();

app.route("/api/auth", auth);
app.route("/api/topics", topics);
app.onError((err, c) => {
  console.log(err);

  // ---------- Handle Prisma error ---------------

  if ((err as any).code === "P2002") {
    const extractedText = extractDuplicatePrismaField(err.message);
    return c.json(
      {
        success: false,
        message: `This ${extractedText} is already in use. Please use a different ${extractedText}.`,
      },
      400
    );
  }

  // ----------- Handle HTTP Error --------------

  if (err instanceof HTTPException) {
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
