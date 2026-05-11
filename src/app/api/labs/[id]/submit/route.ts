import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db, { statements } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: labId } = await params;
        const user = await getAuthUser();

        if (!user) return NextResponse.json({ message: 'يرجى تسجيل الدخول لحفظ تقدمك' }, { status: 401 });

        const userId = user.id;

        // Fetch lab details
        const lab = statements.getLabById.get(labId) as any;
        if (!lab) {
            return NextResponse.json({ message: 'المختبر غير موجود' }, { status: 404 });
        }

        // Check if already completed
        const alreadyDone = statements.getLabCompletion.get(userId, labId);
        if (alreadyDone) {
            return NextResponse.json({ message: 'لقد أكملت هذا المختبر مسبقاً.' });
        }

        // Record completion
        db.transaction(() => {
            statements.insertLabCompletion.run(labId, userId, lab.xp);
            db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(lab.xp, userId);

            // AUTO-ACHIEVEMENT: First Hack
            const completionCount = db.prepare('SELECT COUNT(*) as count FROM lab_completions WHERE user_id = ?').get(userId) as { count: number };
            if (completionCount.count === 1) {
                const hasFirstHack = db.prepare('SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, 'first_hack');
                if (!hasFirstHack) {
                    db.prepare('INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, 'first_hack');
                    // Award points for achievement too
                    const ach = db.prepare('SELECT points FROM achievements WHERE id = ?').get('first_hack') as { points: number };
                    if (ach) {
                        db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(ach.points, userId);
                    }
                }
            }
        })();

        return NextResponse.json({ 
            message: 'تم تسجيل إكمال المختبر بنجاح!', 
            xp: lab.xp,
            success: true 
        });

    } catch (error) {
        console.error('Lab Submit error:', error);
        return NextResponse.json({ message: 'حدث خطأ في النظام' }, { status: 500 });
    }
}
