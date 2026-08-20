import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChurchModule } from './church/church.module';
import { AccessProfileModule } from './access-profile/access-profile.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),

		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DB_HOST'),
				port: configService.get('DB_PORT'),
				username: configService.get('DB_USER'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_NAME'),
				autoLoadEntities: true,
				synchronize: false,
			}),
		}),

		ChurchModule,
		AccessProfileModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
