import { Test, TestingModule } from '@nestjs/testing';
import { AccessProfileService } from './access-profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessProfile } from './entities/access-profile.entity';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { ConflictException } from '@nestjs/common';

describe('AccessProfileService', () => {
	let service: AccessProfileService;
	let mockAccessProfileRepository: {
		exists: jest.Mock;
		save: jest.Mock;
		find: jest.Mock;
		findOne: jest.Mock;
		merge: jest.Mock;
	};
	let createAccessProfileData: CreateAccessProfileDto;

	beforeEach(async () => {
		mockAccessProfileRepository = {
			exists: jest.fn(),
			save: jest.fn(),
			find: jest.fn(),
			findOne: jest.fn(),
			merge: jest.fn(),
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
});
