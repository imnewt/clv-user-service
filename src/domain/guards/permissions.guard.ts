import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { BusinessException } from '../exceptions/business.exception';
import { IUserService } from '../use-cases/user';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { ERROR, jwtConstants, MODULE } from '../utilities/constants';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject(IUserService) private readonly userService: IUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const neededPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!neededPermission) return true;

    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new BusinessException(
          MODULE.GENERIC,
          [ERROR.UNAUTHORIZED],
          HttpStatus.UNAUTHORIZED,
        );
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      const userPermissions = await this.userService.getUserPermissions(
        payload.userId,
      );
      const hasPermission = userPermissions.find(
        (permission) => permission.id === neededPermission,
      );
      if (!hasPermission) {
        throw new BusinessException(
          MODULE.GENERIC,
          [ERROR.NOT_HAVE_PERMISSION],
          HttpStatus.FORBIDDEN,
        );
      }
    } catch {
      throw new BusinessException(
        MODULE.GENERIC,
        [ERROR.NOT_HAVE_PERMISSION],
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
