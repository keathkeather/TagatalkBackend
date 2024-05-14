import { Test, TestingModule } from '@nestjs/testing';
import { GameAssetsController } from './game-assets.controller';
import { GameAssetsService } from './game-assets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GameAssetsController', () => {
  let controller: GameAssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameAssetsController],providers:[GameAssetsService,PrismaService]
    }).compile();

    controller = module.get<GameAssetsController>(GameAssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
