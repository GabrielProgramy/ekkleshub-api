import { Test, TestingModule } from '@nestjs/testing';
import { ChurchService } from './church.service';

describe('ChurchService', () => {
  let service: ChurchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChurchService],
    }).compile();

    service = module.get<ChurchService>(ChurchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
