import * as jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret-please-change';

export function signToken(payload: object, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
