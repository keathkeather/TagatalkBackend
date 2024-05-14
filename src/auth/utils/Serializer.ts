import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  serializeUser(user: User, done: Function) {
    console.log('Serializer User');
    // Serialize user data and generate JWT token
    const token = this.jwtService.sign({ useremail: user.email });
    done(null, token);
  }

  async deserializeUser(token: string, done: Function) {
    try {
      // Verify JWT token and extract user data
      const decodedToken = this.jwtService.verify(token)
      const user = await this.authService.findByEmail(decodedToken.email);
      console.log('Deserialize User');
      console.log(user);
      return user ? done(null, user) : done(null, null);
    } catch (error) {
      return done(error);
    }
  }
}