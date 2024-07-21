import { Hono } from "hono";
import { Variables } from "../../types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAdmin, isAuthenticated } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { topicBodySchema, topicParamSchema } from "./schema";
import { prisma } from "../../lib/prisma";
import { paginationSchema } from "../../schema";
import { paginate } from "../../lib/utils";
import { HTTPException } from "hono/http-exception";

const app = new Hono<{ Variables: Variables }>();

app.post(
  "/",
  zValidator("json", topicBodySchema),
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
        ...body,
        userId: currentUser.id,
      },
    });
    return c.json(
      {
        success: true,
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
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          group: true,
        },
      },
    },
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

app.get("/:topicId", zValidator("param", topicParamSchema), async (c) => {
  const param = c.req.valid("param");
  const topic = await prisma.topic.findUnique({
    where: {
      id: param.topicId,
    },
  });
  if (!topic) {
    throw new HTTPException(404, { message: "Topic not found" });
  }
  return c.json({
    success: true,
    message: "Fetch topic by id",
    data: {
      topic,
    },
  });
});
app.delete(
  "/:topicId",
  zValidator("param", topicParamSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const param = c.req.valid("param");
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
  }
);

app.patch(
  "/:topicId",
  zValidator("param", topicParamSchema),
  zValidator("json", topicBodySchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const param = c.req.valid("param");
    const body = c.req.valid("json");

    await prisma.topic.update({
      where: {
        id: param.topicId,
      },
      data: {
        ...body,
      },
    });
    return c.json(
      {
        success: true,
        message: "Topic updated successfully",
      },
      201
    );
  }
);

app.get("/topic-options", async (c) => {
  const topics = await prisma.topic.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return c.json({
    success: true,
    message: "Fetch topics for dropdown options",
    data: {
      topics,
    },
  });
});
export default app;
