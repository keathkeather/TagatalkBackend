import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from './lesson.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnitService } from '../unit/unit.service';
import { SkillService } from '../skill/skill.service';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Mock dependencies
const mockPrismaService = {};
const mockUnitService = {};
const mockSkillService = {};
const mockJwtService = {};
const mockEventEmitter2 = {};

describe('LessonService', () => {
  let service: LessonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UnitService, useValue: mockUnitService },
        { provide: SkillService, useValue: mockSkillService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EventEmitter2, useValue: mockEventEmitter2 },
      ],
      imports: [
        // Include only the necessary modules for this test
        // Exclude modules that are not needed for this specific test
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
