import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';

import { AppModule } from './app.module';
import { microserviceConfig } from './shared/configs/microserviceConfig';
import { USER_SERVICE_PORT } from './shared/utilities/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(microserviceConfig);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.use(cors());
  await app.startAllMicroservices();
  await app.listen(USER_SERVICE_PORT);
}
bootstrap();
