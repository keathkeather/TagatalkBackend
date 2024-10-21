import { Test, TestingModule } from '@nestjs/testing';
import { UserProgressService } from './user-progress.service';
import { GameService } from '../game/game.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameModule } from '../game/game.module';
import { AuthModule } from '../auth/auth.module';
import { LessonModule } from '../lesson/lesson.module';
import { UnitModule } from '../unit/unit.module'; // Ensure this is imported if needed
import { forwardRef } from '@nestjs/common';
import { LessonService } from '../lesson/lesson.service';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { S3Service } from '../s3/s3.service';
describe('UserProgressService', () => {
  let service: UserProgressService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UserProgressService, PrismaService, JwtService, UserService, LessonService,S3Service],
      imports: [
        forwardRef(() => GameModule), 
        forwardRef(() => AuthModule),
        forwardRef(() => LessonModule),
        forwardRef(() => UnitModule), 
        EventEmitterModule
        // Add this line if UnitModule is necessary
      ],
    }).compile();

    service = module.get<UserProgressService>(UserProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
