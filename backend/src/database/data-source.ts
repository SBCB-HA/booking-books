import 'reflect-metadata';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Provider } from '../providers/entites/providers.entity.js';
import { Room } from '../rooms/entites/room.entity/room.entity.js';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Thiếu DATABASE_URL');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User, Provider,Room],
  migrations: [
    fileURLToPath(new URL('./migrations/*.js', import.meta.url)),
  ],
  synchronize: false,
});