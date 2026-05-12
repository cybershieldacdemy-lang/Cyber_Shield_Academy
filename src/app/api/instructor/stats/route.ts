import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function GET() {
    try {
        const user = await getAuthUser();
        
        if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
            return NextResponse.json({ message: 'غير مصرح لك بالدخول' }, { status: 403 });
        }

        const labsCount = db.prepare('SELECT COUNT(*) as count FROM labs').get() as { count: number };
        const coursesCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
        const studentsCount = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM course_enrollments').get() as { count: number };

        // For mock earnings
        const earnings = 1250.50; // Mock value

        return NextResponse.json({
            labsCount: labsCount.count,
            coursesCount: coursesCount.count,
            studentsCount: studentsCount.count,
            earnings
        });

    } catch (error) {
        console.error('Instructor stats GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
