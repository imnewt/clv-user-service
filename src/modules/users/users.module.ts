import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './infrastructure/controllers/users.controller';
import { UsersService } from './services/users.service';
import { RolesModule } from 'src/modules/roles/roles.module';
import { User } from 'src/shared/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
