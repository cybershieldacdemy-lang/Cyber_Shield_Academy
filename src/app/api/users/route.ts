import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

export async function GET(req: Request) {
    // Admin only — protect user listing
    const { user, error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';

        let query = 'SELECT id, name, email, role, account_type, experience_level, country, avatar, created_at FROM users WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const params: unknown[] = [];
        const countParams: unknown[] = [];

        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ?)';
            countQuery += ' AND (name LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`);
        }
        if (role) {
            query += ' AND role = ?';
            countQuery += ' AND role = ?';
            params.push(role);
            countParams.push(role);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const users = db.prepare(query).all(...params);
        const { total } = db.prepare(countQuery).get(...countParams) as any;

        logAudit({
            action: 'DATA_ACCESS',
            userId: user?.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'users',
            details: `الوصول لقائمة المستخدمين — ${users.length} نتيجة`,
            severity: 'low',
        });

        return NextResponse.json({ users, total });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'خطأ في جلب المستخدمين' }, { status: 500 });
    }
}

// POST /api/users (Admin Create User)
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { name, email, password, role } = body as any;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة' }, { status: 400 });
        }

        // Check for duplicate email
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return NextResponse.json({ message: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 409 });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();

        const stmt = db.prepare(`
            INSERT INTO users (id, name, email, password_hash, role, account_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        stmt.run(id, name, email, hashedPassword, role || 'user', 'email');

        logAudit({
            action: 'USER_CREATE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'users',
            resourceId: id,
            details: `Created user: ${name} (${email}) - Role: ${role || 'user'}`,
            severity: 'high'
        });

        return NextResponse.json({ message: 'تم إنشاء المستخدم بنجاح', id }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: 'خطأ في إنشاء المستخدم' }, { status: 500 });
    }
}
