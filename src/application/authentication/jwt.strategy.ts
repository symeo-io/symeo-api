import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { config } from 'symeo/config';
import User from 'src/domain/model/user.model';
import { JwtPayload } from 'src/application/authentication/jwt-payload.type';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${config.auth0.issuer}.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.auth0.audience,
      issuer: `${config.auth0.issuer}`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): unknown {
    return new User(
      payload.sub,
      payload['https://symeo.io/email'],
      payload.sub.split('|')[0] as VCSProvider,
    );
  }
}
