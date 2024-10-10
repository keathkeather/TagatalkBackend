import { Test, TestingModule } from '@nestjs/testing';
import { GameAssetsService } from './game-assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from '../game/game.service';
import { S3Service } from '../s3/s3.service';
describe('GameAssetsService', () => {
  let service: GameAssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameAssetsService,PrismaService,GameService,S3Service],
    }).compile();

    service = module.get<GameAssetsService>(GameAssetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
