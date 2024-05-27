import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Response } from 'express';
import { HttpException, Injectable, Res, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class adminStrategy extends PassportStrategy(Strategy,'admin') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    console.log('Inside adminStrategy');
    const user = await this.authService.validateAdmin(email, password);
    console.log(user)
    if (!user) throw new HttpException('Unauthorized user', 401);
    return user;
  }
}