import { Hono } from "hono";
import auth from "./feature/auth/route";
import { HTTPException } from "hono/http-exception";
import { extractDuplicatePrismaField } from "./lib/utils";
import { JwtTokenExpired, JwtTokenInvalid } from "hono/utils/jwt/types";
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/auth", auth);
app.onError((err, c) => {
  console.log(err);
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
  // ------------ Handle JWT token error  ------------

  if (err instanceof JwtTokenExpired) {
    return c.json(
      {
        success: false,
        message: "Access token has expired",
      },
      401
    );
  }

  if (err instanceof JwtTokenInvalid) {
    return c.json(
      {
        success: false,
        message: "Access token is invalid",
      },
      400
    );
  }

  // ---------- Handle Rest of the Error ----------------

  return c.json({ success: false, message: "Internal server error" }, 500);
});

export default app;
