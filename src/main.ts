import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';

import { AppModule } from './app.module';
import { microserviceConfig } from './configs/microserviceConfig';
import { USER_SERVICE_PORT } from './utils/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.connectMicroservice(microserviceConfig);
  app.setGlobalPrefix('api');
  app.use(cors());
  // await app.startAllMicroservices();
  await app.listen(USER_SERVICE_PORT);
}
bootstrap();
