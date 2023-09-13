import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { jwtConfig } from './configs/jwtConfig';
import { GoogleStrategy } from './strategies/google.strategy';
import { TypeOrmPersistenceModule } from '@infrastructure/persistence/typeorm/typeorm.module';

@Module({
  imports: [
    JwtModule.register(jwtConfig),
    PassportModule.register({ defaultStrategy: 'google' }),
    TypeOrmPersistenceModule,
  ],
  providers: [GoogleStrategy],
  exports: [TypeOrmPersistenceModule],
})
export class DomainModule {}
