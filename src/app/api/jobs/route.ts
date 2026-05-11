import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let query = "SELECT * FROM jobs WHERE status = 'open'";
        const params: any[] = [];

        if (role && role !== 'all') {
            query += " AND role = ?";
            params.push(role);
        }

        query += " ORDER BY created_at DESC";

        const jobs = db.prepare(query).all(...params);

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error('Jobs GET error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id || (payload.role !== 'teacher' && payload.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const body = await req.json();
        const { title, company, location, job_type, role, description, requirements, apply_link } = body;

        const result = db.prepare(`
            INSERT INTO jobs (title, company, location, job_type, role, description, requirements, apply_link, posted_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(title, company, location, job_type, role, description || '', requirements || '', apply_link || '', payload.id);

        return NextResponse.json({ message: 'تم نشر الوظيفة بنجاح', id: result.lastInsertRowid }, { status: 201 });
    } catch (error) {
        console.error('Jobs POST error:', error);
        return NextResponse.json({ message: 'فشل نشر الوظيفة' }, { status: 500 });
    }
}
