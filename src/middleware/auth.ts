import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { prisma } from "../lib/prisma";
import { RoleEnum } from "@prisma/client";

const isAuthenticated = createMiddleware(async (c, next) => {
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

const isAdmin = createMiddleware(async (c, next) => {
  const currentUser = c.get("user");
  if (currentUser.role !== RoleEnum.Admin) {
    throw new HTTPException(403, {
      message: "Access denied",
    });
  }
  await next();
});

export { isAuthenticated, isAdmin };
