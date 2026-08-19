class CreateModulePermissionDto {
	permission: 'FULL' | 'READ' | 'NONE';
	scope: 'GLOBAL' | 'OWN_CHURCH';
}

export class CreatePermissionDto {
	CHURCHES: CreateModulePermissionDto;
	MEMBERS: CreateModulePermissionDto;
	USERS: CreateModulePermissionDto;
	ACCESS_PROFILES: CreateModulePermissionDto;
	PASTORAL_LEADERSHIP: CreateModulePermissionDto;
	AUDIT: CreateModulePermissionDto;
}
