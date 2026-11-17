import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-user';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	create(
		@Body() createUserDto: CreateUserDto,
		@Req() request?: AuthenticatedRequest,
	) {
		return this.usersService.create(
			createUserDto,
			request?.user,
			request?.permissions,
		);
	}

	@Get()
	findAll(@Req() request?: AuthenticatedRequest) {
		return this.usersService.findAll(request?.user, request?.permissions);
	}

	@Get(':id')
	findOne(@Param('id') userId: string, @Req() request?: AuthenticatedRequest) {
		return this.usersService.findOneOrFail(
			userId,
			request?.user,
			request?.permissions,
		);
	}

	@Patch(':id')
	update(
		@Param('id') userId: string,
		@Body() updateUserDto: UpdateUserDto,
		@Req() request?: AuthenticatedRequest,
	) {
		return this.usersService.update(
			userId,
			updateUserDto,
			request?.user,
			request?.permissions,
		);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch(':id/inactive')
	async inactiveUser(
		@Param('id') userId: string,
		@Req() request?: AuthenticatedRequest,
	): Promise<void> {
		await this.usersService.inactiveUser(
			userId,
			request?.user,
			request?.permissions,
		);
	}
}
