import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getAuthUser();
        
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { instructor_notes, student_rating } = body;

        // Ensure the session belongs to this instructor
        const session = db.prepare('SELECT id FROM live_sessions WHERE id = ? AND teacher_id = ?').get(id, user.id);
        if (!session) {
            return NextResponse.json({ message: 'الجلسة غير موجودة أو لا تملك صلاحية' }, { status: 403 });
        }

        db.prepare('UPDATE live_sessions SET instructor_notes = ?, student_rating = ? WHERE id = ?').run(
            instructor_notes || '',
            student_rating || 0,
            id
        );

        return NextResponse.json({ message: 'تم حفظ الملاحظات والتقييم بنجاح' });
    } catch (error) {
        console.error('API /instructor/sessions/[id]/notes Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
