import { Hono } from "hono";
import { Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { geoLocationSchema, paginationSchema } from "@/schema";
import { Prisma, prisma } from "@/lib/prisma";
import { paginate, reverseGeocodingAPI } from "@/lib/utils";
import { locationBodySchema } from "./schema";
import { jwt } from "hono/jwt";
import { env } from "@/config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/config/constants";
import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { HTTPException } from "hono/http-exception";

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

app.get("/popular-cities", async (c) => {
  const locations = await prisma.location.findMany({
    take: 5,
    select: {
      id: true,
      city: true,
      _count: {
        select: {
          groups: true,
        },
      },
    },
    orderBy: {
      groups: {
        _count: "desc",
      },
    },
  });
  return c.json({
    success: true,
    message: "Fetch popular cities",
    data: {
      locations,
    },
  });
});

app.get("/discover-cities", async (c) => {
  const locations = await prisma.location.findMany({
    select: {
      id: true,
      city: true,
      country: true,
      _count: {
        select: {
          groups: true,
        },
      },
    },
    orderBy: {
      groups: {
        _count: "desc",
      },
    },
  });

  const results = locations.reduce<{
    [country: string]: string[];
  }>((acc, location) => {
    const { country, city } = location;
    if (country) {
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(city);
    }
    return acc;
  }, {});
  return c.json({
    success: true,
    message: "Fetch popular cities",
    data: {
      locations: results,
    },
  });
});

app.post(
  "/",
  zValidator("json", locationBodySchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const body = c.req.valid("json");
    const locationResp = await reverseGeocodingAPI(
      body.coords[0],
      body.coords[1]
    );

    const { timezone, lat, lon, ...rest } =
      geoLocationSchema.parse(locationResp);

    const location = await prisma.location.findUnique({
      where: {
        lat: new Prisma.Decimal(lat),
        lon: new Prisma.Decimal(lon),
      },
    });

    if (location) {
      throw new HTTPException(400, {
        message: "Coords already exists",
      });
    }

    const newLocation = await prisma.location.create({
      data: {
        ...rest,
        lat: new Prisma.Decimal(lat),
        lon: new Prisma.Decimal(lon),
        timezone: timezone.name,
      },
    });

    return c.json({
      success: true,
      message: "Location created!",
      data: {
        location: newLocation,
      },
    });
  }
);

export default app;
