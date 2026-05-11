import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50') || 50, 1), 100);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        let query = 'SELECT * FROM posts WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM posts WHERE 1=1';
        const params: any[] = [];
        const countParams: any[] = [];

        if (search) {
            query += ' AND (title_ar LIKE ? OR title_en LIKE ?)';
            countQuery += ' AND (title_ar LIKE ? OR title_en LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND category = ?';
            countQuery += ' AND category = ?';
            params.push(category);
            countParams.push(category);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const posts = db.prepare(query).all(...params);
        const { total } = db.prepare(countQuery).get(...countParams) as any;

        return NextResponse.json({ posts, total });
    } catch (error) {
        console.error('Blog GET error:', error);
        return NextResponse.json({ message: 'خطأ في جلب المقالات' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id || (payload.role !== 'admin' && payload.role !== 'teacher')) {
            return NextResponse.json({ message: 'غير مصرح. يجب أن تكون مدرباً أو مشرفاً.' }, { status: 403 });
        }

        const body = await req.json();
        const { title_ar, title_en, content_ar, content_en, excerpt_ar, category, tags, image } = body;

        if (!title_ar || !title_en) {
            return NextResponse.json({ message: 'العنوان مطلوب' }, { status: 400 });
        }

        const result = db.prepare(`
            INSERT INTO posts (title_ar, title_en, content_ar, content_en, excerpt_ar, category, tags, image, author)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(title_ar, title_en, content_ar || '', content_en || '', excerpt_ar || '', category || 'awareness', tags || '', image || '', payload.id);

        return NextResponse.json({ message: 'تم إضافة المقال بنجاح', id: result.lastInsertRowid }, { status: 201 });
    } catch (error) {
        console.error('Blog POST error:', error);
        return NextResponse.json({ message: 'خطأ في إضافة المقال' }, { status: 500 });
    }
}
