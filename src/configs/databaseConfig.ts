import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

import entities from 'src/typeorm';

config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities,
  synchronize: true,
};
