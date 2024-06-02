import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { LessonService } from '../lesson/lesson.service';
import { forwardRef } from '@nestjs/common';
import { LessonModule } from '../lesson/lesson.module';
import { UnitModule } from '../unit/unit.module';
describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService,PrismaService,LessonService],imports: [
        forwardRef(() => LessonModule),
        forwardRef(() => UnitModule), // Ensure UnitModule is imported
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
