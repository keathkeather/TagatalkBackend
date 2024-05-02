import { Test, TestingModule } from '@nestjs/testing';
import { GameAssetsController } from './game-assets.controller';

describe('GameAssetsController', () => {
  let controller: GameAssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameAssetsController],
    }).compile();

    controller = module.get<GameAssetsController>(GameAssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
