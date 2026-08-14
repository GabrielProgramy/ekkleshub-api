import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsPhoneNumber,
	IsString,
	ValidateNested,
} from 'class-validator';
import { ChurchType } from '../entities/church.entity';
import { CreateAddressDTO } from './create-address.dto';
import { Type } from 'class-transformer';

export class CreateChurchDto {
	@IsString({ message: 'O nome precisa ser uma string válida!' })
	name: string;

	@IsEnum(ChurchType, { message: 'Informe um tipo válido!' })
	type: ChurchType;

	@ValidateNested()
	@Type(() => CreateAddressDTO)
	address: CreateAddressDTO;

	@IsOptional()
	@IsPhoneNumber(undefined, { message: 'Informe um número de Telefone válido' })
	phone?: string | null;

	@IsOptional()
	@IsEmail()
	email?: string | null;
}
