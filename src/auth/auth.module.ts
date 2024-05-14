import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; 
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { SessionSerializer } from './utils/Serializer';


@Module({
  imports:[
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRECT_KEY,
      signOptions:{expiresIn:'1h'}
    })
  ],
  providers: [AuthService,PrismaService,JwtStrategy,LocalStrategy, GoogleStrategy, SessionSerializer],
  controllers: [AuthController]
})
export class AuthModule {}
