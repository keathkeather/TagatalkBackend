import { Module, forwardRef } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SkillService } from '../skill/skill.service';
import { GameService } from '../game/game.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { LessonModule } from '../lesson/lesson.module';
import { GameModule } from '../game/game.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule
import { UserProgressService } from '../user-progress/user-progress.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { S3Service } from '../s3/s3.service';
import { GameAssetsService } from 'src/game-assets/game-assets.service';

@Module({
  providers: [
    UnitService,
    PrismaService,
    SkillService,
    JwtService,
    UserProgressService,
    { provide: EventEmitter2, useValue: new EventEmitter2() },
    S3Service,
    GameAssetsService,
    GameService,
  ],
  controllers: [UnitController],
  imports: [ 
    forwardRef(() => UserProgressModule),
  ],
  exports: [UnitService],
})
export class UnitModule {}
