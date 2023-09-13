import { Module } from '@nestjs/common';

import {
  AuthController,
  UserController,
  RoleController,
  PermissionController,
} from './controllers';
import {
  IAuthService,
  IUserService,
  IRoleService,
  IPermissionService,
} from '@domain/interfaces/services';
import {
  AuthService,
  UserService,
  RoleService,
  PermissionService,
} from '@domain/services';
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
