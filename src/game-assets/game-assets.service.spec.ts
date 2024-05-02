import { Test, TestingModule } from '@nestjs/testing';
import { GameAssetsService } from './game-assets.service';

describe('GameAssetsService', () => {
  let service: GameAssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameAssetsService],
    }).compile();

    service = module.get<GameAssetsService>(GameAssetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
