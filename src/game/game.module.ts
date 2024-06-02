import { Module, forwardRef } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { LessonService } from '../lesson/lesson.service';
import { LessonModule } from '../lesson/lesson.module'; // Import LessonModule
import { UnitModule } from '../unit/unit.module'; // Import UnitModule

@Module({
  controllers: [GameController],
  providers: [GameService, PrismaService, LessonService],
  imports: [
    forwardRef(() => LessonModule),
    forwardRef(() => UnitModule), // Ensure UnitModule is imported
  ],
  exports: [GameService],
})
export class GameModule {}
