import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProvider1795677764575 implements MigrationInterface {
    name = 'CreateProvider1795677764575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."User_email_key"`);
        await queryRunner.query(`CREATE TABLE "Providers" ("id" text NOT NULL, "name" text NOT NULL, "description" text, "email" text NOT NULL, "phone" text NOT NULL, "address" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_7d76ccd70ef055a7f10b66651f4" UNIQUE ("email"), CONSTRAINT "UQ_ca242a21ca259c9102d5f9f5a24" UNIQUE ("phone"), CONSTRAINT "PK_ba713b4031b80d9fcb5fab04641" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e"`);
        await queryRunner.query(`DROP TABLE "Providers"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email") `);
    }

}
