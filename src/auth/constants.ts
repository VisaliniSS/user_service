const rawExpires = process.env.JWT_EXPIRES_IN;
export const jwtConstants: { secret: string; expiresIn?: number | string } = {
  secret: process.env.JWT_SECRET ?? 'CHANGE_THIS_SECRET',
  expiresIn:
    rawExpires === undefined
      ? '3600s'
      : isNaN(Number(rawExpires))
      ? rawExpires
      : Number(rawExpires),
};
