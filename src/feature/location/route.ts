import { Hono } from "hono";
import { Variables } from "../../types";
import { zValidator } from "@hono/zod-validator";
import { paginationSchema } from "../../schema";
import { prisma } from "../../lib/prisma";
import { paginate } from "../../lib/utils";

const app = new Hono<{ Variables: Variables }>();

app.get("/", zValidator("query", paginationSchema), async (c) => {
  const query = c.req.valid("query");
  const totalCount = await prisma.location.count();
  const totalPages = Math.ceil(totalCount / query.pageSize);

  const [take, skip] = paginate(query.page, query.pageSize);
  const locations = await prisma.location.findMany({
    take,
    skip,
    include: {
      _count: {
        select: {
          groups: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    message: "Fetch locations",
    data: { locations },
    meta: {
      totalCount,
      totalPages,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
});

export default app;
