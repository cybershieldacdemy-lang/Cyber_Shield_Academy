import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Fetch instructors and any aggregated data
        const rows = db.prepare(`
            SELECT 
                id, name, email, avatar, role, account_type, google_email, created_at, phone
            FROM users 
            WHERE role = 'teacher' OR account_type = 'instructor'
            ORDER BY created_at DESC
        `).all();

        return NextResponse.json({ instructors: rows });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error", detail: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { action, targetUserId } = body;

        if (!action || !targetUserId) {
            return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
        }

        if (action === 'suspend') {
            db.prepare('UPDATE users SET role = "suspended", account_type = "suspended" WHERE id = ?').run(targetUserId);
            return NextResponse.json({ message: 'Instructor Suspended' });
        } else if (action === 'approve') {
            db.prepare('UPDATE users SET role = "teacher", account_type = "instructor" WHERE id = ?').run(targetUserId);
            return NextResponse.json({ message: 'Instructor Approved' });
        }

        return NextResponse.json({ message: 'Action not mapped' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error", detail: error.message }, { status: 500 });
    }
}
