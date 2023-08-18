import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role as RoleEntity } from 'src/typeorm';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity]), PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
