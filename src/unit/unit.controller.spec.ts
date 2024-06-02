import { Test, TestingModule } from '@nestjs/testing';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { PrismaService } from '../prisma/prisma.service';
import { SkillService } from '../skill/skill.service';
import { JwtService } from '@nestjs/jwt';
import { GameService } from '../game/game.service';
import { UserService } from '../user/user.service';
import { forwardRef } from '@nestjs/common';
import { LessonModule } from '../lesson/lesson.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { GameModule } from '../game/game.module';
import { AuthModule } from '../auth/auth.module';
import { UserProgressService } from '../user-progress/user-progress.service';

describe('UnitController', () => {
  let controller: UnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitController],providers: [
        UnitService,
        PrismaService,
        SkillService,
        JwtService,
        GameService,
        UserService,
        UserProgressService
      ],
      imports: [
        forwardRef(() => LessonModule),
        forwardRef(() => GameModule),
        forwardRef(() => UserProgressModule),
        forwardRef(() => AuthModule), // Add this line
      ],
    }).compile();

    controller = module.get<UnitController>(UnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
