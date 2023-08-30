import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsController } from './infrastructure/controllers/permissions.controller';
import { PermissionsService } from './services/permissions.service';
import { UsersModule } from '@users/users.module';
import { Permission as PermissionEntity } from '@shared/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionEntity]),
    forwardRef(() => UsersModule),
  ],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}
