import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') userId: string) {
		return this.usersService.findOneOrFail(userId);
	}

	@Patch(':id')
	update(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(userId, updateUserDto);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch(':id/inactive')
	async inactiveUser(@Param('id') userId: string): Promise<void> {
		await this.usersService.inactiveUser(userId);
	}
}
