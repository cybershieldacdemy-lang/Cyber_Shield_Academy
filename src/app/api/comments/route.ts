import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const post_id = searchParams.get('post_id');
        const course_id = searchParams.get('course_id');

        let query = 'SELECT * FROM comments WHERE 1=1';
        const params: any[] = [];

        if (post_id) { query += ' AND post_id = ?'; params.push(post_id); }
        if (course_id) { query += ' AND course_id = ?'; params.push(course_id); }

        query += ' ORDER BY created_at DESC';
        const comments = db.prepare(query).all(...params);

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Comments GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Require authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول لإضافة تعليق' }, { status: 401 });
        }
        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const { post_id, course_id, content } = await req.json();

        if (!content) {
            return NextResponse.json({ message: 'المحتوى مطلوب' }, { status: 400 });
        }

        // Get user info from DB (don't trust client-provided user_name)
        const user = db.prepare('SELECT name FROM users WHERE id = ?').get(payload.id) as any;
        if (!user) {
            return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
        }

        const result = db.prepare(
            'INSERT INTO comments (post_id, course_id, user_id, user_name, content) VALUES (?, ?, ?, ?, ?)'
        ).run(post_id || null, course_id || null, payload.id, user.name, content);

        return NextResponse.json({ message: 'تم إضافة التعليق', id: result.lastInsertRowid }, { status: 201 });
    } catch (error) {
        console.error('Comments POST error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
