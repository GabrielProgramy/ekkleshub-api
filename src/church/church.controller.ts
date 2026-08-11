import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Controller('church')
export class ChurchController {
	constructor(private readonly churchService: ChurchService) {}

	@Post()
	create(@Body() createChurchDto: CreateChurchDto) {
		return this.churchService.create(createChurchDto);
	}

	@Get()
	findAll() {
		return this.churchService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.churchService.findOneOrFail(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateChurchDto: UpdateChurchDto) {
		return this.churchService.update(id, updateChurchDto);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch(':id/close')
	async close(@Param('id') id: string) {
		await this.churchService.close(id);
	}
}
