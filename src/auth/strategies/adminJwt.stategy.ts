import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'adminJwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY, // replace with your secret key
      passReqToCallback: true, // enable this to pass req to validate method
    });
  }

  async validate(@Req() req:Request,) {
    const userId = await this.authService.verifyAdminJwtTokenForGuard(req);
    if (userId==null) {
      throw new UnauthorizedException();
    }
    return userId;
  }
}