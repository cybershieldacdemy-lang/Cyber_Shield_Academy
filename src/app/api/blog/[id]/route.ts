import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
        if (!post) return NextResponse.json({ message: 'المقال غير موجود' }, { status: 404 });
        // Increment views
        db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(id);
        return NextResponse.json(post);
    } catch (error) {
        console.error('Post GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title_ar, title_en, content_ar, content_en, excerpt_ar, category, tags, image, author, published } = body;

        db.prepare(`
            UPDATE posts SET title_ar=?, title_en=?, content_ar=?, content_en=?, excerpt_ar=?, category=?, tags=?, image=?, author=?, published=?
            WHERE id=?
        `).run(title_ar, title_en, content_ar, content_en, excerpt_ar, category, tags, image, author, published ?? 1, id);

        return NextResponse.json({ message: 'تم تحديث المقال' });
    } catch (error) {
        console.error('Post PUT error:', error);
        return NextResponse.json({ message: 'خطأ في التحديث' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        db.prepare('DELETE FROM posts WHERE id = ?').run(id);
        return NextResponse.json({ message: 'تم حذف المقال' });
    } catch (error) {
        console.error('Post DELETE error:', error);
        return NextResponse.json({ message: 'خطأ في الحذف' }, { status: 500 });
    }
}
