import { JwtModuleOptions } from '@nestjs/jwt';

import { jwtConstants } from 'src/shared/utilities/constants';

export const jwtConfig: JwtModuleOptions = {
  global: true,
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '15m' },
};
