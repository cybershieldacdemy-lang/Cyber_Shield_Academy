import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        db.prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)').run(name, email, subject, message);

        return NextResponse.json({ message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' }, { status: 201 });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json({ message: 'حدث خطأ في إرسال الرسالة' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Admin-only access
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }
        const payload = verifyToken(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'صلاحية المشرف مطلوبة' }, { status: 403 });
        }

        const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
        return NextResponse.json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ message: 'خطأ في جلب الرسائل' }, { status: 500 });
    }
}
