import { categories, groups, locations } from "@/data/seed";
import { getGravatarUrl } from "@/lib/utils";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createUsers(role: "User" | "Admin", total: number = 10) {
  try {
    const password = await Bun.password.hash("123456", {
      algorithm: "bcrypt",
      cost: 8,
    });

    const length = total;

    const users = Array.from({ length }, (_, i) => {
      const email =
        role === "Admin"
          ? `admin${length + i + 1}@eventblend.com`
          : `user${length + i + 1}@eventblend.com`;

      return {
        name:
          role === "Admin" ? `Admin${length + i + 1}` : `User${length + i + 1}`,
        email: email,
        password,
        bio: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis, laudantium neque quidem enim eligendi placeat a accusamus corrupti voluptatum suscipit doloribus est, dicta, natus recusandae! Fugit dolorum animi laborum fuga. ${
          i + 1
        }`,
        profilePhoto: getGravatarUrl(email),
        role,
      };
    });

    await prisma.user.createMany({
      data: users,
    });
    return true;
  } catch (error) {
    console.log(error);
    return error;
  }
}
async function createCategories() {
  try {
    for await (const c of categories) {
      await prisma.category.create({
        data: c,
      });
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function createGroups() {
  await prisma.groupMember.deleteMany();
  for (const g of groups) {
    const { members = [], ...rest } = g;
    const group = await prisma.group.create({
      data: rest,
    });
    if (members.length) {
      for (const member of members) {
        await prisma.groupMember.create({
          data: {
            group: {
              connect: {
                id: group.id,
              },
            },
            role: member.role,
            user: {
              connect: {
                email: member.email,
              },
            },
          },
        });
      }
    }
  }
}
async function createLocations() {
  await prisma.location.createMany({
    data: locations,
  });
}

const usersData = await createUsers("User", 50);
await createUsers("Admin", 5);
await createLocations();
const catoriesData = await createCategories();
if (catoriesData && usersData) {
  await createGroups();
}
