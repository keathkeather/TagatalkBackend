import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from './lesson.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnitService } from '../unit/unit.service';
import { UnitModule } from '../unit/unit.module';
import { forwardRef } from '@nestjs/common';
import { SkillService } from '../skill/skill.service';
import { SkillModule } from '../skill/skill.module';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
describe('LessonService', () => {
  let service: LessonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonService,PrismaService,UnitService,SkillService,JwtService],
      imports: [
        forwardRef(() => UnitModule), // Ensure UnitModule is imported
        SkillModule,
        UserModule,
        UserProgressModule
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
