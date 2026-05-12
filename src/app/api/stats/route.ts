import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';

// In-memory cache for stats (60 second TTL)
let statsCache: { data: any; expiry: number } | null = null;

export async function GET() {
    try {
        const now = Date.now();
        if (statsCache && statsCache.expiry > now) {
            return NextResponse.json(statsCache.data);
        }

        const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
        const totalCourses = (db.prepare('SELECT COUNT(*) as count FROM courses WHERE published = 1').get() as any)?.count || 0;
        const totalTerms = (db.prepare('SELECT COUNT(*) as count FROM terms').get() as any)?.count || 0;
        const totalPosts = (db.prepare('SELECT COUNT(*) as count FROM posts WHERE published = 1').get() as any)?.count || 0;

        const totalLabs = (db.prepare('SELECT COUNT(*) as count FROM labs').get() as any)?.count || 0;
        const totalPaths = 14;
        const totalChallenges = (db.prepare('SELECT COUNT(*) as count FROM ctf_challenges').get() as any)?.count || 0;
        const totalCertificates = (db.prepare('SELECT COUNT(*) as count FROM certificates').get() as any)?.count || 0;

        const data = {
            totalUsers,
            totalCourses,
            totalTerms,
            totalPosts,
            totalLabs,
            totalPaths,
            totalChallenges,
            totalCertificates,
        };

        statsCache = { data, expiry: now + 60_000 };

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({
            totalUsers: 0, totalCourses: 0, totalTerms: 1300,
            totalPosts: 0, totalLabs: 47, totalPaths: 14,
            totalChallenges: 86, totalCertificates: 0,
        });
    }
}
