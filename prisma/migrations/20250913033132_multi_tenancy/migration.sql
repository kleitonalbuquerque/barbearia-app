/*
  Warnings:

  - You are about to drop the column `barber_id` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `actor_barber_id` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the `barber` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `professional_id` to the `appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `service_type` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."appointment" DROP CONSTRAINT "appointment_barber_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."audit_log" DROP CONSTRAINT "audit_log_actor_barber_id_fkey";

-- AlterTable
ALTER TABLE "public"."appointment" DROP COLUMN "barber_id",
ADD COLUMN     "professional_id" TEXT NULL,
ADD COLUMN     "tenant_id" TEXT NULL;

-- AlterTable
ALTER TABLE "public"."audit_log" DROP COLUMN "actor_barber_id",
ADD COLUMN     "actor_professional_id" TEXT;

-- AlterTable
ALTER TABLE "public"."client" ADD COLUMN     "tenant_id" TEXT NULL;

-- AlterTable
ALTER TABLE "public"."service_type" ADD COLUMN     "tenant_id" TEXT NULL;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "tenant_id" TEXT NULL;

-- DropTable
DROP TABLE "public"."barber";

-- CreateTable
CREATE TABLE "public"."tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "branding" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professional" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "cnpj" TEXT,
    "status" "public"."status" NOT NULL DEFAULT 'ACTIVE',
    "tenant_id" TEXT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_subdomain_key" ON "public"."tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "professional_email_key" ON "public"."professional"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professional_cpf_key" ON "public"."professional"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "professional_cnpj_key" ON "public"."professional"("cnpj");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional" ADD CONSTRAINT "professional_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client" ADD CONSTRAINT "client_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_type" ADD CONSTRAINT "service_type_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_actor_professional_id_fkey" FOREIGN KEY ("actor_professional_id") REFERENCES "public"."professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
