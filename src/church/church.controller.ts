import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Post()
  create(@Body() createChurchDto: CreateChurchDto) {
    return this.churchService.create(createChurchDto);
  }

  @Get()
  findAll() {
    return this.churchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.churchService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChurchDto: UpdateChurchDto) {
    return this.churchService.update(+id, updateChurchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.churchService.remove(+id);
  }
}
