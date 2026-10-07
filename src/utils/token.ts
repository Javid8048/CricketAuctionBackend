import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cricket-auction-arena-super-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'TEAM' | 'SPECTATOR';
  teamId?: string | null;
  teamName?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
