import { Controller, Query, Get, Body, Post, HttpCode, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from './guards/jwt-auth/jwt-auth.guard.js';
import type { Response } from 'express';
@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService,
      private readonly configService: ConfigService,
   ) { }

   @Get('by-email')
   findByEmail(@Query('email') email: string) {
      return this.authService.findByEmail(email);
   }
   @Post('register')
   register(@Body() dto: RegisterDTO) {
      return this.authService.register(dto);
   }
   @Post('login')
   async login(@Body() dto: LoginDTO,
      @Res({ passthrough: true }) respone: Response) {

      const result = await this.authService.login(dto);

      respone.cookie('access_token', result.accessToken, {
         httpOnly: true,
         secure: this.configService.get<string>('NODE_ENV') === 'production',
         sameSite: 'lax',
         path: '/',
         maxAge: 30 * 60 * 1000, // 30p
      });
      return {
         user: result.user,
      };
   }
   @Get('me')
   @UseGuards(JwtAuthGuard)
   getProfile(@Req() request: AuthenticatedRequest) {
      return this.authService.getProfile(request.user!.sub);

   }
   @Post('logout')
   @HttpCode(200)
   logout(@Res({ passthrough: true }) response: Response) {
      response.clearCookie('access_token', {
         httpOnly: true,
         secure: this.configService.get<string>('NODE_ENV') === 'production',
         sameSite: 'lax',
         path: '/',
      });

      return {
         message: 'Đăng xuất thành công',
      };
   }
}
