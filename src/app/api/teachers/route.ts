import { NextResponse } from 'next/server';
import { statements } from '@/lib/db';

// GET — List all teachers
export async function GET() {
    try {
        const teachers = statements.getTeachers.all();
        return NextResponse.json({ teachers });
    } catch {
        return NextResponse.json({ message: 'خطأ في جلب المدرّبين' }, { status: 500 });
    }
}
