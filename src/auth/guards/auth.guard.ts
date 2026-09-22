import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export type AccessTokenPayload = {
	sub: string;
	email: string;
	accessProfileId: string;
	tokenType: 'access';
	iat?: number;
	exp?: number;
};

type AuthenticatedRequest = Request & {
	user?: AccessTokenPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly usersService: UsersService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const token = this.extractBearerToken(request);

		if (!token) throw new UnauthorizedException('Token de acesso inválido!');

		let payload: AccessTokenPayload;

		try {
			payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
				secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
			});
		} catch {
			throw new UnauthorizedException('Token de acesso inválido!');
		}

		if (
			payload.tokenType !== 'access' ||
			typeof payload.sub !== 'string' ||
			typeof payload.email !== 'string' ||
			typeof payload.accessProfileId !== 'string'
		)
			throw new UnauthorizedException('Token de acesso inválido!');

		const user = await this.usersService.findOne(payload.sub);

		if (!user || user.status === 'INACTIVE')
			throw new UnauthorizedException('Token de acesso inválido!');

		request.user = {
			...payload,
			email: user.email,
			accessProfileId: user.access_profile_id,
		};

		return true;
	}

	private extractBearerToken(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];

		return type === 'Bearer' ? token : undefined;
	}
}
