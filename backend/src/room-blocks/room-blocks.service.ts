import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { Room } from '../rooms/entites/room.entity/room.entity.js';
import { CreateRoomBlockDTO } from './dto/create-room-block.dto.js';
import { RoomBlock } from './entities/room-block.entity/room-block.entity.js';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

@Injectable()
export class RoomBlocksService {
  constructor(
    @InjectRepository(RoomBlock)
    private readonly roomBlocks: Repository<RoomBlock>,
  ) {}

  async createRoomBlock(
    roomId: string,
    dto: CreateRoomBlockDTO,
  ) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    this.validateTimeRange(startAt, endAt);

    try {
      const block = await this.roomBlocks.manager.transaction(
        async (manager) => {
          // Khóa Room trước khi tạo block.
          const room = await manager.getRepository(Room).findOne({
            where: { id: roomId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!room) {
            throw new NotFoundException('Không tìm thấy phòng');
          }

          if (!room.isActive) {
            throw new ConflictException('Phòng đã ngừng hoạt động');
          }

          const repository = manager.getRepository(RoomBlock);

          const newBlock = repository.create({
            id: randomUUID(),
            roomId: room.id,
            startAt,
            endAt,
            reason: dto.reason ?? null,
          });

          return repository.save(newBlock);
        },
      );

      return this.toResponse(block);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          constraint?: string;
        };

        if (
          driverError.code === '23514' &&
          driverError.constraint === 'room_block_time_check'
        ) {
          throw new BadRequestException(
            'Khoảng chặn phải hợp lệ và đúng bước 15 phút',
          );
        }
      }

      throw error;
    }
  }

  async deleteRoomBlock(
    roomId: string,
    blockId: string,
  ): Promise<void> {
    await this.roomBlocks.manager.transaction(async (manager) => {
      // Dùng cùng thứ tự khóa như khi tạo block.
      const room = await manager.getRepository(Room).findOne({
        where: { id: roomId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!room) {
        throw new NotFoundException('Không tìm thấy phòng');
      }

      const result = await manager.getRepository(RoomBlock).delete({
        id: blockId,
        roomId,
      });

      if (!result.affected) {
        throw new NotFoundException(
          'Không tìm thấy khoảng chặn thuộc phòng này',
        );
      }
    });
  }

  private validateTimeRange(startAt: Date, endAt: Date): void {
    const start = startAt.getTime();
    const end = endAt.getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new BadRequestException('Ngày giờ không hợp lệ');
    }

    if (end <= start) {
      throw new BadRequestException(
        'Thời gian kết thúc phải sau thời gian bắt đầu',
      );
    }

    if (
      start % FIFTEEN_MINUTES_MS !== 0 ||
      end % FIFTEEN_MINUTES_MS !== 0
    ) {
      throw new BadRequestException(
        'Thời gian bắt đầu và kết thúc phải đúng bước 15 phút',
      );
    }
  }

  private toResponse(block: RoomBlock) {
    return {
      id: block.id,
      roomId: block.roomId,
      startAt: block.startAt,
      endAt: block.endAt,
      reason: block.reason,
      createdAt: block.createdAt,
    };
  }
}