import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AccessProfileModule } from '../access-profile/access-profile.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthorizationGuard } from './guards/authorization.guard';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';

@Module({
	imports: [
		ConfigModule,
		UsersModule,
		AccessProfileModule,
		JwtModule.register({}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		AuthGuard,
		{
			provide: APP_GUARD,
			useExisting: AuthGuard,
		},
		AuthorizationGuard,
		{
			provide: APP_GUARD,
			useExisting: AuthorizationGuard,
		},
	],
	exports: [AuthGuard],
})
export class AuthModule {}
