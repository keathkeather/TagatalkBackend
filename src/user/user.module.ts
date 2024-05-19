import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';
@Module({
  providers: [UserService,PrismaService,AuthService,JwtService,MailerService],
  controllers: [UserController]
})
export class UserModule {}
