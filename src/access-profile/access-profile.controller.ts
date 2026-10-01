import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AccessProfileService } from './access-profile.service';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';

@Controller('access-profile')
export class AccessProfileController {
	constructor(private readonly accessProfileService: AccessProfileService) {}

	@Post()
	create(
		@Body() createAccessProfileDto: CreateAccessProfileDto,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.accessProfileService.create(
			createAccessProfileDto,
			request?.user,
		);
	}

	@Get()
	findAll(@Req() request?: Request & { user?: AuthenticatedUser }) {
		return this.accessProfileService.findAll(request?.user);
	}

	@Get(':id')
	findOne(
		@Param('id') accessProfileId: string,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.accessProfileService.findOneOrFail(
			accessProfileId,
			request?.user,
		);
	}

	@Patch(':id')
	update(
		@Param('id') accessProfileId: string,
		@Body() updateDataDto: UpdateAccessProfileDto,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.accessProfileService.update(
			accessProfileId,
			updateDataDto,
			request?.user,
		);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	async deleteOne(
		@Param('id') accessProfileId: string,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		await this.accessProfileService.deleteOne(accessProfileId, request?.user);
	}
}
