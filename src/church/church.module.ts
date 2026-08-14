import { Module } from '@nestjs/common';
import { ChurchService } from './church.service';
import { ChurchController } from './church.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Church } from './entities/church.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Church])],
	controllers: [ChurchController],
	providers: [ChurchService],
})
export class ChurchModule {}
