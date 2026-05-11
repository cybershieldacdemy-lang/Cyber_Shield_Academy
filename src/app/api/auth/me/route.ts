import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // Fetch full user data from DB to include account_type and other fields
        const user = db.prepare(
            'SELECT id, name, email, role, account_type, experience_level, country, phone, bio, avatar, google_email, isTwoFactorEnabled FROM users WHERE id = ?'
        ).get(payload.id) as Record<string, unknown> | undefined;

        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            user,
        });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
