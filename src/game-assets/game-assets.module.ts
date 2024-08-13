import { Module } from '@nestjs/common';
import { GameAssetsService } from './game-assets.service';
import { GameAssetsController } from './game-assets.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from '../game/game.service';
@Module({
  providers: [GameAssetsService,PrismaService,GameService],
  controllers: [GameAssetsController]
})
export class GameAssetsModule {}
