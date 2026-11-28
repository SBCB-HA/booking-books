import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { Provider } from '../providers/entites/providers.entity.js';
import { Room } from './entites/room.entity/room.entity.js';
import { CreateRoomDTO } from './dto/create-room.dto.js';
import { UpdateRoomDTO } from './dto/update-room.dto.js';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly rooms: Repository<Room>,
  ) {}

  async findAll() {
    const rooms = await this.rooms.find({
      where: {
        isActive: true,
        provider: { isActive: true },
      },
      order: {
        createdAt: 'DESC',
        id: 'ASC',
      },
    });

    return rooms.map((room) => this.toResponse(room));
  }

  async findRoom(id: string) {
    const room = await this.rooms.findOne({
      where: {
        id,
        isActive: true,
        provider: { isActive: true },
      },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng');
    }

    return this.toResponse(room);
  }

  async createRoom(dto: CreateRoomDTO) {
    this.validateOpeningHours(dto.openTime, dto.closeTime);

    try {
      const room = await this.rooms.manager.transaction(async (manager) => {
        await this.assertActiveProvider(manager, dto.providerId);

        const repository = manager.getRepository(Room);

        const newRoom = repository.create({
          id: randomUUID(),
          providerId: dto.providerId,
          name: dto.name,
          description: dto.description ?? null,
          capacity: dto.capacity,
          pricePerHour: dto.pricePerHour,
          openTime: dto.openTime,
          closeTime: dto.closeTime,
          imageUrl: dto.imageUrl ?? null,
          isActive: true,
        });

        return repository.save(newRoom);
      });

      return this.toResponse(room);
    } catch (error) {
      this.rethrowDatabaseError(error);
    }
  }

  async updateRoom(id: string, dto: UpdateRoomDTO) {
    const changes = {
      name: dto.name,
      description: dto.description,
      capacity: dto.capacity,
      pricePerHour: dto.pricePerHour,
      openTime: dto.openTime,
      closeTime: dto.closeTime,
      imageUrl: dto.imageUrl,
    };

    if (!Object.values(changes).some((value) => value !== undefined)) {
      throw new BadRequestException('Cần ít nhất một trường để cập nhật');
    }

    // Chỉ description và imageUrl được phép xóa bằng null
    const { description, imageUrl, ...required } = changes;
    if (Object.values(required).some((value) => value === null)) {
      throw new BadRequestException('Trường bắt buộc không được là null');
    }

    try {
      const room = await this.rooms.manager.transaction(async (manager) => {
        const repository = manager.getRepository(Room);

        const existing = await repository.findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!existing) {
          throw new NotFoundException('Không tìm thấy phòng');
        }

        if (!existing.isActive) {
          throw new ConflictException('Phòng đã ngừng hoạt động');
        }

        await this.assertActiveProvider(manager, existing.providerId);

        this.validateOpeningHours(
          dto.openTime ?? existing.openTime,
          dto.closeTime ?? existing.closeTime,
        );

        const definedChanges = Object.fromEntries(
          Object.entries(changes).filter(([, value]) => value !== undefined),
        );

        await repository.update({ id }, definedChanges);

        return repository.findOneByOrFail({ id });
      });

      return this.toResponse(room);
    } catch (error) {
      this.rethrowDatabaseError(error);
    }
  }

  async deleteRoom(id: string): Promise<void> {
    const result = await this.rooms.update({ id }, { isActive: false });

    if (!result.affected) {
      throw new NotFoundException('Không tìm thấy phòng');
    }
  }

  private async assertActiveProvider(
    manager: EntityManager,
    providerId: string,
  ): Promise<void> {
    const provider = await manager.getRepository(Provider).findOne({
      where: { id: providerId },
      lock: { mode: 'pessimistic_read' },
    });

    if (!provider) {
      throw new NotFoundException('Không tìm thấy Provider');
    }

    if (!provider.isActive) {
      throw new ConflictException('Provider đã ngừng hoạt động');
    }
  }

  private rethrowDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        code?: string;
        constraint?: string;
      };

      if (
        driverError.code === '23514' &&
        driverError.constraint?.startsWith('room_')
      ) {
        throw new BadRequestException(
          'Thông tin phòng vi phạm quy tắc sức chứa, giá hoặc giờ mở cửa',
        );
      }
    }

    throw error;
  }

  private validateOpeningHours(openTime: string, closeTime: string): void {
    // DTO nhận HH:mm; PostgreSQL có thể trả HH:mm:ss.
    const open = openTime.slice(0, 5);
    const close = closeTime.slice(0, 5);

    if (open >= close) {
      throw new BadRequestException(
        'Giờ mở cửa phải trước giờ đóng cửa; chưa hỗ trợ mở qua đêm',
      );
    }
  }

  private toResponse(room: Room) {
    return {
      id: room.id,
      providerId: room.providerId,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      pricePerHour: room.pricePerHour,
      openTime: room.openTime,
      closeTime: room.closeTime,
      imageUrl: room.imageUrl,
      isActive: room.isActive,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}