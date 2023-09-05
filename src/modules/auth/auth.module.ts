import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesModule } from '@roles/roles.module';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '@users/users.module';
import { UsersService } from '@users/services/users.service';

import { jwtConfig } from '@shared/configs/jwtConfig';
import { User } from '@shared/entities';

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
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
