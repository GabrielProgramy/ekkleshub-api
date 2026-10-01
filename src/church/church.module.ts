import { Module } from '@nestjs/common';
import { ChurchService } from './church.service';
import { ChurchController } from './church.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Church } from './entities/church.entity';
import { AccessProfileModule } from '../access-profile/access-profile.module';

@Module({
	imports: [TypeOrmModule.forFeature([Church]), AccessProfileModule],
	controllers: [ChurchController],
	providers: [ChurchService],
})
export class ChurchModule {}
