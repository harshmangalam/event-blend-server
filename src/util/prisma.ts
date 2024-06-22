import { PrismaClient } from "@prisma/client/edge";

export const getPrisma = (database_url: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  });
  return prisma;
};
