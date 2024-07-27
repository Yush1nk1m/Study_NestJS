import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const typeORMConfig: TypeOrmModuleOptions = {
  // Database type
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: 'board-app',
  // entities should be loaded for this connection
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  // be careful to use and do not use in production environment
  synchronize: true,
};
