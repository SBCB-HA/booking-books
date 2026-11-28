import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Room } from '../rooms/entites/room.entity/room.entity.js';
import { RoomBlock } from './entities/room-block.entity/room-block.entity.js';
import { RoomBlocksService } from './room-blocks.service.js';
import { RoomBlocksController } from './room-blocks.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomBlock, Room]),
    AuthModule,
  ],
  providers: [RoomBlocksService],
  controllers: [RoomBlocksController],
})
export class RoomBlocksModule {}