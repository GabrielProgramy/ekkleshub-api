import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { AccessProfileService } from '../access-profile/access-profile.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PasswordHasher } from '../common/security/password-hasher';
import { Not } from 'typeorm';

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
	let mockPasswordHasher: {
		hash: jest.Mock;
	};

	beforeEach(async () => {
		mockUsersRepository = {
			exists: jest.fn(),
			save: jest.fn().mockImplementation((user: Users) => user),
			find: jest.fn(),
			findOne: jest.fn(),
			merge: jest.fn(),
		};

		mockAccessProfileService = {
			findOneOrFail: jest.fn(),
		};
		mockPasswordHasher = {
			hash: jest.fn().mockResolvedValue('senha_com_hash'),
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
				{
					provide: PasswordHasher,
					useValue: mockPasswordHasher,
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
				access_profile_id: 'uuid-admin',
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
			const saveCalls = mockUsersRepository.save.mock.calls as Array<[Users]>;
			const savedUser = saveCalls[0][0];

			expect(result.status).toBe('ACTIVE');
			expect(result).not.toHaveProperty('password');
			expect(mockUsersRepository.exists).toHaveBeenCalledWith({
				where: { email: 'johndoe@email.com' },
			});
			expect(mockAccessProfileService.findOneOrFail).toHaveBeenCalledWith(
				'uuid-admin',
			);
			expect(savedUser).toEqual(
				expect.objectContaining({
					name: userDataCreated.name,
					email: userDataCreated.email,
					access_profile_id: 'uuid-admin',
					status: 'ACTIVE',
				}),
			);
		});

		it('deve gerar um hash de senha', async () => {
			const createUserData = {
				name: 'John Doe',
				email: 'johndoe@email.com',
				password: '12345678',
				access_profile_id: 'uuid-admin',
			};
			const generatedPasswordHash = '$2b$10$senha-transformada-em-hash';

			mockUsersRepository.exists.mockResolvedValue(false);
			mockAccessProfileService.findOneOrFail.mockResolvedValue({
				id: 'uuid-admin',
				name: 'ADMIN',
			});
			mockPasswordHasher.hash.mockResolvedValue(generatedPasswordHash);

			await service.create(createUserData);

			const saveCalls = mockUsersRepository.save.mock.calls as Array<[Users]>;
			const savedUser = saveCalls[0][0];

			expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
				createUserData.password,
			);
			expect(savedUser.password).toBe(generatedPasswordHash);
			expect(savedUser.password).not.toBe(createUserData.password);
		});

		it('deve impedir o cadastro de um usuário quando o email já estiver cadastrado', async () => {
			const userDataCreated = {
				name: 'John Doe',
				email: 'johndoe@email.com',
				password: '12345678',
				access_profile_id: 'uuid-admin',
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
				access_profile_id: 'uuid-admin',
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
				.mockResolvedValueOnce(false)
				.mockResolvedValueOnce(true);

			mockAccessProfileService.findOneOrFail.mockResolvedValue({
				id: 'uuid-owner',
				name: 'OWNER',
			});

			await expect(service.create(createUserOwner)).rejects.toThrow(
				ConflictException,
			);
			expect(mockUsersRepository.exists).toHaveBeenNthCalledWith(2, {
				where: { access_profile_id: 'uuid-owner' },
			});
			expect(mockUsersRepository.save).not.toHaveBeenCalled();
		});
	});

	it('deve ser possível buscar um usuário pelo seu id', async () => {
		const userWithoutPassword = { ...userData };
		delete userWithoutPassword.password;
		mockUsersRepository.findOne.mockResolvedValue(userData);

		const result = await service.findOneOrFail('uuid-teste');

		expect(result).toEqual(userWithoutPassword);
		expect(result).not.toHaveProperty('password');
		expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
			where: { id: 'uuid-teste' },
		});
	});

	it('deve emitir um erro quando o usuário não existir', async () => {
		mockUsersRepository.findOne.mockResolvedValue(null);

		await expect(service.findOneOrFail('uuid-inexistente')).rejects.toThrow(
			NotFoundException,
		);
	});

	it('deve listar todos os usuários cadastrados', async () => {
		const userWithoutPassword = { ...userData };
		delete userWithoutPassword.password;
		mockUsersRepository.find.mockResolvedValue([userData]);

		const result = await service.findAll();

		expect(result).toEqual([userWithoutPassword]);
		expect(result[0]).not.toHaveProperty('password');
		expect(mockUsersRepository.find).toHaveBeenCalledWith({
			select: {
				id: true,
				name: true,
				email: true,
				status: true,
				access_profile_id: true,
				church_id: true,
				member_id: true,
				last_access_at: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	});

	describe('Atualização de usuário', () => {
		it('deve ser possível atualizar um usuário', async () => {
			const updatedDataUser = {
				email: 'johndoe2@email.com',
			};

			const mergedDataUser = {
				...userData,
				...updatedDataUser,
			};
			const userWithoutPassword = { ...mergedDataUser };
			delete userWithoutPassword.password;

			mockUsersRepository.findOne.mockResolvedValue(userData);
			mockUsersRepository.exists.mockResolvedValue(false);
			mockUsersRepository.merge.mockImplementation(
				(existing: Users, updated) => {
					Object.assign(existing, updated);

					return existing;
				},
			);

			mockUsersRepository.save.mockResolvedValue(mergedDataUser);

			const result = await service.update('uuid-teste', updatedDataUser);
			const mergeCalls = mockUsersRepository.merge.mock.calls as Array<
				[Users, typeof updatedDataUser]
			>;
			const existingUserSentToMerge = mergeCalls[0][0];

			expect(result).toEqual(userWithoutPassword);
			expect(result).not.toHaveProperty('password');
			expect(mockUsersRepository.merge).toHaveBeenCalledWith(
				existingUserSentToMerge,
				updatedDataUser,
			);
			expect(existingUserSentToMerge).not.toHaveProperty('password');
			expect(mockUsersRepository.save).toHaveBeenCalled();
		});

		it('não deve permitir a atualização para um email existente', async () => {
			const updatedDataUser = {
				email: 'existing@email.com',
			};

			mockUsersRepository.findOne.mockResolvedValue(userData);
			mockUsersRepository.exists.mockResolvedValue(true);

			await expect(
				service.update('uuid-teste', updatedDataUser),
			).rejects.toThrow(ConflictException);
			expect(mockUsersRepository.exists).toHaveBeenCalledWith({
				where: {
					id: Not('uuid-teste'),
					email: 'existing@email.com',
				},
			});
			expect(mockUsersRepository.save).not.toHaveBeenCalled();
		});

		it('não deve permitir a atualização de um usuário para um perfil OWNER existente', async () => {
			const updatedDataUser = {
				access_profile_id: 'uuid-owner',
			};

			mockUsersRepository.findOne.mockResolvedValue(userData);
			mockAccessProfileService.findOneOrFail.mockResolvedValue({
				id: 'uuid-owner',
				name: 'OWNER',
			});
			mockUsersRepository.exists.mockResolvedValue(true);

			await expect(
				service.update('uuid-teste', updatedDataUser),
			).rejects.toThrow(ConflictException);
			expect(mockAccessProfileService.findOneOrFail).toHaveBeenCalledWith(
				'uuid-owner',
			);
			expect(mockUsersRepository.exists).toHaveBeenCalledWith({
				where: { access_profile_id: 'uuid-owner' },
			});
			expect(mockUsersRepository.save).not.toHaveBeenCalled();
		});
	});

	it('deve ser possível inativar um usuário', async () => {
		mockUsersRepository.findOne.mockResolvedValue(userData);

		await service.inactiveUser('uuid-teste');

		expect(mockUsersRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'uuid-teste',
				status: 'INACTIVE',
			}),
		);
	});

	it('não deve salvar novamente um usuário que já está inativo', async () => {
		userData.status = 'INACTIVE';
		mockUsersRepository.findOne.mockResolvedValue(userData);

		await service.inactiveUser('uuid-teste');

		expect(userData.status).toEqual('INACTIVE');
		expect(mockUsersRepository.save).not.toHaveBeenCalled();
	});
});
