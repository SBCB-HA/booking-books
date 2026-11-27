import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // bo cac truong khong co trong DTO
      forbidNonWhitelisted: true, // Co truong la thi tra 400 thay vi bo qua
      transform: true, // tu chuyen body/query thanh instance DTO
      transformOptions: { enableImplicitConversion: true }, // '10' -> 10 cho query nhu PageSize
    }),

  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
