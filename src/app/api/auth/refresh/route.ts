/**
 * 🔄 Token Refresh API Endpoint
 * POST /api/auth/refresh — Exchange refresh token for new access + refresh tokens
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAndRotateRefreshToken, setAuthCookies } from '@/lib/auth-tokens';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token missing' },
        { status: 401 }
      );
    }

    const result = verifyAndRotateRefreshToken(refreshToken);

    if (!result) {
      logger.authFail('Refresh token invalid or expired', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        { message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Set new cookies
    await setAuthCookies(result.accessToken, result.refreshToken);

    logger.auth('Token refreshed successfully', { tokenId: result.tokenId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('auth', 'Token refresh error', { error: String(error) });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
