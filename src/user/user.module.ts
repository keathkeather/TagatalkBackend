import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
@Module({
  providers: [UserService,PrismaService,AuthService,JwtService],
  controllers: [UserController]
})
export class UserModule {}
