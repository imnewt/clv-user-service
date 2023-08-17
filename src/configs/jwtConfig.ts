import { JwtModuleOptions } from '@nestjs/jwt';

import { jwtConstants } from 'src/utils/constants';

export const jwtConfig: JwtModuleOptions = {
  global: true,
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '15m' },
};
