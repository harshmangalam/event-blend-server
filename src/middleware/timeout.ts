import { HTTPException } from "hono/http-exception";

export const customTimeoutException = () =>
  new HTTPException(408, {
    message:
      "Request timeout after waiting for too long. Please try again later.",
  });
