import { Hono } from "hono";
import { Variables } from "../../types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAuthenticated } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { createGroupSchema } from "./schema";
import { reverseGeocodingAPI } from "../../lib/utils";
import { prisma } from "../../lib/prisma";
import { geoLocationSchema } from "../../schema";

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
      },
    });

    return c.json(
      {
        status: true,
        message: "Group created successfully",
        data: {
          group,
        },
      },
      201
    );
  }
);
export default app;
