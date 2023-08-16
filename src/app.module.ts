import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket/socket.module';
import { databaseConfig } from './configs/databaseConfig';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot(databaseConfig),
    SocketModule,
  ],
})
export class AppModule {}
