import { Test, TestingModule } from '@nestjs/testing';
import { UserProgressService } from './user-progress.service';
import { GameService } from '../game/game.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameModule } from '../game/game.module';
import { AuthModule } from '../auth/auth.module';
import { LessonModule } from '../lesson/lesson.module';
import { UnitModule } from '../unit/unit.module';
import { forwardRef } from '@nestjs/common';

describe('UserProgressService', () => {
  let service: UserProgressService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UserProgressService, PrismaService, JwtService, UserService, GameService],
      imports: [
        forwardRef(() => GameModule),
        forwardRef(() => AuthModule),
        forwardRef(() => LessonModule),
        forwardRef(() => UnitModule), // Include UnitModule here
      ],
    }).compile();

    service = module.get<UserProgressService>(UserProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
