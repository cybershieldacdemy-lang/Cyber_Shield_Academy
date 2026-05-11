import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        db.prepare('DELETE FROM comments WHERE id = ?').run(id);
        return NextResponse.json({ message: 'تم حذف التعليق' });
    } catch (error) {
        console.error('Comment DELETE error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
