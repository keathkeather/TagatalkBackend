import { Module } from '@nestjs/common';
import { GameAssetsService } from './game-assets.service';
import { GameAssetsController } from './game-assets.controller';

@Module({
  providers: [GameAssetsService],
  controllers: [GameAssetsController]
})
export class GameAssetsModule {}
