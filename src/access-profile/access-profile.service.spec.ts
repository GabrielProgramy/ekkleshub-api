import { Test, TestingModule } from '@nestjs/testing';
import { AccessProfileService } from './access-profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessProfile } from './entities/access-profile.entity';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';

describe('AccessProfileService', () => {
	let service: AccessProfileService;
	let mockAccessProfileRepository: {
		exists: jest.Mock;
		save: jest.Mock;
		find: jest.Mock;
		findOne: jest.Mock;
		merge: jest.Mock;
		delete: jest.Mock;
	};
	let createAccessProfileData: CreateAccessProfileDto;
	let existingAccessProfileData: AccessProfile;

	beforeEach(async () => {
		mockAccessProfileRepository = {
			exists: jest.fn(),
			save: jest.fn(),
			find: jest.fn(),
			findOne: jest.fn(),
			merge: jest.fn(),
			delete: jest.fn(),
		};

		createAccessProfileData = {
			name: 'OWNER',
			permissions: {
				ACCESS_PROFILES: { permission: 'FULL', scope: 'GLOBAL' },
				CHURCHES: { permission: 'FULL', scope: 'GLOBAL' },
				AUDIT: { permission: 'FULL', scope: 'GLOBAL' },
				MEMBERS: { permission: 'FULL', scope: 'GLOBAL' },
				PASTORAL_LEADERSHIP: { permission: 'FULL', scope: 'GLOBAL' },
				USERS: { permission: 'FULL', scope: 'GLOBAL' },
			},
		};

		existingAccessProfileData = {
			...createAccessProfileData,
			id: 'uuid-test',
			created_at: new Date(),
			updated_at: new Date(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccessProfileService,
				{
					provide: getRepositoryToken(AccessProfile),
					useValue: mockAccessProfileRepository,
				},
			],
		}).compile();

		service = module.get<AccessProfileService>(AccessProfileService);
	});

	it('deve permitir a criar um perfil de acesso com nome ainda não existentes e permissões válidas', async () => {
		mockAccessProfileRepository.exists.mockResolvedValue(false);

		const accessProfileTest = {
			...createAccessProfileData,
			id: 'uuid-teste',
			created_at: new Date(),
			updated_at: new Date(),
		};

		mockAccessProfileRepository.save.mockResolvedValue(accessProfileTest);

		const result = await service.create(createAccessProfileData);

		expect(result).toEqual(accessProfileTest);
		expect(mockAccessProfileRepository.exists).toHaveBeenCalledWith({
			where: { name: createAccessProfileData.name },
		});
		expect(mockAccessProfileRepository.save).toHaveBeenCalled();
	});
	it('deve impedir a criação de um perfil de acesso com nome já existente', async () => {
		mockAccessProfileRepository.exists.mockResolvedValue(true);

		await expect(service.create(createAccessProfileData)).rejects.toThrow(
			ConflictException,
		);
		expect(mockAccessProfileRepository.save).not.toHaveBeenCalled();
	});

	it('deve listar os perfis de acesso cadastrados', async () => {
		const accessProfilesList: AccessProfile[] = [
			existingAccessProfileData,
			{
				...existingAccessProfileData,
				id: 'uuid-teste-2',
				name: 'ADMIN',
			},
		];

		mockAccessProfileRepository.find.mockResolvedValue(accessProfilesList);

		const result = await service.findAll();

		expect(result).toEqual(accessProfilesList);
		expect(mockAccessProfileRepository.find).toHaveBeenCalled();
	});

	it('deve encontrar um perfil de acesso por seu id cadastrado', async () => {
		mockAccessProfileRepository.findOne.mockResolvedValue(
			existingAccessProfileData,
		);

		const accessProfileId = 'uuid-teste';

		const result = await service.findOneOrFail(accessProfileId);

		expect(result).toEqual(existingAccessProfileData);
		expect(mockAccessProfileRepository.findOne).toHaveBeenCalledWith({
			where: { id: accessProfileId },
		});
	});

	it('deve lançar um erro quando o perfil de acesso não existir', async () => {
		mockAccessProfileRepository.findOne.mockResolvedValue(null);

		await expect(service.findOneOrFail('uuid-teste')).rejects.toThrow(
			NotFoundException,
		);
	});

	it('deve permitir a atualização de dados de um perfil de acesso', async () => {
		const updatedDataAccessProfile: UpdateAccessProfileDto = {
			name: 'ADMIN',
			permissions: {
				ACCESS_PROFILES: { permission: 'FULL', scope: 'GLOBAL' },
			},
		};

		const mergedDataAccessProfile = {
			...existingAccessProfileData,
			...updatedDataAccessProfile,
		};

		mockAccessProfileRepository.findOne.mockResolvedValue(
			existingAccessProfileData,
		);

		mockAccessProfileRepository.merge.mockImplementation(
			(exiting: AccessProfile, updateData: UpdateAccessProfileDto) => {
				Object.assign(exiting, updateData);

				return exiting;
			},
		);

		mockAccessProfileRepository.save.mockResolvedValue(mergedDataAccessProfile);

		const result = await service.update('uuid-teste', updatedDataAccessProfile);

		expect(result).toEqual(mergedDataAccessProfile);
		expect(mockAccessProfileRepository.merge).toHaveBeenCalledWith(
			existingAccessProfileData,
			updatedDataAccessProfile,
		);
		expect(mockAccessProfileRepository.save).toHaveBeenCalledWith(
			existingAccessProfileData,
		);
	});

	it('deve lanaçar um erro caso o nome do perfil de acesso a ser atualizado já exista', async () => {
		const updatedDataAccessProfile: UpdateAccessProfileDto = {
			name: 'ADMIN',
		};

		mockAccessProfileRepository.exists.mockResolvedValue(true);

		await expect(
			service.update('uuid-teste', updatedDataAccessProfile),
		).rejects.toThrow(ConflictException);
	});

	it('deve solicitar a exclusão de um perfil de acesso pelo id', async () => {
		await service.deleteOne('uuid-teste');

		expect(mockAccessProfileRepository.delete).toHaveBeenCalledWith(
			'uuid-teste',
		);
	});
});
