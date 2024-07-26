import { Hono } from "hono";
import { Variables } from "../../types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAuthenticated } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { createGroupSchema, groupParamSchema } from "./schema";
import { paginate, reverseGeocodingAPI } from "../../lib/utils";
import { prisma, Prisma } from "../../lib/prisma";
import { geoLocationSchema, paginationSchema } from "../../schema";
import { HTTPException } from "hono/http-exception";

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
    const locationResp = await reverseGeocodingAPI(
      body.location[0],
      body.location[1]
    );
    const { timezone, lat, lon, ...rest } =
      geoLocationSchema.parse(locationResp);

    const location = await prisma.location.findFirst({
      where: {
        lat: lat,
        lon: lon,
      },
    });

    let locationId = location?.id;

    if (!location) {
      const newLocation = await prisma.location.create({
        data: {
          ...rest,
          lat,
          lon,
          timezone: timezone.name,
        },
      });

      locationId = newLocation.id;
    }

    if (!locationId) {
      throw new HTTPException(400, {
        message: "Location not found",
      });
    }

    const currentUser = c.get("user");

    const group = await prisma.group.create({
      data: {
        name: body.name,
        description: body.description,
        locationId,
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
        network: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            city: true,
            state: true,
            country: true,
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

app.delete("/:groupId", zValidator("param", groupParamSchema), async (c) => {
  const param = c.req.valid("param");

  await prisma.group.delete({
    where: {
      id: param.groupId,
    },
  });
  return c.json(
    {
      success: true,
      message: "Group deleted successfully",
    },
    201
  );
});

app.get("/popular-groups", async (c) => {
  const groups = await prisma.group.findMany({
    take: 4,
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
        },
      },
      topics: {
        select: {
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          city: true,
          state: true,
          country: true,
        },
      },
    },
    orderBy: {
      members: {
        _count: "desc",
      },
    },
  });

  return c.json({
    success: true,
    message: "Fetch popular groups",
    data: { groups },
  });
});

app.get("/discover-groups", async (c) => {
  const groups = await prisma.group.findMany({
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
        },
      },
      topics: {
        select: {
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          city: true,
          state: true,
          country: true,
        },
      },
    },
    orderBy: {
      members: {
        _count: "desc",
      },
    },
  });

  return c.json({
    success: true,
    message: "Discover groups",
    data: { groups },
  });
});

export default app;
