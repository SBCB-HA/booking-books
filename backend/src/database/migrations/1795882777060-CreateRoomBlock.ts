import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoomBlock1795882777060 implements MigrationInterface {
    name = 'CreateRoomBlock1795882777060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "RoomBlock" ("id" text NOT NULL, "roomId" text NOT NULL, "startAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "endAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "reason" text, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "room_block_time_check" CHECK (isfinite("startAt")
   AND isfinite("endAt")
   AND "endAt" > "startAt"
   AND mod(extract(epoch FROM "startAt"), 900) = 0
   AND mod(extract(epoch FROM "endAt"), 900) = 0), CONSTRAINT "PK_f1aedc7faee278eb244d67cb556" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "room_block_room_start_idx" ON "RoomBlock"  ("roomId", "startAt") `);
        await queryRunner.query(`ALTER TABLE "RoomBlock" ADD CONSTRAINT "FK_a6ea579c8e66414fc5c78d89e4f" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "RoomBlock" DROP CONSTRAINT "FK_a6ea579c8e66414fc5c78d89e4f"`);
        await queryRunner.query(`DROP INDEX "public"."room_block_room_start_idx"`);
        await queryRunner.query(`DROP TABLE "RoomBlock"`);
    }

}
