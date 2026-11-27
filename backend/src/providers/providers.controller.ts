import { Body, Controller, Get, Param, Post, Patch, Delete, HttpCode } from '@nestjs/common';
import { ProvidersService } from './providers.service.js';
import { CreateProviderDTO } from './dto/create-provider.dto.js';
import { UpdateProviderDTO } from './dto/update-provider.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/role-decorators.js';
import { UseGuards } from '@nestjs/common';
import { Role } from '../users/entities/user.entity.js';
@Controller('providers')
export class ProvidersController {
       constructor(private readonly providerService: ProvidersService) { }


       @Get()
       findAll() {
              return this.providerService.findAll();
       }
       @Get(':id')
       findId(@Param('id') id: string) {
              return this.providerService.findProvider(id);
       }
       @UseGuards(JwtAuthGuard, RolesGuard)
       @Roles(Role.STAFF, Role.ADMIN)
       @Post()
       create(@Body() dto: CreateProviderDTO) {
              return this.providerService.createProvider(dto);
       }
       @UseGuards(JwtAuthGuard, RolesGuard)
       @Roles(Role.STAFF, Role.ADMIN)
       @Patch(':id')
       updateProvider(
              @Param('id') id: string,
              @Body() dto: UpdateProviderDTO,) {
              return this.providerService.updateProvider(dto, id);
       }
       @UseGuards(JwtAuthGuard, RolesGuard)
       @Roles(Role.STAFF, Role.ADMIN)
       @Delete(':id')
       @HttpCode(204)
       async deleteProvider(@Param('id') id: string): Promise<void> {
              await this.providerService.deleteProvider(id);
       }
}
