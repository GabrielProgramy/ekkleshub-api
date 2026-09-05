import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from './entities/users.entity';

describe('UsersController', () => {
	let controller: UsersController;
	let mockUsersService: {
		create: jest.Mock;
		findAll: jest.Mock;
		findOneOrFail: jest.Mock;
		update: jest.Mock;
		inactiveUser: jest.Mock;
	};
	let userData: Omit<Users, 'password'>;

	beforeEach(async () => {
		mockUsersService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOneOrFail: jest.fn(),
			update: jest.fn(),
			inactiveUser: jest.fn(),
		};
		userData = {
			id: 'uuid-user',
			name: 'John Doe',
			email: 'johndoe@email.com',
			access_profile_id: 'uuid-access-profile',
			status: 'ACTIVE',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it('deve ser possível criar um usuário', async () => {
		const createUserDto: CreateUserDto = {
			name: 'John Doe',
			email: 'johndoe@email.com',
			password: '12345678',
			access_profile_id: 'uuid-access-profile',
		};

		mockUsersService.create.mockResolvedValue(userData);

		const result = await controller.create(createUserDto);

		expect(result).toEqual(userData);
		expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
	});

	it('deve ser possível listar todos os usuários', async () => {
		mockUsersService.findAll.mockResolvedValue([userData]);

		const result = await controller.findAll();

		expect(result).toEqual([userData]);
		expect(mockUsersService.findAll).toHaveBeenCalled();
	});

	it('deve ser possível buscar um usuário pelo seu id', async () => {
		mockUsersService.findOneOrFail.mockResolvedValue(userData);

		const result = await controller.findOne('uuid-user');

		expect(result).toEqual(userData);
		expect(mockUsersService.findOneOrFail).toHaveBeenCalledWith('uuid-user');
	});

	it('deve ser possível atualizar um usuário', async () => {
		const updateUserDto: UpdateUserDto = {
			name: 'John Updated',
		};
		const updatedUser: Omit<Users, 'password'> = {
			...userData,
			...updateUserDto,
		};

		mockUsersService.update.mockResolvedValue(updatedUser);

		const result = await controller.update('uuid-user', updateUserDto);

		expect(result).toEqual(updatedUser);
		expect(mockUsersService.update).toHaveBeenCalledWith(
			'uuid-user',
			updateUserDto,
		);
	});

	it('deve ser possível inativar um usuário', async () => {
		await controller.inactiveUser('uuid-user');

		expect(mockUsersService.inactiveUser).toHaveBeenCalledWith('uuid-user');
	});
});
