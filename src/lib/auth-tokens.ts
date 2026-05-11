/**
 * 🔄 JWT Refresh Token System
 * 
 * Implements secure token rotation:
 * - Access tokens: 15 min expiry (used for API calls)
 * - Refresh tokens: 7 day expiry (used to get new access tokens)
 * - Token rotation: each refresh invalidates the old refresh token
 * - Stored in httpOnly secure cookies
 */
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'cybershield-dev-secret-change-in-production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

// ─── Generate Token Pair ───
export function generateTokenPair(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' } as TokenPayload,
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' } as TokenPayload,
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Store refresh token hash in DB for validation
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenId, userId, hashToken(refreshToken), expiresAt);
  } catch {
    // Table might not exist yet, skip
  }

  return { accessToken, refreshToken, tokenId };
}

// ─── Verify Access Token ───
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (payload.type !== 'access') return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Verify & Rotate Refresh Token ───
export function verifyAndRotateRefreshToken(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;
    if (payload.type !== 'refresh') return null;

    const tokenHash = hashToken(refreshToken);

    // Check if refresh token exists and is valid in DB
    const stored = db.prepare(
      `SELECT id FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > datetime('now')`
    ).get(payload.userId, tokenHash) as any;

    if (!stored) return null;

    // Invalidate old refresh token (rotation)
    db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(stored.id);

    // Clean up expired tokens for this user
    db.prepare(
      `DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < datetime('now')`
    ).run(payload.userId);

    // Generate new token pair
    return generateTokenPair(payload.userId, payload.email, payload.role);
  } catch {
    return null;
  }
}

// ─── Set Auth Cookies ───
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set('token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// ─── Clear Auth Cookies ───
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('refresh_token');
}

// ─── Revoke All User Sessions ───
export function revokeAllUserSessions(userId: string) {
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
}

// ─── Simple hash for token storage ───
function hashToken(token: string): string {
  // Use a simple hash — not crypto-grade since the token itself is the secret
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sh_${Math.abs(hash).toString(36)}`;
}
