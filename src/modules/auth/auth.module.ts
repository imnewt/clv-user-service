import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/typeorm';
import { UsersService } from 'src/modules/users/users.service';
import { RolesModule } from 'src/modules/roles/roles.module';
import { jwtConfig } from 'src/configs/jwtConfig';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register(jwtConfig),
    PassportModule.register({ defaultStrategy: 'google' }),
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    {
      provide: 'USER_SERVICE',
      useClass: UsersService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
