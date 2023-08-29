import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesModule } from 'src/modules/roles/roles.module';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthGuard } from './infrastructure/guards/auth.guard';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';

import { jwtConfig } from 'src/shared/configs/jwtConfig';
import { User } from 'src/shared/entities';

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
