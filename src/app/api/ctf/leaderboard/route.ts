import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        // We aggregate the points earned from ctf_solves for each user
        // We also need to get the user's name, avatar, and total solves
        
        const query = `
            SELECT 
                u.id as user_id,
                u.name,
                u.avatar,
                u.experience_level,
                COUNT(s.id) as challenges_solved,
                SUM(s.points_earned) as total_points,
                MAX(s.solved_at) as last_solve_time
            FROM users u
            JOIN ctf_solves s ON u.id = s.user_id
            GROUP BY u.id
            ORDER BY total_points DESC, last_solve_time ASC
            LIMIT 100
        `;
        
        const leaderboardData = db.prepare(query).all() as any[];
        
        // Add ranks
        const leaderboard = leaderboardData.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('CTF Leaderboard error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
