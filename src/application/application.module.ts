import { Module } from '@nestjs/common';

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
