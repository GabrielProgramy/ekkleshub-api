import { Test, TestingModule } from '@nestjs/testing';
import { AccessProfileController } from './access-profile.controller';
import { AccessProfileService } from './access-profile.service';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import {
	AccessProfile,
	PermissionLevel,
	PermissionScope,
} from './entities/access-profile.entity';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';

describe('AccessProfileController', () => {
	let controller: AccessProfileController;
	let mockAccessProfileService: {
		create: jest.Mock;
		findAll: jest.Mock;
		findOneOrFail: jest.Mock;
		update: jest.Mock;
		deleteOne: jest.Mock;
	};

	beforeEach(async () => {
		mockAccessProfileService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOneOrFail: jest.fn(),
			update: jest.fn(),
			deleteOne: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AccessProfileController],
			providers: [
				{
					provide: AccessProfileService,
					useValue: mockAccessProfileService,
				},
			],
		}).compile();

		controller = module.get<AccessProfileController>(AccessProfileController);
	});

	it('deve ser possível criar um novo perfil de acesso', async () => {
		const newAccessProfileData: CreateAccessProfileDto = {
			name: 'OWNER',
			permissions: {
				ACCESS_PROFILES: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				AUDIT: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				CHURCHES: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				MEMBERS: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				PASTORAL_LEADERSHIP: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				USERS: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
			},
		};

		const newAccessProfile: AccessProfile = {
			...newAccessProfileData,
			id: 'uuid-test',
			created_at: new Date(),
			updated_at: new Date(),
		};

		mockAccessProfileService.create.mockResolvedValue(newAccessProfile);

		const result = await controller.create(newAccessProfileData);

		expect(result).toEqual(newAccessProfile);
		expect(mockAccessProfileService.create).toHaveBeenCalledWith(
			newAccessProfileData,
		);
	});

	it('deve ser possível listar todos os perfis de acesso registrados', async () => {
		const accessProfilesList: AccessProfile[] = [
			{
				id: 'uuid-teste',
				name: 'OWNER',
				permissions: {
					ACCESS_PROFILES: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					AUDIT: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					CHURCHES: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					MEMBERS: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					PASTORAL_LEADERSHIP: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					USERS: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
				},
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				id: 'uuid-teste-2',
				name: 'ADMIN',
				permissions: {
					ACCESS_PROFILES: {
						permission: PermissionLevel.READ,
						scope: PermissionScope.GLOBAL,
					},
					AUDIT: {
						permission: PermissionLevel.NONE,
						scope: PermissionScope.GLOBAL,
					},
					CHURCHES: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					MEMBERS: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					PASTORAL_LEADERSHIP: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
					USERS: {
						permission: PermissionLevel.FULL,
						scope: PermissionScope.GLOBAL,
					},
				},
				created_at: new Date(),
				updated_at: new Date(),
			},
		];

		mockAccessProfileService.findAll.mockResolvedValue(accessProfilesList);

		const result = await controller.findAll();

		expect(result).toEqual(accessProfilesList);
		expect(mockAccessProfileService.findAll).toHaveBeenCalled();
	});

	it('deve ser possível retornar um perfil de acesso pelo seu id', async () => {
		const accessProfileId = 'uuid-teste';

		const accessProfile: AccessProfile = {
			id: accessProfileId,
			name: 'OWNER',
			permissions: {
				ACCESS_PROFILES: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				AUDIT: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				CHURCHES: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				MEMBERS: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				PASTORAL_LEADERSHIP: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				USERS: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
			},
			created_at: new Date(),
			updated_at: new Date(),
		};

		mockAccessProfileService.findOneOrFail.mockResolvedValue(accessProfile);

		const result = await controller.findOne(accessProfileId);

		expect(result).toEqual(accessProfile);
		expect(mockAccessProfileService.findOneOrFail).toHaveBeenCalledWith(
			accessProfileId,
		);
	});

	it('deve ser possível alterar dados de um perfil de acesso', async () => {
		const accessProfileId = 'uuid-teste';

		const accessProfile: AccessProfile = {
			id: accessProfileId,
			name: 'ADMIN',
			permissions: {
				ACCESS_PROFILES: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				AUDIT: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				CHURCHES: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				MEMBERS: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				PASTORAL_LEADERSHIP: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
				USERS: {
					permission: PermissionLevel.FULL,
					scope: PermissionScope.GLOBAL,
				},
			},
			created_at: new Date(),
			updated_at: new Date(),
		};

		const updateData: UpdateAccessProfileDto = {
			permissions: {
				ACCESS_PROFILES: {
					permission: PermissionLevel.READ,
					scope: PermissionScope.GLOBAL,
				},
			},
		};

		const accessProfileUpdated: AccessProfile = Object.assign(
			accessProfile,
			updateData,
		);

		mockAccessProfileService.update.mockResolvedValue(accessProfileUpdated);

		const result = await controller.update(accessProfileId, updateData);

		expect(result).toEqual(accessProfileUpdated);
		expect(mockAccessProfileService.update).toHaveBeenCalledWith(
			accessProfileId,
			updateData,
		);
	});

	it('deve ser possivel excluir um perfil de acesso', async () => {
		const accessProfileId = 'uuid-teste';

		await controller.deleteOne(accessProfileId);

		expect(mockAccessProfileService.deleteOne).toHaveBeenCalledWith(
			accessProfileId,
		);
	});
});
