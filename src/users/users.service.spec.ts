import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { AccessProfileService } from '../access-profile/access-profile.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
	let service: UsersService;
	let mockUsersRepository: {
		exists: jest.Mock;
		save: jest.Mock;
		find: jest.Mock;
		findOne: jest.Mock;
		merge: jest.Mock;
	};
	let userData: Users;

	let mockAccessProfileService: {
		findOneOrFail: jest.Mock;
	};

	beforeEach(async () => {
		mockUsersRepository = {
			exists: jest.fn(),
			save: jest.fn(),
			find: jest.fn(),
			findOne: jest.fn(),
			merge: jest.fn(),
		};

		mockAccessProfileService = {
			findOneOrFail: jest.fn(),
		};

		userData = {
			id: 'uuid-teste',
			name: 'John Doe',
			email: 'johndoe@email.com',
			password: 'hash_senha',
			access_profile_id: 'uuid-access-profile',
			status: 'ACTIVE',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(Users),
					useValue: mockUsersRepository,
				},
				{
					provide: AccessProfileService,
					useValue: mockAccessProfileService,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
	});
	describe('Criação de usuário', () => {
		it('deve ser possível cadastrar um usuário com perfil válido', async () => {
			const userDataCreated = {
				name: 'John Doe',
				email: 'johndoe@email.com',
				password: '12345678',
				access_profile: 'uuid-admin',
			};

			mockAccessProfileService.findOneOrFail.mockResolvedValue({
				id: 'uuid-admin',
				name: 'ADMIN',
			});

			mockUsersRepository.exists.mockResolvedValue(false);

			mockUsersRepository.save.mockResolvedValue({
				...userDataCreated,
				id: 'uuid-admin',
				status: 'ACTIVE',
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const result = await service.create(userDataCreated);

			expect(result.status).toBe('ACTIVE');
			expect(mockUsersRepository.exists).toHaveBeenCalledWith({
				where: { email: 'johndoe@email.com' },
			});
			expect(mockAccessProfileService.findOneOrFail).toHaveBeenCalledWith(
				'uuid-admin',
			);
			expect(mockUsersRepository.save).toHaveBeenCalled();
		});

		it('deve impedir o cadastro de um usuário quando o email já estiver cadastrado', async () => {
			const userDataCreated = {
				name: 'John Doe',
				email: 'johndoe@email.com',
				password: '12345678',
				access_profile: 'uuid-admin',
			};

			mockUsersRepository.exists.mockResolvedValue(true);

			await expect(service.create(userDataCreated)).rejects.toThrow(
				ConflictException,
			);
		});

		it('deve impedir o cadastro de um usuário quando o perfil não existir', async () => {
			const userDataCreated = {
				name: 'John Doe',
				email: 'johndoe@email.com',
				password: '12345678',
				access_profile: 'uuid-admin',
			};

			mockAccessProfileService.findOneOrFail.mockRejectedValue(
				new NotFoundException('O perfil de acesso não existe!'),
			);

			await expect(service.create(userDataCreated)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('não deve permitir criar um segundo usuário com perfil OWNER', async () => {
			const createUserOwner = {
				name: 'John Doe',
				email: 'johndoe@email.com',
				password: 'hash_senha',
				access_profile_id: 'uuid-owner',
			};

			mockUsersRepository.exists
				.mockResolvedValue(false)
				.mockResolvedValue(true);

			mockAccessProfileService.findOneOrFail.mockResolvedValue({
				id: 'uuid-owner',
				name: 'OWNER',
			});

			await expect(service.create(createUserOwner)).rejects.toThrow(
				ConflictException,
			);
		});
	});

	it('deve ser possível buscar um usuário pelo seu id', async () => {
		mockUsersRepository.findOne.mockResolvedValue(userData);

		const result = await service.findOneOrFail('uuid-teste');

		expect(result).toEqual(userData);
		expect(mockUsersRepository.findOne).toHaveBeenCalledWith('uuid-teste');
	});

	it('deve listar todos os usuários cadastrados', async () => {
		mockUsersRepository.find.mockResolvedValue([userData]);

		const result = await service.findAll();

		expect(result).toEqual([userData]);
	});

	it('deve ser possível atualizar um usuário', async () => {
		const updatedDataUser = {
			email: 'johndoe2@email.com',
		};

		const mergedDataUser = {
			...userData,
			...updatedDataUser,
		};

		mockUsersRepository.findOne.mockResolvedValue(userData);
		mockUsersRepository.merge.mockImplementation((existing: Users, updated) => {
			Object.assign(existing, updated);

			return existing;
		});

		mockUsersRepository.save.mockResolvedValue(mergedDataUser);

		const result = await service.update('uuid-teste', updatedDataUser);

		expect(result).toEqual(mergedDataUser);
		expect(mockUsersRepository.merge).toHaveBeenCalledWith(
			userData,
			updatedDataUser,
		);
		expect(mockUsersRepository.save).toHaveBeenCalledWith(mergedDataUser);
	});

	it('deve ser possível inativar um usuário', async () => {
		mockUsersRepository.findOne.mockResolvedValue(userData);

		await service.inactiveUser('uuid-teste');

		expect(userData.status).toEqual('INACTIVE');
		expect(mockUsersRepository.save).toHaveBeenCalledWith(userData);
	});
});
