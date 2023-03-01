export type JwtPayload = {
  sub: string;
  'https://symeo.io/email': string;
  'https://symeo.io/username': string;
  iat: number;
  exp: number;
};
