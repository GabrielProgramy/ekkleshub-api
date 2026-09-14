import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '../common/security/password-hasher';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

type AuthTokens = {
	accessToken: string;
	refreshToken: string;
};

type TokenPayload = {
	sub: string;
	email: string;
	accessProfileId: string;
	tokenType: 'access' | 'refresh';
};

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly passwordHasher: PasswordHasher,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async authenticate(loginDto: LoginDto): Promise<AuthTokens> {
		const user = await this.usersService.findByEmail(loginDto.email);

		if (!user || user.status === 'INACTIVE' || !user.password)
			throw new UnauthorizedException('Credenciais inválidas!');

		const passwordMatches = await this.passwordHasher.compare(
			loginDto.password,
			user.password,
		);

		if (!passwordMatches)
			throw new UnauthorizedException('Credenciais inválidas!');

		const tokens = await this.generateTokens(
			user.id,
			user.email,
			user.access_profile_id,
		);

		await this.usersService.update(user.id, {
			last_access_at: new Date(),
		});

		return tokens;
	}

	async refreshTokens(refreshToken: string): Promise<AuthTokens> {
		let payload: TokenPayload;

		try {
			payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
				secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			});
		} catch {
			throw new UnauthorizedException('Refresh token inválido!');
		}

		if (
			payload.tokenType !== 'refresh' ||
			typeof payload.sub !== 'string' ||
			typeof payload.email !== 'string' ||
			typeof payload.accessProfileId !== 'string'
		)
			throw new UnauthorizedException('Refresh token inválido!');

		return this.generateTokens(
			payload.sub,
			payload.email,
			payload.accessProfileId,
		);
	}

	private async generateTokens(
		userId: string,
		email: string,
		accessProfileId: string,
	): Promise<AuthTokens> {
		const tokenPayload = { sub: userId, email, accessProfileId };
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(
				{ ...tokenPayload, tokenType: 'access' },
				{
					secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
					expiresIn: '15m',
				},
			),
			this.jwtService.signAsync(
				{ ...tokenPayload, tokenType: 'refresh' },
				{
					secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
					expiresIn: '7d',
				},
			),
		]);

		return { accessToken, refreshToken };
	}
}
