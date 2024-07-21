import { Hono } from "hono";
import { Variables } from "../../types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAuthenticated } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { createGroupSchema } from "./schema";
import { paginate, reverseGeocodingAPI } from "../../lib/utils";
import { prisma } from "../../lib/prisma";
import { geoLocationSchema, paginationSchema } from "../../schema";

const app = new Hono<{ Variables: Variables }>();

app.post(
  "/",
  zValidator("json", createGroupSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    const body = c.req.valid("json");
    const [lat, lon] = body.location;
    const locationResp = await reverseGeocodingAPI(lat, lon);
    const location = geoLocationSchema.parse(locationResp);
    const currentUser = c.get("user");

    const group = await prisma.group.create({
      data: {
        name: body.name,
        description: body.description,
        location,
        topics: {
          connect: body.topics.map((topicId) => ({
            id: topicId,
          })),
        },
        adminId: currentUser.id,
        networkId: body.networkId,
      },
    });

    return c.json(
      {
        success: true,
        message: "Group created successfully",
        data: {
          group,
        },
      },
      201
    );
  }
);
app.get(
  "/",
  zValidator("query", paginationSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    const query = c.req.valid("query");
    const totalCount = await prisma.group.count();
    const totalPages = Math.ceil(totalCount / query.pageSize);

    const [take, skip] = paginate(query.page, query.pageSize);
    const groups = await prisma.group.findMany({
      take,
      skip,
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        topics: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Fetch groups",
      data: { groups },
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
