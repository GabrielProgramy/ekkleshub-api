import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
	@IsEmail({}, { message: 'Informe um email válido!' })
	email: string;

	@IsString({ message: 'A senha precisa ser uma string válida!' })
	@MinLength(8, { message: 'A senha precisa ter no mínimo 8 caracteres!' })
	password: string;
}
