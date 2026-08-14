import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateChurchDto } from './create-church.dto';

export class UpdateChurchDto extends PartialType(
	OmitType(CreateChurchDto, ['type']),
) {}
