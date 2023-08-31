import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';

import { AppModule } from './app.module';
import { microserviceConfig } from '@shared/configs/microserviceConfig';
import { USER_SERVICE_PORT } from '@shared/utilities/constants';
import { CustomExceptionFilter } from '@shared/filters/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(microserviceConfig);
  app.useGlobalFilters(new CustomExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.use(cors());
  await app.startAllMicroservices();
  await app.listen(USER_SERVICE_PORT);
}
bootstrap();
