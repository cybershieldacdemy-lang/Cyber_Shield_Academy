import { NextResponse } from 'next/server';
import { generateTwoFactorSecret } from '@/lib/two-factor';
import { guardRoute } from '@/lib/api-guard';
import db from '@/lib/db';

// POST /api/auth/2fa/setup
export async function POST(req: Request) {
    const { user, error } = await guardRoute(req, { requireAuth: true });
    if (error) return error;

    try {
        // Fetch current user from DB to ensure they don't already have 2FA enabled
        const dbUser = db.prepare('SELECT isTwoFactorEnabled FROM users WHERE id = ?').get(user!.id) as any;
        if (dbUser?.isTwoFactorEnabled) {
            return NextResponse.json({ message: 'المصادقة الثنائية مفعلة مسبقاً' }, { status: 400 });
        }

        const { secret, qrCodeUrl } = await generateTwoFactorSecret(user!.email);

        return NextResponse.json({ secret, qrCodeUrl });
    } catch (e: any) {
        console.error('2FA Setup Error:', e);
        return NextResponse.json({ message: 'حدث خطأ أثناء إنشاء 2FA' }, { status: 500 });
    }
}
