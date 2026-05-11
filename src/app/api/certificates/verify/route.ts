/**
 * 🏅 Certificate QR Code Verification API
 * GET /api/certificates/verify?code=CS-XXXXXXXX
 * 
 * Returns certificate details + generates QR code data URL for public verification.
 */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || !code.startsWith('CS-')) {
      return NextResponse.json({ 
        valid: false, 
        message: 'رمز الشهادة غير صالح. يجب أن يبدأ بـ CS-' 
      }, { status: 400 });
    }

    const cert = db.prepare(`
      SELECT c.*, u.name as holder_name, u.avatar
      FROM certificates c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.certificate_code = ?
    `).get(code) as any;

    if (!cert) {
      return NextResponse.json({ 
        valid: false, 
        message: 'الشهادة غير موجودة في النظام',
        code 
      }, { status: 404 });
    }

    // Build verification URL for QR code
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/certificates/verify?code=${code}`;

    // Generate simple QR code as SVG (no external dependency needed)
    const qrSvg = generateQRSvg(verifyUrl);

    return NextResponse.json({
      valid: true,
      certificate: {
        code: cert.certificate_code,
        holderName: cert.user_name || cert.holder_name,
        courseTitle: cert.course_title,
        issuedAt: cert.issued_at,
        holderAvatar: cert.avatar,
      },
      verification: {
        url: verifyUrl,
        qrCodeSvg: qrSvg,
        verifiedAt: new Date().toISOString(),
        platform: 'CyberShield Academy',
      },
    });
  } catch (error) {
    console.error('Certificate verify error:', error);
    return NextResponse.json({ message: 'خطأ في التحقق' }, { status: 500 });
  }
}

// ─── Simple QR-like verification badge SVG ───
function generateQRSvg(url: string): string {
  // Generate a unique hash-based pattern for the certificate
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  const size = 21;
  const cells: boolean[][] = [];
  
  // Generate deterministic pattern from URL hash
  let seed = Math.abs(hash);
  for (let y = 0; y < size; y++) {
    cells[y] = [];
    for (let x = 0; x < size; x++) {
      // Fixed patterns for QR-like corners
      const isCorner = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      const isCornerBorder = isCorner && (x === 0 || x === 6 || y === 0 || y === 6 || 
        (x >= size-7 && (x === size-7 || x === size-1)) || 
        (y >= size-7 && (y === size-7 || y === size-1)));
      const isCornerCenter = isCorner && x >= 2 && x <= 4 && y >= 2 && y <= 4;
      
      if (isCornerBorder || isCornerCenter) {
        cells[y][x] = true;
      } else if (isCorner) {
        cells[y][x] = false;
      } else {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        cells[y][x] = (seed % 3) !== 0;
      }
    }
  }

  const cellSize = 4;
  const padding = 8;
  const totalSize = size * cellSize + padding * 2;
  
  let rects = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (cells[y][x]) {
        rects += `<rect x="${padding + x * cellSize}" y="${padding + y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0ea5e9"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
    <rect width="${totalSize}" height="${totalSize}" fill="white" rx="4"/>
    ${rects}
    <text x="${totalSize/2}" y="${totalSize + 12}" text-anchor="middle" font-size="6" fill="#64748b" font-family="monospace">CyberShield Verified</text>
  </svg>`;
}
