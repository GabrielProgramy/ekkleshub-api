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
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	create(
		@Body() createUserDto: CreateUserDto,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.usersService.create(createUserDto, request?.user);
	}

	@Get()
	findAll(@Req() request?: Request & { user?: AuthenticatedUser }) {
		return this.usersService.findAll(request?.user);
	}

	@Get(':id')
	findOne(
		@Param('id') userId: string,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.usersService.findOneOrFail(userId, request?.user);
	}

	@Patch(':id')
	update(
		@Param('id') userId: string,
		@Body() updateUserDto: UpdateUserDto,
		@Req() request?: Request & { user?: AuthenticatedUser },
	) {
		return this.usersService.update(userId, updateUserDto, request?.user);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch(':id/inactive')
	async inactiveUser(
		@Param('id') userId: string,
		@Req() request?: Request & { user?: AuthenticatedUser },
	): Promise<void> {
		await this.usersService.inactiveUser(userId, request?.user);
	}
}
