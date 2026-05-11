import { NextRequest, NextResponse } from 'next/server';
import { statements } from '@/lib/db';

// GET — Get chat messages for a session
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const messages = statements.getSessionMessages.all(id);
        return NextResponse.json({ messages });
    } catch {
        return NextResponse.json({ message: 'خطأ في جلب الرسائل' }, { status: 500 });
    }
}

// POST — Send a chat message
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { sender_id, sender_name, message } = body;

        if (!sender_id || !sender_name || !message) {
            return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        statements.insertSessionMessage.run(id, sender_id, sender_name, message);

        return NextResponse.json({ message: 'تم إرسال الرسالة' }, { status: 201 });
    } catch {
        return NextResponse.json({ message: 'حدث خطأ أثناء إرسال الرسالة' }, { status: 500 });
    }
}
