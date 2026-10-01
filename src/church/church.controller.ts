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
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Controller('church')
export class ChurchController {
	constructor(private readonly churchService: ChurchService) {}

	@Post()
	create(
		@Body() createChurchDto: CreateChurchDto,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.churchService.create(createChurchDto, request?.user);
	}

	@Get()
	findAll(@Req() request?: Request & { user?: AuthenticatedUser }) {
		return this.churchService.findAll(request?.user);
	}

	@Get(':id')
	findOne(
		@Param('id') id: string,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.churchService.findOneOrFail(id, request?.user);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateChurchDto: UpdateChurchDto,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.churchService.update(id, updateChurchDto, request?.user);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch(':id/close')
	async close(
		@Param('id') id: string,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		await this.churchService.close(id, request?.user);
	}
}
