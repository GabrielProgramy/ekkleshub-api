import { CreatePermissionDto } from './create-module-permission.dto';

export class UpdateAccessProfileDto {
	name?: string | undefined;
	permissions?: Partial<CreatePermissionDto> | undefined;
}
