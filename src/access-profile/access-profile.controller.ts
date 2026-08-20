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
} from '@nestjs/common';
import { AccessProfileService } from './access-profile.service';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';

@Controller('access-profile')
export class AccessProfileController {
	constructor(private readonly accessProfileService: AccessProfileService) {}

	@Post()
	create(@Body() createAccessProfileDto: CreateAccessProfileDto) {
		return this.accessProfileService.create(createAccessProfileDto);
	}

	@Get()
	findAll() {
		return this.accessProfileService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') accessProfileId: string) {
		return this.accessProfileService.findOneOrFail(accessProfileId);
	}

	@Patch(':id')
	update(
		@Param('id') accessProfileId: string,
		@Body() updateDataDto: UpdateAccessProfileDto,
	) {
		return this.accessProfileService.update(accessProfileId, updateDataDto);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	async deleteOne(@Param('id') accessProfileId: string) {
		await this.accessProfileService.deleteOne(accessProfileId);
	}
}
