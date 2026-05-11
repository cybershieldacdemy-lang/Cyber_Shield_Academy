import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title_ar, title_en, content_ar, severity, cve_id, affected, source, published } = body;

        db.prepare(`
            UPDATE news SET title_ar=?, title_en=?, content_ar=?, severity=?, cve_id=?, affected=?, source=?, published=?
            WHERE id=?
        `).run(title_ar, title_en, content_ar, severity, cve_id, affected, source, published ?? 1, id);

        return NextResponse.json({ message: 'تم تحديث الخبر' });
    } catch (error) {
        console.error('News PUT error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        db.prepare('DELETE FROM news WHERE id = ?').run(id);
        return NextResponse.json({ message: 'تم حذف الخبر' });
    } catch (error) {
        console.error('News DELETE error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
