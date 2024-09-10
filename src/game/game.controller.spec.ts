import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { LessonService } from '../lesson/lesson.service';
import { forwardRef } from '@nestjs/common';
import { LessonModule } from '../lesson/lesson.module';
import { UnitModule } from '../unit/unit.module';

describe('GameController', () => {
  let controller: GameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],providers:[GameService,PrismaService,LessonService],
      // imports: [
      //   forwardRef(() => LessonModule),
      //   forwardRef(() => UnitModule), // Ensure UnitModule is imported
      // ],
    }).compile();

    controller = module.get<GameController>(GameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
