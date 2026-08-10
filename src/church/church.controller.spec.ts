import { Test, TestingModule } from '@nestjs/testing';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';

describe('ChurchController', () => {
  let controller: ChurchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChurchController],
      providers: [ChurchService],
    }).compile();

    controller = module.get<ChurchController>(ChurchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
