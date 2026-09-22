import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { AccessTokenPayload, AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
	let guard: AuthGuard;
	let request: {
		headers: { authorization?: string };
		user?: AccessTokenPayload;
	};
	let context: ExecutionContext;
	let mockJwtService: { verifyAsync: jest.Mock };
	let mockUsersService: { findOne: jest.Mock };
	let mockReflector: { getAllAndOverride: jest.Mock };

	beforeEach(async () => {
		request = { headers: {} };
		context = {
			getHandler: () => jest.fn(),
			getClass: () => AuthGuard,
			switchToHttp: () => ({
				getRequest: () => request,
			}),
		} as ExecutionContext;
		mockJwtService = { verifyAsync: jest.fn() };
		mockUsersService = { findOne: jest.fn() };
		mockReflector = {
			getAllAndOverride: jest.fn().mockReturnValue(false),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthGuard,
				{ provide: JwtService, useValue: mockJwtService },
				{
					provide: ConfigService,
					useValue: {
						getOrThrow: jest.fn().mockReturnValue('access-secret'),
					},
				},
				{ provide: UsersService, useValue: mockUsersService },
				{ provide: Reflector, useValue: mockReflector },
			],
		}).compile();

		guard = module.get<AuthGuard>(AuthGuard);
	});

	it('deve liberar uma rota marcada como pública sem exigir token', async () => {
		mockReflector.getAllAndOverride.mockReturnValue(true);

		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
		expect(mockUsersService.findOne).not.toHaveBeenCalled();
	});

	it('deve liberar a rota e adicionar o payload em request.user', async () => {
		const payload: AccessTokenPayload = {
			sub: 'uuid-user',
			email: 'johndoe@email.com',
			accessProfileId: 'uuid-access-profile',
			tokenType: 'access',
		};
		request.headers.authorization = 'Bearer access-token';
		mockJwtService.verifyAsync.mockResolvedValue(payload);
		mockUsersService.findOne.mockResolvedValue({
			id: 'uuid-user',
			email: 'johndoe@email.com',
			access_profile_id: 'uuid-access-profile',
			status: 'ACTIVE',
		});

		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
			secret: 'access-secret',
		});
		expect(mockUsersService.findOne).toHaveBeenCalledWith('uuid-user');
		expect(request.user).toEqual(payload);
	});

	it('deve adicionar os dados atuais do usuário em request.user', async () => {
		const payload: AccessTokenPayload = {
			sub: 'uuid-user',
			email: 'email-antigo@email.com',
			accessProfileId: 'uuid-access-profile-antigo',
			tokenType: 'access',
		};
		const currentUser = {
			id: 'uuid-user',
			email: 'email-atual@email.com',
			access_profile_id: 'uuid-access-profile-atual',
			status: 'ACTIVE',
		};
		request.headers.authorization = 'Bearer access-token';
		mockJwtService.verifyAsync.mockResolvedValue(payload);
		mockUsersService.findOne.mockResolvedValue(currentUser);

		await expect(guard.canActivate(context)).resolves.toBe(true);

		expect(request.user).toEqual({
			sub: currentUser.id,
			email: currentUser.email,
			accessProfileId: currentUser.access_profile_id,
			tokenType: payload.tokenType,
		});
	});

	it('não deve liberar a rota sem um Bearer token', async () => {
		await expect(guard.canActivate(context)).rejects.toThrow(
			UnauthorizedException,
		);
		expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
	});

	it('não deve liberar a rota com um token inválido', async () => {
		request.headers.authorization = 'Bearer token-invalido';
		mockJwtService.verifyAsync.mockRejectedValue(new Error('Token inválido'));

		await expect(guard.canActivate(context)).rejects.toThrow(
			UnauthorizedException,
		);
	});

	it('não deve aceitar um refresh token como token de acesso', async () => {
		request.headers.authorization = 'Bearer refresh-token';
		mockJwtService.verifyAsync.mockResolvedValue({
			sub: 'uuid-user',
			email: 'johndoe@email.com',
			accessProfileId: 'uuid-access-profile',
			tokenType: 'refresh',
		});

		await expect(guard.canActivate(context)).rejects.toThrow(
			UnauthorizedException,
		);
		expect(mockUsersService.findOne).not.toHaveBeenCalled();
	});

	it('não deve liberar a rota para um usuário inativo', async () => {
		request.headers.authorization = 'Bearer access-token';
		mockJwtService.verifyAsync.mockResolvedValue({
			sub: 'uuid-user',
			email: 'johndoe@email.com',
			accessProfileId: 'uuid-access-profile',
			tokenType: 'access',
		});
		mockUsersService.findOne.mockResolvedValue({
			id: 'uuid-user',
			status: 'INACTIVE',
		});

		await expect(guard.canActivate(context)).rejects.toThrow(
			UnauthorizedException,
		);
		expect(request.user).toBeUndefined();
	});
});
