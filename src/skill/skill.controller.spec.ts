import { Test, TestingModule } from '@nestjs/testing';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnitService } from '../unit/unit.service';

describe('SkillController', () => {
  let controller: SkillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillController],providers:[SkillService,PrismaService]
    }).compile();

    controller = module.get<SkillController>(SkillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
