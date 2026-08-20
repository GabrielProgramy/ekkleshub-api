import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePermissionDto } from './create-module-permission.dto';
import { Type } from 'class-transformer';

export class UpdateAccessProfileDto {
	@IsString()
	@IsOptional()
	name?: string | undefined;

	@ValidateNested()
	@Type(() => CreatePermissionDto)
	@IsOptional()
	permissions?: Partial<CreatePermissionDto> | undefined;
}
