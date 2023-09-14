import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import {
  AuthController,
  UserController,
  RoleController,
  PermissionController,
} from './controllers';
import { IAuthService, AuthService } from '@domain/use-cases/auth';
import { IUserService, UserService } from '@domain/use-cases/user';
import { IRoleService, RoleService } from '@domain/use-cases/role';
import {
  IPermissionService,
  PermissionService,
} from '@domain/use-cases/permission';
import { DomainModule } from '@domain/domain.module';
import { AuthGuard } from '@domain/guards/auth.guard';

@Module({
  imports: [DomainModule],
  controllers: [
    AuthController,
    UserController,
    RoleController,
    PermissionController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IRoleService,
      useClass: RoleService,
    },
    {
      provide: IPermissionService,
      useClass: PermissionService,
    },
  ],
})
export class ApplicationModule {}
