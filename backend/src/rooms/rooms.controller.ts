import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/role-decorators.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Role } from '../users/entities/user.entity.js';
import { CreateRoomDTO } from './dto/create-room.dto.js';
import { UpdateRoomDTO } from './dto/update-room.dto.js';
import { RoomsService } from './rooms.service.js';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findRoom(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roomsService.findRoom(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  createRoom(@Body() dto: CreateRoomDTO) {
    return this.roomsService.createRoom(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  updateRoom(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoomDTO,
  ) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  async deleteRoom(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.roomsService.deleteRoom(id);
  }
}