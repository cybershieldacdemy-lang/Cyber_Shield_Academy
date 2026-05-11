import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(_req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id || (payload.role !== 'teacher' && payload.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const teacherId = payload.id;

        let query = `
            SELECT j.*, COUNT(ja.id) as applications_count
            FROM jobs j
            LEFT JOIN job_applications ja ON j.id = ja.job_id
        `;
        const params: any[] = [];

        if (payload.role === 'teacher') {
            query += ' WHERE j.posted_by = ?';
            params.push(teacherId);
        }

        query += ' GROUP BY j.id ORDER BY j.created_at DESC';

        const jobs = db.prepare(query).all(...params);

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error('Teacher Jobs GET error:', error);
        return NextResponse.json({ message: 'خطأ في جلب بيانات الوظائف' }, { status: 500 });
    }
}
