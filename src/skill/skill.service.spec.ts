import { Test, TestingModule } from '@nestjs/testing';
import { SkillService } from './skill.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnitService } from '../unit/unit.service';

describe('SkillService', () => {
  let service: SkillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkillService,PrismaService],
    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
