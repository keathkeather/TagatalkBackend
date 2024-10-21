import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { MailerService } from '../mailer/mailer.service';
import { GameService } from '../game/game.service';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';
import { LessonModule } from '../lesson/lesson.module';
import { S3Service } from '../s3/s3.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],providers: [
        UserService,
        PrismaService,
        AuthService,
        JwtService,
        MailerService,
        GameService,
        S3Service
      ],imports:[
        PassportModule,
        JwtModule.register({
          secret: process.env.SECRET_KEY,
          signOptions:{expiresIn:'1h'}
        }),
        AuthModule,
        forwardRef(() => LessonModule), // Ensure AuthModule is imported
        EventEmitterModule.forRoot(),
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
