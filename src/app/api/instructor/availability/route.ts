import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';
import crypto from 'crypto';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const slots = db.prepare('SELECT id, day_of_week, start_time, end_time FROM instructor_availability WHERE instructor_id = ? ORDER BY day_of_week ASC, start_time ASC').all(user.id);
        
        return NextResponse.json({ slots });
    } catch (error) {
        console.error('API /instructor/availability GET Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { day_of_week, start_time, end_time } = body;

        if (day_of_week === undefined || !start_time || !end_time) {
            return NextResponse.json({ message: 'البيانات غير مكتملة' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        db.prepare('INSERT INTO instructor_availability (id, instructor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)')
          .run(id, user.id, day_of_week, start_time, end_time);

        return NextResponse.json({ message: 'تمت إضافة الوقت المتاح', id }, { status: 201 });
    } catch (error) {
        console.error('API /instructor/availability POST Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body;

        db.prepare('DELETE FROM instructor_availability WHERE id = ? AND instructor_id = ?').run(id, user.id);

        return NextResponse.json({ message: 'تم الحذف' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
