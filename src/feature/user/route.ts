import { ACCESS_TOKEN_COOKIE_NAME } from "@/config/constants";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { paginate } from "@/lib/utils";
import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { paginationSchema } from "@/schema";
import { Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { editProfileBodySchema, profileIdParamSchema } from "./schema";

const app = new Hono<{ Variables: Variables }>();
app.patch(
  "/edit-profile",
  zValidator("json", editProfileBodySchema),
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        bio: body.bio,
      },
    });
    return c.json({
      success: true,
      message: "Edid profile successfully",
    });
  }
);
app.get(
  "/",
  zValidator("query", paginationSchema),
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const query = c.req.valid("query");
    const totalCount = await prisma.user.count();
    const totalPages = Math.ceil(totalCount / query.pageSize);
    const [take, skip] = paginate(query.page, query.pageSize);
    const users = await prisma.user.findMany({
      take,
      skip,
      include: {
        _count: {
          select: {
            events: true,
            followingTopics: true,
            groupsAdmin: true,
            members: true,
          },
        },
      },
    });
    return c.json({
      success: true,
      message: "Fetch users",
      data: {
        users,
        meta: {
          totalCount,
          totalPages,
          page: query.page,
          pageSize: query.pageSize,
        },
      },
    });
  }
);
app.get(
  "/:id/details",
  zValidator("param", profileIdParamSchema),
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    const param = c.req.valid("param");

    const user = await prisma.user.findUnique({
      where: {
        id: param.id,
      },
      include: {
        _count: {
          select: {
            followingTopics: true,
            members: true,
            events: true,
          },
        },
        followingTopics: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        members: {
          select: {
            id: true,
            role: true,
            group: {
              select: {
                id: true,
                name: true,
                slug: true,
                poster: true,
              },
            },
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Fetch user by id",
      data: {
        user,
      },
    });
  }
);
export default app;
