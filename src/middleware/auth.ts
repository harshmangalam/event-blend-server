import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { prisma } from "../lib/prisma";

export const isAuthenticated = createMiddleware(async (c, next) => {
  const jwtPayload = c.get("jwtPayload");

  const user = await prisma.user.findUnique({
    where: {
      id: jwtPayload.sub as string,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new HTTPException(401, {
      message: "Access token is invalid",
    });
  }

  c.set("user", user);
  await next();
});
