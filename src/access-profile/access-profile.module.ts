import { Module } from '@nestjs/common';
import { AccessProfileController } from './access-profile.controller';
import { AccessProfileService } from './access-profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessProfile } from './entities/access-profile.entity';

@Module({
	imports: [TypeOrmModule.forFeature([AccessProfile])],
	controllers: [AccessProfileController],
	providers: [AccessProfileService],
	exports: [AccessProfileService],
})
export class AccessProfileModule {}
