import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ProvidersModule } from './providers/providers.module.js';
// import { RoomsModule } from './rooms/rooms.module.js';

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      type: 'postgres' as const,
      url: config.getOrThrow<string>('DATABASE_URL'),
      autoLoadEntities: true,
      synchronize: false,
    }),
  }),
  AuthModule,
  ProvidersModule,
  // RoomsModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
