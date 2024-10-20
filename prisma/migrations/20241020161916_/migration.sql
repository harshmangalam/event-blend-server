/*
  Warnings:

  - The values [EventOrganizer,AssistantOrganizer] on the enum `GroupMemberRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GroupMemberRole_new" AS ENUM ('Member', 'Organizer', 'CoOrganizer');
ALTER TABLE "GroupMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "GroupMember" ALTER COLUMN "role" TYPE "GroupMemberRole_new" USING ("role"::text::"GroupMemberRole_new");
ALTER TYPE "GroupMemberRole" RENAME TO "GroupMemberRole_old";
ALTER TYPE "GroupMemberRole_new" RENAME TO "GroupMemberRole";
DROP TYPE "GroupMemberRole_old";
ALTER TABLE "GroupMember" ALTER COLUMN "role" SET DEFAULT 'Member';
COMMIT;
