import { Module } from '@nestjs/common';
import { GameAssetsService } from './game-assets.service';
import { GameAssetsController } from './game-assets.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from '../game/game.service';
import { S3Service } from '../s3/s3.service';
@Module({
  providers: [GameAssetsService,S3Service,PrismaService,GameService],
  controllers: [GameAssetsController]
})
export class GameAssetsModule {}
