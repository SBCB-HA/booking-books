import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { Repository } from 'typeorm';
import { Role, User } from '../../../users/entities/user.entity.js';

export type AuthenticatedRequest = Request & {
  user?: {
    sub: string;
    role: Role;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const token = request.cookies?.access_token;

    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    let payload: { sub?: unknown };

    try {
      payload = await this.jwtService.verifyAsync<{ sub?: unknown }>(
        token,
        { algorithms: ['HS256'] },
      );
    } catch {
      throw new UnauthorizedException(
        'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      );
    }

    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const user = await this.users.findOne({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không hoạt động');
    }

    request.user = {
      sub: user.id,
      role: user.role,
    };

    return true;
  }
}