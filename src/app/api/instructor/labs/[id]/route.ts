import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getAuthUser();
        
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح لك بتعديل المختبرات.' }, { status: 403 });
        }

        const body = await req.json();
        const { title_ar, title_en, description_ar, description_en, difficulty, category, xp, duration, tools, is_online, environment_config } = body;

        // Check if Lab exists
        const existing = db.prepare('SELECT id FROM labs WHERE id = ?').get(id);
        if (!existing) {
            return NextResponse.json({ message: 'المختبر غير موجود' }, { status: 404 });
        }

        db.prepare(`
            UPDATE labs
            SET title_ar = ?, title_en = ?, description_ar = ?, description_en = ?, difficulty = ?, category = ?, xp = ?, duration = ?, tools = ?, is_online = ?, environment_config = ?
            WHERE id = ?
        `).run(
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
            environment_config ? JSON.stringify(environment_config) : '{}',
            id
        );

        return NextResponse.json({ message: 'تم تحديث المختبر بنجاح' });

    } catch (error: any) {
        console.error('Labs PUT error (Instructor):', error);
        return NextResponse.json({ message: 'خطأ داخلي' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getAuthUser();
        
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح لك بحذف المختبرات.' }, { status: 403 });
        }

        // Deleting lab should delete its associated data as well (scenarios, completions)
        // Usually done via foreign key cascade, but let's delete explicitly if needed.
        db.prepare('DELETE FROM lab_completions WHERE lab_id = ?').run(id);
        db.prepare('DELETE FROM lab_scenarios WHERE lab_id = ?').run(id);
        db.prepare('DELETE FROM course_lesson_labs WHERE lab_id = ?').run(id);
        db.prepare('DELETE FROM labs WHERE id = ?').run(id);

        return NextResponse.json({ message: 'تم حذف المختبر بنجاح' });

    } catch (error: any) {
        console.error('Labs DELETE error (Instructor):', error);
        return NextResponse.json({ message: 'خطأ داخلي' }, { status: 500 });
    }
}
