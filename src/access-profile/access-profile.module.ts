import { Module } from '@nestjs/common';
import { AccessProfileController } from './access-profile.controller';
import { AccessProfileService } from './access-profile.service';

@Module({
	imports: [],
	controllers: [AccessProfileController],
	providers: [AccessProfileService],
})
export class AccessProfileModule {}
