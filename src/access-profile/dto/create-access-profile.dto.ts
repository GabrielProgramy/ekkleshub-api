import { CreatePermissionDto } from './create-module-permission.dto';

export class CreateAccessProfileDto {
	name: string;
	permissions: CreatePermissionDto;
}
