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

@Module({
  imports: [AuthModule, UserModule, PrismaModule, ReportModule, FeedbackModule, AdminModule, GameModule, GameAssetsModule, MailerModule],
  controllers: [AppController],
  providers: [AppService, MailerService],
})
export class AppModule {}
