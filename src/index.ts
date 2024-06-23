import { Hono } from "hono";
import auth from "./features/auth/route";
import { HTTPException } from "hono/http-exception";
import { extractDuplicatePrismaField } from "./lib/utils";
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
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status
    );
  }
  return c.json({ success: false, message: "Internal server error" }, 500);
});

export default app;
