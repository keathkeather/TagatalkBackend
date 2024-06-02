import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  providers: [SkillService, PrismaService],
  controllers: [SkillController]
})
export class SkillModule {}
