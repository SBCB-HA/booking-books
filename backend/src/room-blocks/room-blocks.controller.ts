import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/role-decorators.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Role } from '../users/entities/user.entity.js';
import { CreateRoomBlockDTO } from './dto/create-room-block.dto.js';
import { RoomBlocksService } from './room-blocks.service.js';

@Controller('rooms/:roomId/blocks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class RoomBlocksController {
  constructor(
    private readonly roomBlocksService: RoomBlocksService,
  ) {}

  @Post()
  createRoomBlock(
    @Param('roomId', new ParseUUIDPipe()) roomId: string,
    @Body() dto: CreateRoomBlockDTO,
  ) {
    return this.roomBlocksService.createRoomBlock(roomId, dto);
  }

  @Delete(':blockId')
  @HttpCode(204)
  async deleteRoomBlock(
    @Param('roomId', new ParseUUIDPipe()) roomId: string,
    @Param('blockId', new ParseUUIDPipe()) blockId: string,
  ): Promise<void> {
    await this.roomBlocksService.deleteRoomBlock(roomId, blockId);
  }
}