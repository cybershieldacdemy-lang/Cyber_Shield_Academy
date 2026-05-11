import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const certificate = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id) as any;
        
        if (!certificate) return NextResponse.json({ message: 'الشهادة غير موجودة' }, { status: 404 });
        
        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Certificate GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
