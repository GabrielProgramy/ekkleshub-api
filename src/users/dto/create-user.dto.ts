import {
	IsEmail,
	IsOptional,
	IsString,
	IsUUID,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@IsString({ message: 'O nome precisa ser uma string válida!' })
	name: string;

	@IsEmail({}, { message: 'Informe um email válido!' })
	email: string;

	@IsString({ message: 'A senha precisa ser uma string válida!' })
	@MinLength(8, { message: 'A senha precisa ter no mínimo 8 caracteres!' })
	password: string;

	@IsUUID('4', { message: 'Informe um perfil de acesso válido!' })
	access_profile_id: string;

	@IsOptional()
	@IsUUID('4', { message: 'Informe uma igreja válida!' })
	church_id?: string;

	@IsOptional()
	@IsUUID('4', { message: 'Informe um membro válido!' })
	member_id?: string;
}
