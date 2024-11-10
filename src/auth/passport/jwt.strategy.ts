import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '903deaac-5c0d-4411-9131-cd7277a570fb', // Use the correct environment variable for the secret
    });
  }

  async validate(payload: any) {
    // Validate the payload and return the user object
    return payload;
  }
}
