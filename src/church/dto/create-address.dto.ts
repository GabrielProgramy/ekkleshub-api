import { IsOptional, IsString } from 'class-validator';

export class CreateAddressDTO {
	@IsString({ message: 'Informe uma string válida para a rua!' })
	street: string;

	@IsString({ message: 'Informe uma string válida para a número!' })
	number: string;

	@IsString({ message: 'Informe uma string válida para a cidade!' })
	city: string;

	@IsString({ message: 'Informe uma string válida para a estado!' })
	state: string;

	@IsOptional()
	@IsString({ message: 'Informe uma string válida para a complemento!' })
	complement?: string | null;

	@IsString({ message: 'Informe uma string válida para a CEP!' })
	zip_code: string;
}
