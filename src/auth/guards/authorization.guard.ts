import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AccessProfileService } from '../../access-profile/access-profile.service';
import {
	PermissionLevel,
	PermissionModule,
} from '../../access-profile/entities/access-profile.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type AuthenticatedRequest = Request & {
	user?: {
		accessProfileId?: string;
	};
};

const controllerModules: Record<string, PermissionModule> = {
	church: PermissionModule.CHURCHES,
	members: PermissionModule.MEMBERS,
	users: PermissionModule.USERS,
	'access-profile': PermissionModule.ACCESS_PROFILES,
	'pastoral-leadership': PermissionModule.PASTORAL_LEADERSHIP,
	audit: PermissionModule.AUDIT,
};

@Injectable()
export class AuthorizationGuard implements CanActivate {
	constructor(
		private readonly accessProfileService: AccessProfileService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const accessProfileId = request.user?.accessProfileId;

		if (!accessProfileId)
			throw new UnauthorizedException('Usuário não autenticado!');

		const controllerPath = Reflect.getMetadata(
			PATH_METADATA,
			context.getClass(),
		) as string | undefined;
		const module =
			controllerModules[controllerPath?.replace(/^\/+|\/+$/g, '') ?? ''];

		if (!module)
			throw new ForbiddenException(
				'Recurso sem módulo de permissão configurado!',
			);

		const accessProfile =
			await this.accessProfileService.findOne(accessProfileId);
		const permission = accessProfile?.permissions?.[module]?.permission;

		if (!permission || permission === PermissionLevel.NONE)
			throw new ForbiddenException(
				'Você não tem permissão para acessar este recurso!',
			);

		return true;
	}
}
