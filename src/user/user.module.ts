import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthService } from '../auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';
import { PassportModule } from '@nestjs/passport';
import {GameService} from '../game/game.service'
@Module({imports:[
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions:{expiresIn:'1h'}
    })
  ],
  providers: [UserService,PrismaService,AuthService,JwtService,MailerService,GameService],
  controllers: [UserController]
})
export class UserModule {}
