import {
	Controller,
	ExecutionContext,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessProfileService } from '../../access-profile/access-profile.service';
import {
	AccessProfile,
	PermissionLevel,
	PermissionModule,
	PermissionScope,
} from '../../access-profile/entities/access-profile.entity';
import { AuthorizationGuard } from './authorization.guard';
import { UsersController } from '../../users/users.controller';
import { ChurchController } from '../../church/church.controller';
import { AccessProfileController } from '../../access-profile/access-profile.controller';

@Controller('unmapped')
class DecoratedUnmappedController {}

type ControllerClass =
	| typeof UsersController
	| typeof ChurchController
	| typeof AccessProfileController
	| typeof DecoratedUnmappedController;

function permissionProfile(
	module: PermissionModule,
	permission: PermissionLevel,
): AccessProfile {
	return {
		id: 'access-profile-id',
		name: 'TEST_PROFILE',
		permissions: {
			[module]: {
				permission,
				scope: PermissionScope.GLOBAL,
			},
		} as AccessProfile['permissions'],
	} as AccessProfile;
}

describe('AuthorizationGuard', () => {
	let guard: AuthorizationGuard;
	let request: { user?: { accessProfileId: string } };
	let mockAccessProfileService: { findOne: jest.Mock };
	let mockReflector: { getAllAndOverride: jest.Mock };

	function makeContext(controller: ControllerClass): ExecutionContext {
		return {
			getHandler: () => jest.fn(),
			getClass: () => controller,
			switchToHttp: () => ({ getRequest: () => request }),
		} as unknown as ExecutionContext;
	}

	beforeEach(async () => {
		request = { user: { accessProfileId: 'access-profile-id' } };
		mockAccessProfileService = { findOne: jest.fn() };
		mockReflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthorizationGuard,
				{ provide: AccessProfileService, useValue: mockAccessProfileService },
				{ provide: Reflector, useValue: mockReflector },
			],
		}).compile();

		guard = module.get<AuthorizationGuard>(AuthorizationGuard);
	});

	it.each([
		{
			controller: UsersController,
			module: PermissionModule.USERS,
			permission: PermissionLevel.READ,
		},
		{
			controller: ChurchController,
			module: PermissionModule.CHURCHES,
			permission: PermissionLevel.FULL,
		},
		{
			controller: AccessProfileController,
			module: PermissionModule.ACCESS_PROFILES,
			permission: PermissionLevel.READ,
		},
	])(
		'deve autorizar $module com permissão $permission',
		async ({ controller, module, permission }) => {
			mockAccessProfileService.findOne.mockResolvedValue(
				permissionProfile(module, permission),
			);

			await expect(guard.canActivate(makeContext(controller))).resolves.toBe(
				true,
			);
			expect(mockAccessProfileService.findOne).toHaveBeenCalledWith(
				'access-profile-id',
			);
		},
	);

	it('deve negar acesso quando a permissão do módulo for NONE', async () => {
		mockAccessProfileService.findOne.mockResolvedValue(
			permissionProfile(PermissionModule.USERS, PermissionLevel.NONE),
		);

		await expect(
			guard.canActivate(makeContext(UsersController)),
		).rejects.toThrow(ForbiddenException);
	});

	it('deve negar acesso quando o perfil não existe', async () => {
		mockAccessProfileService.findOne.mockResolvedValue(null);

		await expect(
			guard.canActivate(makeContext(UsersController)),
		).rejects.toThrow(ForbiddenException);
	});

	it('deve negar acesso para um controller sem módulo mapeado', async () => {
		await expect(
			guard.canActivate(makeContext(DecoratedUnmappedController)),
		).rejects.toThrow(ForbiddenException);
		expect(mockAccessProfileService.findOne).not.toHaveBeenCalled();
	});

	it('deve rejeitar requisição sem usuário autenticado', async () => {
		request.user = undefined;

		await expect(
			guard.canActivate(makeContext(UsersController)),
		).rejects.toThrow(UnauthorizedException);
	});

	it('deve ignorar rotas públicas', async () => {
		mockReflector.getAllAndOverride.mockReturnValue(true);

		await expect(guard.canActivate(makeContext(UsersController))).resolves.toBe(
			true,
		);
		expect(mockAccessProfileService.findOne).not.toHaveBeenCalled();
	});
});
