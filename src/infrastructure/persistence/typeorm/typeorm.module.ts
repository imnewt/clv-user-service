import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  IUserRepository,
  IRoleRepository,
  IPermissionRepository,
} from '@domain/interfaces/repositories';
import { User, Role, Permission } from './entities';
import {
  TypeOrmUserRepository,
  TypeOrmRoleRepository,
  TypeOrmPermissionRepository,
} from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  providers: [
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
export class TypeOrmPersistenceModule {}
