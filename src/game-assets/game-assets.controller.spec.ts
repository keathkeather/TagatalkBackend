import { Test, TestingModule } from '@nestjs/testing';
import { GameAssetsController } from './game-assets.controller';
import { GameAssetsService } from './game-assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { GameService } from '../game/game.service';
describe('GameAssetsController', () => {
  let controller: GameAssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameAssetsController],providers:[GameService,GameAssetsService,PrismaService,S3Service]
    }).compile();

    controller = module.get<GameAssetsController>(GameAssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
