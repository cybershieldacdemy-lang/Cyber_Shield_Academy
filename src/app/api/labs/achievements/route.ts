import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decoded = user;

        const { achievement_id } = await req.json();
        if (!achievement_id) {
            return NextResponse.json({ message: 'Achievement ID required' }, { status: 400 });
        }

        // Check if achievement exists
        const ach = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievement_id) as { id: string; points: number } | undefined;
        if (!ach) {
            return NextResponse.json({ message: 'Achievement not found' }, { status: 404 });
        }

        // Check if user already has it
        const existing = db.prepare('SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(decoded.id, achievement_id);
        if (existing) {
            return NextResponse.json({ message: 'Already earned', inherited: true });
        }

        // Award achievement
        db.transaction(() => {
            db.prepare('INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(decoded.id, achievement_id);
            db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(ach.points, decoded.id);
        })();

        return NextResponse.json({ 
            message: 'Achievement unlocked!', 
            achievement: ach 
        });
    } catch (error) {
        console.error('Achievements POST error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
