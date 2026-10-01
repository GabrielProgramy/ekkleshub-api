export type AuthenticatedUser = {
	id: string;
	email: string;
	accessProfileId: string;
	churchId?: string;
	tokenType: 'access';
	iat?: number;
	exp?: number;
};
