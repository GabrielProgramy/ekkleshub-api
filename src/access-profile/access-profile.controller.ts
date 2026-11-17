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
import { AccessProfileService } from './access-profile.service';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-user';

@Controller('access-profile')
export class AccessProfileController {
	constructor(private readonly accessProfileService: AccessProfileService) {}

	@Post()
	create(
		@Body() createAccessProfileDto: CreateAccessProfileDto,
		@Req() request?: AuthenticatedRequest,
	) {
		return this.accessProfileService.create(
			createAccessProfileDto,
			request?.user,
			request?.permissions,
		);
	}

	@Get()
	findAll(@Req() request?: AuthenticatedRequest) {
		return this.accessProfileService.findAll(
			request?.user,
			request?.permissions,
		);
	}

	@Get(':id')
	findOne(
		@Param('id') accessProfileId: string,
		@Req() request?: AuthenticatedRequest,
	) {
		return this.accessProfileService.findOneOrFail(
			accessProfileId,
			request?.user,
			request?.permissions,
		);
	}

	@Patch(':id')
	update(
		@Param('id') accessProfileId: string,
		@Body() updateDataDto: UpdateAccessProfileDto,
		@Req() request?: AuthenticatedRequest,
	) {
		return this.accessProfileService.update(
			accessProfileId,
			updateDataDto,
			request?.user,
			request?.permissions,
		);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	async deleteOne(
		@Param('id') accessProfileId: string,
		@Req() request?: AuthenticatedRequest,
	) {
		await this.accessProfileService.deleteOne(
			accessProfileId,
			request?.user,
			request?.permissions,
		);
	}
}
