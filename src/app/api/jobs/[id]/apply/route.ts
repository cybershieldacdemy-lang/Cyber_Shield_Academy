import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ message: 'يجب تسجيل الدخول للتقديم' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول للتقديم' }, { status: 401 });
        }

        const { id } = await params;
        const jobId = Number(id);

        // Check if job exists
        const job = db.prepare('SELECT status, apply_link FROM jobs WHERE id = ?').get(jobId) as any;
        if (!job) return NextResponse.json({ message: 'الوظيفة غير موجودة' }, { status: 404 });
        if (job.status !== 'open') return NextResponse.json({ message: 'هذه الوظيفة لم تعد متاحة' }, { status: 400 });

        // Record application
        try {
            db.prepare(`
                INSERT INTO job_applications (job_id, user_id)
                VALUES (?, ?)
            `).run(jobId, payload.id);
        } catch (e: any) {
            if (e.message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ message: 'لقد قمت بالتقديم على هذه الوظيفة مسبقاً' }, { status: 400 });
            }
            throw e;
        }

        return NextResponse.json({ message: 'تم التقديم بنجاح', apply_link: job.apply_link });
    } catch (error) {
        console.error('Job Apply POST error:', error);
        return NextResponse.json({ message: 'فشل التقديم' }, { status: 500 });
    }
}
