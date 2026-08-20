import { IsOptional, IsString } from 'class-validator';
import { CreatePermissionDto } from './create-module-permission.dto';

export class UpdateAccessProfileDto {
	@IsString()
	@IsOptional()
	name?: string | undefined;

	@IsOptional()
	permissions?: Partial<CreatePermissionDto> | undefined;
}
