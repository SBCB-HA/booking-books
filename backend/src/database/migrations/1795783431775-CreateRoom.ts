import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoom1795783431775 implements MigrationInterface {
    name = 'CreateRoom1795783431775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Room" ("id" text NOT NULL, "providerId" text NOT NULL, "name" text NOT NULL, "description" text, "capacity" integer NOT NULL, "pricePerHour" integer NOT NULL, "openTime" TIME NOT NULL, "closeTime" TIME NOT NULL, "imageUrl" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_867d589be92524f89375e2e086d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Room" ADD CONSTRAINT "FK_98b3c01155eda42006b74c14545" FOREIGN KEY ("providerId") REFERENCES "Providers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Room" DROP CONSTRAINT "FK_98b3c01155eda42006b74c14545"`);
        await queryRunner.query(`DROP TABLE "Room"`);
    }

}
