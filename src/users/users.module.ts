import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessProfileModule } from '../access-profile/access-profile.module';
import { PasswordHasher } from '../common/security/password-hasher';
import { Users } from './entities/users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Users]), AccessProfileModule],
	controllers: [UsersController],
	providers: [UsersService, PasswordHasher],
})
export class UsersModule {}
