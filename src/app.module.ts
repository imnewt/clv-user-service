import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SocketModule } from './modules/socket/socket.module';
import { databaseConfig } from './configs/databaseConfig';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot(databaseConfig),
    SocketModule,
    RolesModule,
    PermissionsModule,
  ],
})
export class AppModule {}
