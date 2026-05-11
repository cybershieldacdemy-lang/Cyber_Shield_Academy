import { NextRequest, NextResponse } from 'next/server';
import { statements } from '@/lib/db';

// GET — Get session details
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
             return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const session = statements.getLiveSessionById.get(id) as any;
        if (!session) {
            return NextResponse.json({ message: 'الجلسة غير موجودة' }, { status: 404 });
        }

        if (payload.role !== 'admin' && payload.id !== session.teacher_id && payload.id !== session.student_id) {
            return NextResponse.json({ message: 'غير مصرح لك بالدخول لهذه الجلسة' }, { status: 403 });
        }

        return NextResponse.json({ session });
    } catch {
        return NextResponse.json({ message: 'خطأ في جلب بيانات الجلسة' }, { status: 500 });
    }
}

// PUT — Update session status (start, end, cancel)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        const session = statements.getLiveSessionById.get(id);
        if (!session) {
            return NextResponse.json({ message: 'الجلسة غير موجودة' }, { status: 404 });
        }

        switch (action) {
            case 'start':
                statements.startLiveSession.run(id);
                return NextResponse.json({ message: 'تم بدء الجلسة ✅' });
            case 'end':
                statements.endLiveSession.run(id);
                return NextResponse.json({ message: 'تم إنهاء الجلسة ✅' });
            case 'cancel':
                statements.updateLiveSessionStatus.run('cancelled', id);
                return NextResponse.json({ message: 'تم إلغاء الجلسة' });
            default:
                return NextResponse.json({ message: 'إجراء غير صالح' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ message: 'حدث خطأ أثناء تحديث الجلسة' }, { status: 500 });
    }
}

// DELETE — Delete a session
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        statements.deleteLiveSession.run(id);
        return NextResponse.json({ message: 'تم حذف الجلسة' });
    } catch {
        return NextResponse.json({ message: 'حدث خطأ أثناء حذف الجلسة' }, { status: 500 });
    }
}
