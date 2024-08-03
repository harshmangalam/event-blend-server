import { User } from "@prisma/client";

export type Variables = {
  user: Pick<User, "id" | "email" | "role" | "name">;
};
