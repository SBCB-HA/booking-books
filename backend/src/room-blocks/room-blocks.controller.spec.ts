import { Test, TestingModule } from '@nestjs/testing';
import { RoomBlocksController } from './room-blocks.controller.js';

describe('RoomBlocksController', () => {
  let controller: RoomBlocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomBlocksController],
    }).compile();

    controller = module.get<RoomBlocksController>(RoomBlocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
