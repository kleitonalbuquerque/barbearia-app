-- DropForeignKey
ALTER TABLE "public"."appointment" DROP CONSTRAINT "appointment_client_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."appointment" DROP CONSTRAINT "appointment_professional_id_fkey";

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
ALTER TABLE "public"."appointment" ALTER COLUMN "client_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional" ADD CONSTRAINT "professional_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client" ADD CONSTRAINT "client_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_type" ADD CONSTRAINT "service_type_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
