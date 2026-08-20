import 'dotenv/config';
import { Church } from '../church/entities/church.entity';
import { DataSource } from 'typeorm';
import { AccessProfile } from '../access-profile/entities/access-profile.entity';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	entities: [Church, AccessProfile],
	migrations: ['src/database/migrations/*.ts'],
	synchronize: false,
});
