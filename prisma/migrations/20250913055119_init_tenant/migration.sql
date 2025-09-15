/*
  Warnings:

  - Made the column `tenant_id` on table `appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenant_id` on table `client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenant_id` on table `professional` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenant_id` on table `service_type` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenant_id` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."appointment" DROP CONSTRAINT "appointment_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."client" DROP CONSTRAINT "client_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."professional" DROP CONSTRAINT "professional_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_type" DROP CONSTRAINT "service_type_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_tenant_id_fkey";

-- AlterTable
ALTER TABLE "public"."appointment" ALTER COLUMN "tenant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."client" ALTER COLUMN "tenant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."professional" ALTER COLUMN "tenant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."service_type" ALTER COLUMN "tenant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "tenant_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional" ADD CONSTRAINT "professional_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client" ADD CONSTRAINT "client_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_type" ADD CONSTRAINT "service_type_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
