import { PartialType } from '@nestjs/mapped-types';
import { CreateChurchDto } from './create-church.dto';

export class UpdateChurchDto extends PartialType(CreateChurchDto) {}
