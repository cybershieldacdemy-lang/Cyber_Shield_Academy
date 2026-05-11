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

        let query = 'SELECT * FROM news WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM news WHERE 1=1';
        const params: any[] = [];
        const countParams: any[] = [];

        if (search) {
            query += ' AND (title_ar LIKE ? OR title_en LIKE ? OR cve_id LIKE ?)';
            countQuery += ' AND (title_ar LIKE ? OR title_en LIKE ? OR cve_id LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const news = db.prepare(query).all(...params);
        const { total } = db.prepare(countQuery).get(...countParams) as any;

        return NextResponse.json({ news, total });
    } catch (error) {
        console.error('News GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id || payload.role !== 'admin') {
            return NextResponse.json({ message: 'صلاحية المشرف مطلوبة' }, { status: 403 });
        }

        const body = await req.json();
        const { title_ar, title_en, content_ar, severity, cve_id, affected, source } = body;

        if (!title_ar || !title_en) {
            return NextResponse.json({ message: 'العنوان مطلوب' }, { status: 400 });
        }

        const result = db.prepare(`
            INSERT INTO news (title_ar, title_en, content_ar, severity, cve_id, affected, source)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(title_ar, title_en, content_ar || '', severity || 'medium', cve_id || '', affected || '', source || '');

        return NextResponse.json({ message: 'تم إضافة الخبر', id: result.lastInsertRowid }, { status: 201 });
    } catch (error) {
        console.error('News POST error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
