import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { MailerService } from '../mailer/mailer.service';
import { GameService } from '../game/game.service';
import { S3Service } from '../s3/s3.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[    EventEmitterModule.forRoot()],
      providers: [UserService,PrismaService,JwtService,AuthService,MailerService,S3Service],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
