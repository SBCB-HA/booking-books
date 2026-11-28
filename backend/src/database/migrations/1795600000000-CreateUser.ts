import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1795600000000 implements MigrationInterface {
  name = 'CreateUser1795600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."Role"
      AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN')
    `);

    await queryRunner.query(`
      CREATE TABLE "User" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "User_email_key"
      ON "User" ("email")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "User"`);
    await queryRunner.query(`DROP TYPE "public"."Role"`);
  }
}