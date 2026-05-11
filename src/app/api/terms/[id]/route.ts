import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { termEn, termAr, definitionEn, definitionAr, example, level, categoryId } = body;

        const stmt = db.prepare(`
        UPDATE terms
        SET term_en = ?, term_ar = ?, definition_en = ?, definition_ar = ?, example = ?, level = ?, category_id = ?
        WHERE id = ?
    `);

        const result = stmt.run(termEn, termAr, definitionEn, definitionAr, example, level, categoryId, id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Term not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Term updated successfully' });
    } catch (error) {
        console.error('Error updating term:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const stmt = db.prepare('DELETE FROM terms WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Term not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Term deleted successfully' });
    } catch (error) {
        console.error('Error deleting term:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
