import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Rol } from 'src/security/rol/entities/rol.entity';
import { Traza } from 'src/security/trazas/entities/traza.entity';

//import
import { Categoria } from 'src/tienda/categoria/entities/categoria.entity';
import { Producto } from 'src/tienda/producto/entities/producto.entity';
import { Configuration } from './src/config/configuration/entities/configuration.entity';
import { User } from './src/security/user/entities/user.entity';
import { Notification } from './src/notify/notifications/entities/notification.entity';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // entities: ['src/**/entities/*.entity.ts'],

  entities: [
    Traza,
    Rol,


    //////------- New tables
    Categoria,
    Producto,
    Configuration,
    User,
    Notification,

  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
};

export default config;
