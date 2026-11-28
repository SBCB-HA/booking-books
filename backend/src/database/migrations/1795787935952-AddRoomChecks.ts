import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomChecks1795787935952 implements MigrationInterface {
    name = 'AddRoomChecks1795787935952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Room" ADD CONSTRAINT "room_opening_grid_check" CHECK (mod(extract(epoch FROM "openTime"), 900) = 0
   AND mod(extract(epoch FROM "closeTime"), 900) = 0
   AND "closeTime" <= TIME '23:45:00')`);
        await queryRunner.query(`ALTER TABLE "Room" ADD CONSTRAINT "room_opening_order_check" CHECK ("openTime" < "closeTime")`);
        await queryRunner.query(`ALTER TABLE "Room" ADD CONSTRAINT "room_price_check" CHECK ("pricePerHour" >= 0 AND "pricePerHour" <= 10000000)`);
        await queryRunner.query(`ALTER TABLE "Room" ADD CONSTRAINT "room_capacity_check" CHECK ("capacity" >= 1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Room" DROP CONSTRAINT "room_capacity_check"`);
        await queryRunner.query(`ALTER TABLE "Room" DROP CONSTRAINT "room_price_check"`);
        await queryRunner.query(`ALTER TABLE "Room" DROP CONSTRAINT "room_opening_order_check"`);
        await queryRunner.query(`ALTER TABLE "Room" DROP CONSTRAINT "room_opening_grid_check"`);
    }

}
