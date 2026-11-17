import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	HttpCode,
	HttpStatus,
	Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/types/authenticated-user';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Controller('church')
export class ChurchController {
	constructor(private readonly churchService: ChurchService) {}

	@Post()
	create(
		@Body() createChurchDto: CreateChurchDto,
		@Req() request?: AuthenticatedRequest,
	) {
		return this.churchService.create(
			createChurchDto,
			request?.user,
			request?.permissions,
		);
	}

	@Get()
	findAll(@Req() request?: AuthenticatedRequest) {
		return this.churchService.findAll(request?.user, request?.permissions);
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() request?: AuthenticatedRequest) {
		return this.churchService.findOneOrFail(
			id,
			request?.user,
			request?.permissions,
		);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateChurchDto: UpdateChurchDto,
		@Req() request?: AuthenticatedRequest,
	) {
		return this.churchService.update(
			id,
			updateChurchDto,
			request?.user,
			request?.permissions,
		);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch(':id/close')
	async close(@Param('id') id: string, @Req() request?: AuthenticatedRequest) {
		await this.churchService.close(id, request?.user, request?.permissions);
	}
}
