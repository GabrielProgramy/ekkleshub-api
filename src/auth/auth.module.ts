import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';

@Module({
	imports: [ConfigModule, UsersModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, AuthGuard],
	exports: [AuthGuard],
})
export class AuthModule {}
