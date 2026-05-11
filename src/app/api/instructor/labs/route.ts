import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        
        // Ensure user is an instructor (but allow admin as well just in case)
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح لك بإنشاء مختبرات. هذه الخاصية للمدربين فقط.' }, { status: 403 });
        }

        const body = await req.json();
        const { id, title_ar, title_en, description_ar, description_en, difficulty, category, xp, duration, tools, is_online, environment_config } = body;

        if (!id || !title_ar || !title_en) {
            return NextResponse.json({ message: 'بيانات المختبر غير مكتملة' }, { status: 400 });
        }

        // Check if ID exists
        const existing = db.prepare('SELECT id FROM labs WHERE id = ?').get(id);
        if (existing) {
            return NextResponse.json({ message: 'معرف المختبر موجود بالفعل' }, { status: 409 });
        }

        db.prepare(`
            INSERT INTO labs (id, title_ar, title_en, description_ar, description_en, difficulty, category, xp, duration, tools, is_online, environment_config)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            title_ar,
            title_en,
            description_ar || '',
            description_en || '',
            difficulty || 'beginner',
            category || 'network',
            xp || 100,
            duration || '30m',
            tools ? JSON.stringify(tools) : '[]',
            is_online !== undefined ? is_online : 1,
            environment_config ? JSON.stringify(environment_config) : '{}'
        );

        return NextResponse.json({ message: 'تم إنشاء المختبر بنجاح', labId: id }, { status: 201 });

    } catch (error: any) {
        console.error('Labs POST error (Instructor):', error);
        return NextResponse.json({ message: 'خطأ داخلي أثناء إنشاء المختبر' }, { status: 500 });
    }
}
