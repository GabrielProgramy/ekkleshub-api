import { IsEnum, ValidateNested } from 'class-validator';
import {
	PermissionLevel,
	PermissionScope,
} from '../entities/access-profile.entity';
import { Type } from 'class-transformer';

class CreateModulePermissionDto {
	@IsEnum(PermissionLevel, { message: 'Informe um valor válido!' })
	permission: PermissionLevel;

	@IsEnum(PermissionScope, { message: 'Informe um valor válido!' })
	scope: PermissionScope;
}

export class CreatePermissionDto {
	@ValidateNested()
	@Type(() => CreateModulePermissionDto)
	CHURCHES: CreateModulePermissionDto;

	@ValidateNested()
	@Type(() => CreateModulePermissionDto)
	MEMBERS: CreateModulePermissionDto;

	@ValidateNested()
	@Type(() => CreateModulePermissionDto)
	USERS: CreateModulePermissionDto;

	@ValidateNested()
	@Type(() => CreateModulePermissionDto)
	ACCESS_PROFILES: CreateModulePermissionDto;

	@ValidateNested()
	@Type(() => CreateModulePermissionDto)
	PASTORAL_LEADERSHIP: CreateModulePermissionDto;

	@ValidateNested()
	@Type(() => CreateModulePermissionDto)
	AUDIT: CreateModulePermissionDto;
}
