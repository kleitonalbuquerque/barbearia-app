-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "public"."status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."payment_allowed" AS ENUM ('CASH', 'PIX', 'CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "public"."appointment_status" AS ENUM ('SCHEDULED', 'CANCELED', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."user_role" NOT NULL DEFAULT 'ADMIN',
    "phone" TEXT NOT NULL,
    "cpf" TEXT,
    "cnpj" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."barber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf" TEXT,
    "cnpj" TEXT,
    "status" "public"."status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "price_cents" DOUBLE PRECISION NOT NULL,
    "payment_allowed" "public"."payment_allowed"[],
    "counts_as_haircut" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment" (
    "id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."appointment_status" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment_item" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "service_type_id" TEXT NOT NULL,
    "price_cents_snapshot" INTEGER NOT NULL,
    "duration_minutes_snapshot" INTEGER NOT NULL,

    CONSTRAINT "appointment_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "method" "public"."payment_allowed" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" TEXT NOT NULL,
    "actor_barber_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_cpf_key" ON "public"."user"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "user_cnpj_key" ON "public"."user"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "barber_email_key" ON "public"."barber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "barber_cpf_key" ON "public"."barber"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "barber_cnpj_key" ON "public"."barber"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "public"."client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_cpf_key" ON "public"."client"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "payment_appointment_id_key" ON "public"."payment"("appointment_id");

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "public"."barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_item" ADD CONSTRAINT "appointment_item_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_item" ADD CONSTRAINT "appointment_item_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_actor_barber_id_fkey" FOREIGN KEY ("actor_barber_id") REFERENCES "public"."barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

