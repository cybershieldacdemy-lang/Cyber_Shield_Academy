import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        // Fetch scenarios for this lab
        const scenarios = db.prepare(`
            SELECT id, step_order, title_ar, title_en, task_description, validation_regex, hint, solution
            FROM lab_scenarios
            WHERE lab_id = ?
            ORDER BY step_order ASC
        `).all(id);

        return NextResponse.json({ scenarios });
    } catch (error) {
        console.error('Scenarios GET error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
