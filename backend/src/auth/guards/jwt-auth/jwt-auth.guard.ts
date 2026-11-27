import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
type JwtPayLoad = {
  sub : string;
  role : string;
};
export type AuthenticatedRequest = Request & {
  user?: JwtPayLoad;
};
@Injectable()
export class JwtAuthGuard implements CanActivate {
 constructor (private readonly jwtService : JwtService) {}
 async canActivate(context : ExecutionContext) :Promise <boolean> {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

  const token = request.cookies?.access_token;


    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    let payload : JwtPayLoad;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayLoad>(token, {
        algorithms :['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Phien dang nhap khong hop le hoac da het han');
    }

    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    request.user = payload;

    return true;
 }
}
