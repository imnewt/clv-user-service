import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './database/configs/database.config';
import { IUserRepository } from '@domain/use-cases/user';
import { IRoleRepository } from '@domain/use-cases/role';
import { IPermissionRepository } from '@domain/use-cases/permission';
import {
  TypeOrmPermissionRepository,
  TypeOrmRoleRepository,
  TypeOrmUserRepository,
} from './database/repositories';

import { Permission, Role, User } from './database/entities';
import { GoogleStrategy } from './auth/google.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  providers: [
    GoogleStrategy,
    {
      provide: IUserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: IRoleRepository,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: IPermissionRepository,
      useClass: TypeOrmPermissionRepository,
    },
  ],
  exports: [
    {
      provide: IUserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: IRoleRepository,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: IPermissionRepository,
      useClass: TypeOrmPermissionRepository,
    },
  ],
})
export class InfrastructureModule {}
