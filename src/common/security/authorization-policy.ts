import { ForbiddenException } from '@nestjs/common';
import { AccessProfileService } from '../../access-profile/access-profile.service';
import {
	PermissionLevel,
	PermissionModule,
	PermissionScope,
} from '../../access-profile/entities/access-profile.entity';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';

export async function assertPermission(
	accessProfileService: AccessProfileService,
	user: AuthenticatedUser | undefined,
	module: PermissionModule,
	requiredPermission: PermissionLevel,
	targetChurchId?: string,
): Promise<void> {
	if (!user) return;

	const accessProfile = await accessProfileService.findOne(
		user.accessProfileId,
	);
	const modulePermission = accessProfile?.permissions?.[module];

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
