import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        // Fetch all instructors securely for public display/booking
        const users = db.prepare('SELECT id, name, account_type FROM users WHERE role = ?').all('instructor') as any[];
        
        // Add a mock instructor if the list is empty (useful for dev/test)
        if (users.length === 0) {
            users.push({ id: 'mock-instructor-1', name: 'المدرّب التدريبي', account_type: 'instructor', specialization: 'Network Security' });
        }

        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ message: 'خطأ داخلي' }, { status: 500 });
    }
}
