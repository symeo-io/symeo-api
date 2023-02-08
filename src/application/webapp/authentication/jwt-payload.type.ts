export type JwtPayload = {
  sub: string;
  'https://symeo.io/email': string;
  iat: number;
  exp: number;
};
