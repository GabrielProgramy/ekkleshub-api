import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';

@Module({
	imports: [ConfigModule, UsersModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [
		AuthService,
		AuthGuard,
		{
			provide: APP_GUARD,
			useExisting: AuthGuard,
		},
	],
	exports: [AuthGuard],
})
export class AuthModule {}
