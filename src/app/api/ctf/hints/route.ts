import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ message: 'جلسة غير صالحة' }, { status: 401 });
        }

        const userId = payload.id;
        const body = await request.json();
        const { hintId } = body;

        if (!hintId) {
            return NextResponse.json({ message: 'يجب توفير معرف التلميح' }, { status: 400 });
        }

        const hint = db.prepare('SELECT * FROM ctf_hints WHERE id = ?').get(hintId) as any;
        if (!hint) {
            return NextResponse.json({ message: 'التلميح غير موجود' }, { status: 404 });
        }

        // Check if already unlocked
        const isUnlocked = db.prepare('SELECT id FROM ctf_unlocked_hints WHERE user_id = ? AND hint_id = ?').get(userId, hintId);
        if (isUnlocked) {
            return NextResponse.json({ message: 'تم فتح التلميح مسبقاً', content: hint.content });
        }

        // Check if user has enough points
        const userRow = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;
        if (!userRow || userRow.points < hint.cost) {
            return NextResponse.json({ message: 'رصيد النقاط غير كافٍ لفتح هذا التلميح' }, { status: 403 });
        }

        // Transaction: Unlock hint and deduct points
        db.transaction(() => {
            db.prepare('INSERT INTO ctf_unlocked_hints (user_id, hint_id) VALUES (?, ?)').run(userId, hintId);
            if (hint.cost > 0) {
                db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(hint.cost, userId);
            }
            
            // Generate audit log
            db.prepare('INSERT INTO audit_logs (action, user_id, ip_address, resource, resource_id, details) VALUES (?, ?, ?, ?, ?, ?)').run(
                'CTF_HINT_UNLOCK', userId, 'API', 'HINT', hintId.toString(), \`Unlocked hint for challenge \${hint.challenge_id} (Cost: \${hint.cost})\`
            );
        })();

        return NextResponse.json({ 
            message: 'تم فتح التلميح بنجاح', 
            content: hint.content,
            deducted: hint.cost
        });

    } catch (error) {
        console.error('CTF Hint error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
