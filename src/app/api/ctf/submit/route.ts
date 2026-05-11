import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;
const rateLimit = new Map<string, { count: number; lastReset: number }>();

function getClientIP(request: NextRequest): string {
    return request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        '127.0.0.1';
}

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimit.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > WINDOW_SIZE) {
        record.count = 0;
        record.lastReset = now;
    }

    record.count++;
    rateLimit.set(ip, record);

    return record.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        if (checkRateLimit(ip)) {
            return NextResponse.json({ message: 'تجاوزت الحد المسموح من المحاولات. الرجاء الانتظار دقيقة.' }, { status: 429 });
        }

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
        const { challengeId, flag } = body;

        if (!challengeId || !flag) {
            return NextResponse.json({ message: 'بيانات غير مكتملة' }, { status: 400 });
        }

        const challenge = db.prepare('SELECT * FROM ctf_challenges WHERE id = ?').get(challengeId) as any;

        if (!challenge || challenge.status !== 'active') {
            return NextResponse.json({ message: 'التحدي غير موجود أو غير نشط' }, { status: 404 });
        }

        // Check if already solved
        const existingSolve = db.prepare('SELECT id FROM ctf_solves WHERE challenge_id = ? AND user_id = ?').get(challengeId, userId);
        if (existingSolve) {
            return NextResponse.json({ message: 'لقد قمت بحل هذا التحدي مسبقاً!' }, { status: 400 });
        }

        let isCorrect = false;

        // Dynamic flag validation
        if (challenge.is_dynamic) {
            const dynamicFlagRow = db.prepare('SELECT flag FROM ctf_dynamic_flags WHERE challenge_id = ? AND user_id = ?').get(challengeId, userId) as any;
            if (dynamicFlagRow && dynamicFlagRow.flag === flag) {
                isCorrect = true;
            } else if (!dynamicFlagRow) {
                // If user doesn't have a dynamic flag for some reason, fallback to base flag? No, it's strictly dynamic.
                // Wait, dynamic flags are generated per user on demand. We should just fail here.
                return NextResponse.json({ message: 'العلم غير صحيح' }, { status: 400 });
            }
        } else {
            // Static flag validation
            if (challenge.flag === flag) {
                isCorrect = true;
            }
        }

        if (!isCorrect) {
            return NextResponse.json({ message: 'العلم غير صحيح' }, { status: 400 });
        }

        // Calculate points based on decay
        const totalSolvesRes = db.prepare('SELECT COUNT(*) as count FROM ctf_solves WHERE challenge_id = ?').get(challengeId) as any;
        const totalSolves = totalSolvesRes ? totalSolvesRes.count : 0;

        let earnedPoints = challenge.base_points;
        if (challenge.decay_solves > 0 && totalSolves > 0) {
            const decayFactor = Math.min(totalSolves / challenge.decay_solves, 1);
            earnedPoints = Math.max(challenge.min_points, Math.floor(challenge.base_points * (1 - decayFactor) + challenge.min_points * decayFactor));
        }

        // Deduct points for used hints
        const unlockedHints = db.prepare(`
            SELECT h.cost FROM ctf_unlocked_hints uh
            JOIN ctf_hints h ON uh.hint_id = h.id
            WHERE uh.user_id = ? AND h.challenge_id = ?
        `).all(userId, challengeId) as any[];

        const hintsCost = unlockedHints.reduce((sum, h) => sum + h.cost, 0);

        earnedPoints = Math.max(0, earnedPoints - hintsCost);

        // Transaction
        db.transaction(() => {
            // Record solve
            db.prepare('INSERT INTO ctf_solves (challenge_id, user_id, points_earned) VALUES (?, ?, ?)').run(challengeId, userId, earnedPoints);
            // Update user points
            db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(earnedPoints, userId);

            // Generate audit log
            db.prepare('INSERT INTO audit_logs (action, user_id, ip_address, resource, resource_id, details) VALUES (?, ?, ?, ?, ?, ?)').run(
                'CTF_SOLVE', userId, ip, 'CHALLENGE', challengeId.toString(), `Solved with ${earnedPoints} points (Cost: ${hintsCost})`
            );
        })();

        return NextResponse.json({
            message: 'تهانينا! الإجابة صحيحة.',
            earnedPoints,
            hintsCost
        });

    } catch (error) {
        console.error('CTF Submit error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
