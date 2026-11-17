import { Request } from 'express';
import { Permission } from '../../access-profile/entities/access-profile.entity';

export type AuthenticatedUser = {
	id: string;
	email: string;
	accessProfileId: string;
	churchId?: string;
	tokenType: 'access';
	iat?: number;
	exp?: number;
};

export type AuthenticatedRequest = Request & {
	user?: AuthenticatedUser;
	permissions?: Permission;
};
