import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service.js';
import { ProvidersController } from './providers.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entites/providers.entity.js';
import { AuthModule } from '../auth/auth.module.js';
@Module({
    imports: [TypeOrmModule.forFeature([Provider]), AuthModule],
  providers: [ProvidersService],
  controllers: [ProvidersController]
})
export class ProvidersModule {}
