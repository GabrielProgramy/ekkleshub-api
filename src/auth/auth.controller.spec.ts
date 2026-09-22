import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthController', () => {
	let controller: AuthController;
	let mockAuthService: {
		authenticate: jest.Mock;
		refreshTokens: jest.Mock;
	};

	beforeEach(async () => {
		mockAuthService = {
			authenticate: jest.fn(),
			refreshTokens: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockAuthService,
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it('deve autenticar um usuário e retornar os tokens de acesso', async () => {
		const loginDto: LoginDto = {
			email: 'johndoe@email.com',
			password: '12345678',
		};
		const tokens = {
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
		};

		mockAuthService.authenticate.mockResolvedValue(tokens);

		const result = await controller.login(loginDto);

		expect(result).toEqual(tokens);
		expect(mockAuthService.authenticate).toHaveBeenCalledWith(loginDto);
	});

	it('deve gerar novos tokens a partir de um refresh token', async () => {
		const refreshTokenDto: RefreshTokenDto = {
			refreshToken: 'refresh-token-valido',
		};
		const newTokens = {
			accessToken: 'novo-access-token',
			refreshToken: 'novo-refresh-token',
		};

		mockAuthService.refreshTokens.mockResolvedValue(newTokens);

		const result = await controller.refreshTokens(refreshTokenDto);

		expect(result).toEqual(newTokens);
		expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
			refreshTokenDto.refreshToken,
		);
	});
});
