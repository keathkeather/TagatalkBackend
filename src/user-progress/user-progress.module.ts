import { Module, forwardRef } from '@nestjs/common';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';
import { GameModule } from '../game/game.module'; // Import GameModule
import { AuthModule } from '../auth/auth.module'; // Import AuthModule
import { LessonModule } from '../lesson/lesson.module'; // Import LessonModule
import { UnitModule } from '../unit/unit.module';
import { LessonService } from '../lesson/lesson.service';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    EventEmitterModule.forRoot(),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService, PrismaService, JwtService,LessonService, ]
})
export class UserProgressModule {}
