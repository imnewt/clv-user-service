import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { USER_SERVICE_PORT } from './utils/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(USER_SERVICE_PORT);
}
bootstrap();
