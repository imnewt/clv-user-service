import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { jwtConfig } from './configs/jwtConfig';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [
    JwtModule.register(jwtConfig),
    PassportModule.register({ defaultStrategy: 'google' }),
    InfrastructureModule,
  ],
  exports: [InfrastructureModule],
})
export class DomainModule {}
