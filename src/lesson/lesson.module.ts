import { Module, forwardRef } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SkillService } from '../skill/skill.service';
import { UnitModule } from '../unit/unit.module';

@Module({
  providers: [
    LessonService,
    PrismaService,
    SkillService,
  ],
  controllers: [LessonController],
  imports: [
    forwardRef(() => UnitModule), // Ensure UnitModule is imported
  ],
  exports: [LessonService],
})
export class LessonModule {}
