import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
	@IsString({ message: 'O refresh token precisa ser uma string válida!' })
	@IsNotEmpty({ message: 'O refresh token é obrigatório!' })
	refreshToken: string;
}
