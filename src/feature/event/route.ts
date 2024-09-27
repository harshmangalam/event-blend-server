import { Hono } from "hono";
import { Variables } from "../../types";
import { zValidator } from "@hono/zod-validator";
import { geoLocationSchema, paginationSchema } from "../../schema";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAdmin, isAuthenticated } from "../../middleware/auth";
import { prisma, Prisma } from "../../lib/prisma";
import { paginate, reverseGeocodingAPI } from "../../lib/utils";
import { createEventSchema, eventParamSchema } from "./schema";
import { HTTPException } from "hono/http-exception";

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
    const totalCount = await prisma.event.count();
    const totalPages = Math.ceil(totalCount / query.pageSize);

    const [take, skip] = paginate(query.page, query.pageSize);
    const events = await prisma.event.findMany({
      take,
      skip,
      include: {
        _count: {
          select: {
            attendees: true,
            dates: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        topics: true,
        location: true,
        dates: true,
      },
    });

    return c.json({
      success: true,
      message: "Fetch events",
      data: { events },
      meta: {
        totalCount,
        totalPages,
        page: query.page,
        pageSize: query.pageSize,
      },
    });
  }
);

app.get(
  "/:id",
  zValidator("param", eventParamSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const param = c.req.valid("param");
    const event = await prisma.event.findUnique({
      where: {
        id: param.id,
      },
      include: {
        group: {
          select: {
            name: true,
            slug: true,
            poster: true,
            admin: {
              select: {
                profilePhoto: true,
                name: true,
                id: true,
              },
            },
          },
        },
        dates: true,
        location: true,
      },
    });

    return c.json({
      success: true,
      message: "Fetch events",
      data: { event },
    });
  }
);

app.post(
  "/",
  zValidator("json", createEventSchema),
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
        lat: new Prisma.Decimal(lat),
        lon: new Prisma.Decimal(lon),
      },
    });

    let locationId = location?.id;

    if (!location) {
      const newLocation = await prisma.location.create({
        data: {
          ...rest,
          lat: new Prisma.Decimal(lat),
          lon: new Prisma.Decimal(lon),
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

    const event = await prisma.event.create({
      data: {
        name: body.name,
        address: body.address,
        details: body.details,
        groupId: body.groupId,
        poster: body.poster,
        locationId,
        dates: {
          createMany: {
            data: body.dates.map((date) => ({
              endDate: new Date(date.endDate),
              startDate: new Date(date.startDate),
            })),
          },
        },
        categoryId: body.categoryId,
      },
    });

    return c.json({
      success: true,
      message: "Created new event",
      data: {
        event,
      },
    });
  }
);

app.get("/popular-events", async (c) => {
  const events = await prisma.event.findMany({
    take: 4,
    orderBy: {
      attendees: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: {
          attendees: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
          slug: true,
          admin: {
            select: {
              profilePhoto: true,
              id: true,
              name: true,
            },
          },
        },
      },
      topics: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
      location: {
        select: {
          id: true,
          city: true,
        },
      },
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    message: "Popular events",
    data: { events },
  });
});

app.get("/discover-events", async (c) => {
  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: {
          attendees: true,
        },
      },
      dates: true,
      group: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },

      category: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return c.json({
    success: true,
    message: "Discover events",
    data: { events },
  });
});
export default app;
