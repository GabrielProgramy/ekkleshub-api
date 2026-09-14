import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '../common/security/password-hasher';
import { Users } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;
	let mockUsersService: {
		findByEmail: jest.Mock;
		update: jest.Mock;
	};
	let mockPasswordHasher: {
		compare: jest.Mock;
	};
	let mockJwtService: {
		signAsync: jest.Mock;
		verifyAsync: jest.Mock;
	};
	let mockConfigService: {
		getOrThrow: jest.Mock;
	};
	let registeredUser: Users;

	beforeEach(async () => {
		mockUsersService = {
			findByEmail: jest.fn(),
			update: jest.fn(),
		};
		mockPasswordHasher = {
			compare: jest.fn(),
		};
		mockJwtService = {
			signAsync: jest.fn().mockResolvedValue('token'),
			verifyAsync: jest.fn(),
		};
		mockConfigService = {
			getOrThrow: jest.fn((key: string) => {
				const secrets: Record<string, string> = {
					JWT_ACCESS_SECRET: 'access-secret',
					JWT_REFRESH_SECRET: 'refresh-secret',
				};

				return secrets[key];
			}),
		};
		registeredUser = {
			id: 'uuid-user',
			name: 'John Doe',
			email: 'johndoe@email.com',
			password: 'senha_com_hash',
			access_profile_id: 'uuid-access-profile',
			status: 'ACTIVE',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: PasswordHasher,
					useValue: mockPasswordHasher,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('deve autenticar um usuário com email e senha válidos', async () => {
		const credentials = {
			email: 'johndoe@email.com',
			password: '12345678',
		};
		mockUsersService.findByEmail.mockResolvedValue(registeredUser);
		mockPasswordHasher.compare.mockResolvedValue(true);

		await service.authenticate(credentials);

		expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
			credentials.email,
		);
		expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
			credentials.password,
			registeredUser.password,
		);
	});

	it('deve gerar um access token e um refresh token', async () => {
		const credentials = {
			email: 'johndoe@email.com',
			password: '12345678',
		};

		mockUsersService.findByEmail.mockResolvedValue(registeredUser);
		mockPasswordHasher.compare.mockResolvedValue(true);
		mockJwtService.signAsync
			.mockResolvedValueOnce('access-token')
			.mockResolvedValueOnce('refresh-token');

		const result = await service.authenticate(credentials);
		const signCalls = mockJwtService.signAsync.mock.calls as Array<
			[Record<string, string>, { secret: string; expiresIn: string }]
		>;

		expect(result).toEqual({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
		});
		expect(signCalls).toHaveLength(2);
		expect(signCalls[0][0]).toEqual(
			expect.objectContaining({
				sub: registeredUser.id,
				email: registeredUser.email,
				accessProfileId: registeredUser.access_profile_id,
			}),
		);
		expect(signCalls[0][1]).toEqual({
			secret: 'access-secret',
			expiresIn: '15m',
		});
		expect(signCalls[1][0]).toEqual(
			expect.objectContaining({
				sub: registeredUser.id,
				email: registeredUser.email,
				accessProfileId: registeredUser.access_profile_id,
			}),
		);
		expect(signCalls[1][1]).toEqual({
			secret: 'refresh-secret',
			expiresIn: '7d',
		});
	});

	it('deve atualizar a data do último acesso após o login', async () => {
		const credentials = {
			email: 'johndoe@email.com',
			password: '12345678',
		};
		const lastAccessAt = new Date('2026-09-14T12:00:00.000Z');
		jest.useFakeTimers().setSystemTime(lastAccessAt);

		mockUsersService.findByEmail.mockResolvedValue(registeredUser);
		mockPasswordHasher.compare.mockResolvedValue(true);

		await service.authenticate(credentials);

		expect(mockUsersService.update).toHaveBeenCalledWith(registeredUser.id, {
			last_access_at: lastAccessAt,
		});
	});

	it('não deve permitir que um usuário inativo se autentique', async () => {
		const credentials = {
			email: 'johndoe@email.com',
			password: '12345678',
		};
		const inactiveUser: Users = {
			...registeredUser,
			status: 'INACTIVE',
		};

		mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
		mockPasswordHasher.compare.mockResolvedValue(true);

		await expect(service.authenticate(credentials)).rejects.toThrow(
			UnauthorizedException,
		);
		expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
		expect(mockJwtService.signAsync).not.toHaveBeenCalled();
		expect(mockUsersService.update).not.toHaveBeenCalled();
	});

	describe('Renovação de tokens', () => {
		it('deve gerar novos tokens a partir de um refresh token válido', async () => {
			const refreshToken = 'refresh-token-valido';
			const refreshTokenPayload = {
				sub: registeredUser.id,
				email: registeredUser.email,
				accessProfileId: registeredUser.access_profile_id,
				tokenType: 'refresh',
			};

			mockJwtService.verifyAsync.mockResolvedValue(refreshTokenPayload);
			mockJwtService.signAsync
				.mockResolvedValueOnce('novo-access-token')
				.mockResolvedValueOnce('novo-refresh-token');

			const result = await service.refreshTokens(refreshToken);

			expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
				secret: 'refresh-secret',
			});
			expect(result).toEqual({
				accessToken: 'novo-access-token',
				refreshToken: 'novo-refresh-token',
			});
			expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
		});

		it('não deve gerar novos tokens a partir de um refresh token inválido', async () => {
			const invalidRefreshToken = 'refresh-token-invalido';

			mockJwtService.verifyAsync.mockRejectedValue(new Error('Token inválido'));

			await expect(service.refreshTokens(invalidRefreshToken)).rejects.toThrow(
				UnauthorizedException,
			);
			expect(mockJwtService.signAsync).not.toHaveBeenCalled();
		});
	});

	it.each([
		{
			scenario: 'email inexistente',
			hasRegisteredUser: false,
		},
		{
			scenario: 'senha incorreta',
			hasRegisteredUser: true,
		},
	])(
		'não deve autenticar um usuário com $scenario',
		async ({ hasRegisteredUser }) => {
			const credentials = {
				email: 'johndoe@email.com',
				password: 'senha-incorreta',
			};

			mockUsersService.findByEmail.mockResolvedValue(
				hasRegisteredUser ? registeredUser : null,
			);
			mockPasswordHasher.compare.mockResolvedValue(false);

			await expect(service.authenticate(credentials)).rejects.toThrow(
				UnauthorizedException,
			);

			if (hasRegisteredUser) {
				expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
					credentials.password,
					registeredUser.password,
				);
			} else {
				expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
			}

			expect(mockUsersService.update).not.toHaveBeenCalled();
			expect(mockJwtService.signAsync).not.toHaveBeenCalled();
		},
	);
});
