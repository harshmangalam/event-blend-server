import { Hono } from "hono";
import { Variables } from "../../types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAdmin, isAuthenticated } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { createTopicSchema, deleteTopicSchema } from "./schema";
import { prisma } from "../../lib/prisma";
import { paginationSchema } from "../../schema";
import { paginate } from "../../lib/utils";

const app = new Hono<{ Variables: Variables }>();

app.post(
  "/",
  zValidator("json", createTopicSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const body = c.req.valid("json");
    const currentUser = c.get("user");
    const topic = await prisma.topic.create({
      data: {
        name: body.name,
        userId: currentUser.id,
      },
    });
    return c.json(
      {
        status: true,
        message: "Topic created successfully",
        data: {
          topic,
        },
      },
      201
    );
  }
);

app.get("/", zValidator("query", paginationSchema), async (c) => {
  const query = c.req.valid("query");
  const [take, skip] = paginate(query.page, query.pageSize);
  const topics = await prisma.topic.findMany({
    take,
    skip,
  });
  const totalCount = await prisma.topic.count();
  const totalPages = Math.ceil(totalCount / query.pageSize);

  return c.json({
    success: true,
    message: "Fetch topics",
    data: {
      topics,
      meta: {
        totalCount,
        totalPages,
        page: query.page,
        pageSize: query.pageSize,
      },
    },
  });
});
app.delete("/:topicId", zValidator("param", deleteTopicSchema), async (c) => {
  const param = c.req.param();
  await prisma.topic.delete({
    where: {
      id: param.topicId,
    },
  });
  return c.json(
    {
      success: true,
      message: "Topic deleted successfully",
    },
    201
  );
});
export default app;
