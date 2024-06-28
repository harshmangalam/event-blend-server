import { Hono } from "hono";
import { Variables } from "../../types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAdmin, isAuthenticated } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { paginationSchema } from "../../schema";
import { paginate } from "../../lib/utils";
import { prisma } from "../../lib/prisma";

const app = new Hono<{ Variables: Variables }>();

app.get(
  "/",
  zValidator("query", paginationSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const query = c.req.valid("query");
    const totalCount = await prisma.network.count();
    const totalPages = Math.ceil(totalCount / query.pageSize);

    const [take, skip] = paginate(query.page, query.pageSize);
    const networks = await prisma.network.findMany({
      take,
      skip,
    });

    return c.json({
      success: true,
      message: "Fetch networks",
      data: { networks },
      meta: {
        totalCount,
        totalPages,
        page: query.page,
        pageSize: query.pageSize,
      },
    });
  }
);
export default app;
