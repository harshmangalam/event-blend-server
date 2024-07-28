import { Hono } from "hono";
import { Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { paginationSchema } from "@/schema";
import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { jwt } from "hono/jwt";
import { env } from "@/config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/config/constants";
import { prisma } from "@/lib/prisma";
import { paginate } from "@/lib/utils";

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
    const totalCount = await prisma.category.count();
    const totalPages = Math.ceil(totalCount / query.pageSize);

    const [take, skip] = paginate(query.page, query.pageSize);
    const categories = await prisma.category.findMany({
      take,
      skip,
      include: {
        _count: {
          select: {
            events: true,
            groups: true,
            topics: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Fetch categories",
      data: {
        categories,
      },
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
