import { Test, TestingModule } from '@nestjs/testing';
import { RoomBlocksService } from './room-blocks.service.js';

describe('RoomBlocksService', () => {
  let service: RoomBlocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomBlocksService],
    }).compile();

    service = module.get<RoomBlocksService>(RoomBlocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
