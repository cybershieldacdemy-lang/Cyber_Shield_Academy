import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, getRequestIP } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════
// GET /api/admin/users — Fetch users with search, filter, sort, pagination
// ═══════════════════════════════════════════════════════════
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const status = searchParams.get('status') || '';
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortDir = searchParams.get('sortDir') === 'asc' ? 'ASC' : 'DESC';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
        const offset = (page - 1) * limit;

        // Whitelist sortBy columns to prevent SQL injection
        const allowedSortColumns: Record<string, string> = {
            'name': 'name',
            'email': 'email',
            'role': 'role',
            'created_at': 'created_at',
            'points': 'points',
        };
        const safeSort = allowedSortColumns[sortBy] || 'created_at';

        // Build WHERE conditions dynamically
        const conditions: string[] = [];
        const params: any[] = [];

        if (search) {
            conditions.push('(name LIKE ? OR email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }
        if (status === 'suspended') {
            conditions.push("role = 'suspended'");
        } else if (status === 'active') {
            conditions.push("role != 'suspended'");
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Count total
        const countRow = db.prepare(`SELECT COUNT(*) as total FROM users ${whereClause}`).get(...params) as { total: number };
        const total = countRow?.total || 0;

        // Fetch page
        const users = db.prepare(`
            SELECT id, name, email, role, avatar, phone, country, bio, 
                   experience_level, account_type, points, email_verified, created_at
            FROM users 
            ${whereClause}
            ORDER BY ${safeSort} ${sortDir}
            LIMIT ? OFFSET ?
        `).all(...params, limit, offset);

        // Role distribution stats
        const roleStats = db.prepare(`
            SELECT role, COUNT(*) as count FROM users GROUP BY role
        `).all() as { role: string; count: number }[];

        return NextResponse.json({
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            roleStats,
        });
    } catch (error: any) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ message: 'Server error', detail: error.message }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════
// POST /api/admin/users — Create a new user
// ═══════════════════════════════════════════════════════════
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'الاسم والبريد وكلمة المرور مطلوبة' }, { status: 400 });
        }

        // Check duplicate email
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return NextResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const id = crypto.randomUUID();
        const validRole = ['admin', 'user', 'teacher', 'student'].includes(role) ? role : 'user';

        db.prepare(`
            INSERT INTO users (id, name, email, password, role, account_type) 
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, name.trim(), email.trim().toLowerCase(), hashedPassword, validRole, validRole === 'teacher' ? 'instructor' : 'student');

        const ip = getRequestIP(request);
        logAudit({
            action: 'USER_CREATED',
            userId: user.id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            resource: 'users',
            resourceId: id,
            details: `قام المسؤول ${user.email} بإنشاء حساب جديد: ${email} (${validRole})`,
            severity: 'medium',
        });

        return NextResponse.json({ message: 'تم إنشاء المستخدم بنجاح', id });
    } catch (error: any) {
        console.error('Admin users POST error:', error);
        return NextResponse.json({ message: 'Server error', detail: error.message }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/admin/users — Update user
// ═══════════════════════════════════════════════════════════
export async function PUT(request: Request) {
    try {
        const adminUser = await getAuthUser();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, email, role, phone, country, bio } = body;

        if (!id) {
            return NextResponse.json({ message: 'معرف المستخدم مطلوب' }, { status: 400 });
        }

        // Prevent admin from changing their own role
        if (id === adminUser.id && role && role !== 'admin') {
            return NextResponse.json({ message: 'لا يمكنك تغيير صلاحياتك الخاصة' }, { status: 403 });
        }

        // Check if user exists
        const existingUser = db.prepare('SELECT id, email FROM users WHERE id = ?').get(id) as { id: string; email: string } | undefined;
        if (!existingUser) {
            return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
        }

        // If email changed, check uniqueness
        if (email && email !== existingUser.email) {
            const emailTaken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
            if (emailTaken) {
                return NextResponse.json({ message: 'البريد الإلكتروني مستخدم من قبل حساب آخر' }, { status: 409 });
            }
        }

        const validRole = role && ['admin', 'user', 'teacher', 'student', 'suspended'].includes(role) ? role : undefined;

        const updates: string[] = [];
        const params: any[] = [];

        if (name) { updates.push('name = ?'); params.push(name.trim()); }
        if (email) { updates.push('email = ?'); params.push(email.trim().toLowerCase()); }
        if (validRole) { 
            updates.push('role = ?'); params.push(validRole); 
            updates.push('account_type = ?'); params.push(validRole === 'teacher' ? 'instructor' : validRole);
        }
        if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
        if (country !== undefined) { updates.push('country = ?'); params.push(country); }
        if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }

        if (updates.length === 0) {
            return NextResponse.json({ message: 'لا توجد بيانات للتحديث' }, { status: 400 });
        }

        params.push(id);
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        const ip = getRequestIP(request);
        logAudit({
            action: 'USER_UPDATED',
            userId: adminUser.id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            resource: 'users',
            resourceId: id,
            details: `قام المسؤول ${adminUser.email} بتحديث حساب: ${existingUser.email} — الحقول: ${updates.map(u => u.split('=')[0].trim()).join(', ')}`,
            severity: 'medium',
        });

        return NextResponse.json({ message: 'تم تحديث المستخدم بنجاح' });
    } catch (error: any) {
        console.error('Admin users PUT error:', error);
        return NextResponse.json({ message: 'Server error', detail: error.message }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/admin/users — Delete user
// ═══════════════════════════════════════════════════════════
export async function DELETE(request: Request) {
    try {
        const adminUser = await getAuthUser();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'معرف المستخدم مطلوب' }, { status: 400 });
        }

        // Prevent self-deletion
        if (id === adminUser.id) {
            return NextResponse.json({ message: 'لا يمكنك حذف حسابك الخاص' }, { status: 403 });
        }

        const target = db.prepare('SELECT email, role FROM users WHERE id = ?').get(id) as { email: string; role: string } | undefined;
        if (!target) {
            return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Prevent deleting other admins
        if (target.role === 'admin') {
            return NextResponse.json({ message: 'لا يمكن حذف مسؤول آخر' }, { status: 403 });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(id);

        const ip = getRequestIP(request);
        logAudit({
            action: 'USER_DELETED',
            userId: adminUser.id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            resource: 'users',
            resourceId: id,
            details: `قام المسؤول ${adminUser.email} بحذف حساب: ${target.email}`,
            severity: 'high',
        });

        return NextResponse.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error: any) {
        console.error('Admin users DELETE error:', error);
        return NextResponse.json({ message: 'Server error', detail: error.message }, { status: 500 });
    }
}
