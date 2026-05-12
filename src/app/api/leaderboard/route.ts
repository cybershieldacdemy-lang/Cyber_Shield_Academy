import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';

// In-memory cache (30s TTL — rankings don't change per-second)
let cache: { data: any; expiry: number } | null = null;

export async function GET() {
    try {
        const now = Date.now();
        if (cache && cache.expiry > now) {
            return NextResponse.json(cache.data);
        }

        const users = db.prepare(`
            SELECT id, name, avatar, points, experience_level 
            FROM users 
            WHERE account_type = 'student' OR role = 'user'
            ORDER BY points DESC 
            LIMIT 50
        `).all() as any[];

        const leaderIds = users.map(u => u.id);
        
        const badgesMap: Record<string, any[]> = {};
        if (leaderIds.length > 0) {
            const placeholders = leaderIds.map(() => '?').join(',');
            const badges = db.prepare(`
                SELECT ub.user_id, b.name_ar, b.icon 
                FROM user_badges ub
                JOIN badges b ON ub.badge_id = b.id
                WHERE ub.user_id IN (${placeholders})
            `).all(...leaderIds) as any[];

            badges.forEach(b => {
                if (!badgesMap[b.user_id]) badgesMap[b.user_id] = [];
                badgesMap[b.user_id].push({ name: b.name_ar, icon: b.icon });
            });
        }

        const leaderboard = users.map(user => ({
            ...user,
            badges: badgesMap[user.id] || []
        }));

        const data = { leaderboard };
        cache = { data, expiry: now + 30_000 };

        return NextResponse.json(data);
    } catch (error) {
        console.error('Leaderboard GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
