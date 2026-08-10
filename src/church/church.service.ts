import { Injectable } from '@nestjs/common';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Injectable()
export class ChurchService {
  create(createChurchDto: CreateChurchDto) {
    return 'This action adds a new church';
  }

  findAll() {
    return `This action returns all church`;
  }

  findOne(id: number) {
    return `This action returns a #${id} church`;
  }

  update(id: number, updateChurchDto: UpdateChurchDto) {
    return `This action updates a #${id} church`;
  }

  remove(id: number) {
    return `This action removes a #${id} church`;
  }
}
