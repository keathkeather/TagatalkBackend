import { Module } from '@nestjs/common';
import { GameAssetsService } from './game-assets.service';
import { GameAssetsController } from './game-assets.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [GameAssetsService,PrismaService],
  controllers: [GameAssetsController]
})
export class GameAssetsModule {}
