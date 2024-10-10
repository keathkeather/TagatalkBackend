import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportModule } from './report/report.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AdminModule } from './admin/admin.module';
import { GameModule } from './game/game.module';
import { GameAssetsModule } from './game-assets/game-assets.module';
import { MailerService } from './mailer/mailer.service';
import { MailerModule } from './mailer/mailer.module';
import { ContentEditorModule } from './content-editor/content-editor.module';
import { UnitModule } from './unit/unit.module';
import { LessonModule } from './lesson/lesson.module';
import { SkillModule } from './skill/skill.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { SpeechToTextModule } from './speech-to-text/speech-to-text.module';

@Module({
  imports: [
    AuthModule, 
    UserModule, 
    PrismaModule, 
    ReportModule, 
    FeedbackModule, 
    AdminModule, 
    GameModule, 
    GameAssetsModule, 
    MailerModule, 
    ContentEditorModule, 
    UnitModule, 
    LessonModule, 
    SkillModule, 
    UserProgressModule,
    EventEmitterModule.forRoot(),
    S3Module,
    SpeechToTextModule,],
  controllers: [AppController],
  providers: [AppService, MailerService, S3Service],
})
export class AppModule {}
