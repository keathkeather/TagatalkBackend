import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthService } from '../auth/auth.service';
import {MailerService} from '../mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';
@Module({
  controllers: [AdminController],
  providers: [AdminService,PrismaService,AuthService,JwtService,MailerService]
})
export class AdminModule {}
