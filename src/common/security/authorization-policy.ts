import { ForbiddenException } from '@nestjs/common';
import {
	Permission,
	PermissionLevel,
	PermissionModule,
	PermissionScope,
} from '../../access-profile/entities/access-profile.entity';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';

export function assertPermission(
	permissions: Permission | undefined,
	user: AuthenticatedUser | undefined,
	module: PermissionModule,
	requiredPermission: PermissionLevel,
	targetChurchId?: string,
): void {
	if (!user) return;

	const modulePermission = permissions?.[module];

	if (!modulePermission || modulePermission.permission === PermissionLevel.NONE)
		throw new ForbiddenException('Você não tem permissão para este recurso!');

	if (
		requiredPermission === PermissionLevel.FULL &&
		modulePermission.permission !== PermissionLevel.FULL
	)
		throw new ForbiddenException('Permissão de escrita necessária!');

	if (
		modulePermission.scope === PermissionScope.OWN_CHURCH &&
		(!user.churchId || (targetChurchId && targetChurchId !== user.churchId))
	)
		throw new ForbiddenException('Acesso restrito à igreja do usuário!');
}
