import { Test, TestingModule } from '@nestjs/testing';
import { UnitService } from './unit.service';
import { PrismaService } from '../prisma/prisma.service';
import { SkillService } from '../skill/skill.service';
import { JwtService } from '@nestjs/jwt';
import { GameService } from '../game/game.service';
import { UserService } from '../user/user.service';
import { LessonModule } from '../lesson/lesson.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { GameModule } from '../game/game.module';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';
import { UserProgressService } from '../user-progress/user-progress.service';
import { SkillModule } from '../skill/skill.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { S3Service } from '../s3/s3.service';
describe('UnitService', () => {
  let service: UnitService;
  let module: TestingModule;

  jest.setTimeout(30000); // Increase Jest timeout to 30 seconds

  beforeEach(async () => {
    console.log('Setting up the test module...');
    try {
      module = await Test.createTestingModule({
        providers: [
          UnitService,
          PrismaService,
          JwtService,
          GameService,
          UserService,
          UserProgressService,
          SkillService,{ provide: EventEmitter2, useValue: new EventEmitter2() },
          S3Service
        ],
        imports: [
          SkillModule,
          forwardRef(() => LessonModule),
          forwardRef(() => GameModule),
          forwardRef(() => UserProgressModule),
          forwardRef(() => AuthModule),
        ],
      }).compile();
      console.log('Test module setup complete.');
    } catch (error) {
      console.error('Error setting up test module:', error);
      throw error;
    }
    service = module.get<UnitService>(UnitService);
  });

  afterEach(async () => {
    console.log('Tearing down the test module...');
    try {
      await module.close(); // Ensure proper teardown
      console.log('Test module teardown complete.');
    } catch (error) {
      console.error('Error tearing down test module:', error);
      throw error;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
