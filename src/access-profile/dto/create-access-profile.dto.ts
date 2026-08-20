import { IsString, ValidateNested } from 'class-validator';
import { CreatePermissionDto } from './create-module-permission.dto';
import { Type } from 'class-transformer';

export class CreateAccessProfileDto {
	@IsString({ message: 'O nome precisa ser uma string válida!' })
	name: string;

	@ValidateNested()
	@Type(() => CreatePermissionDto)
	permissions: CreatePermissionDto;
}
