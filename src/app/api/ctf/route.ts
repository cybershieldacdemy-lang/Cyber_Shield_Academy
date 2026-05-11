import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        let userId = null;
        if (token) {
            const payload = verifyToken(token);
            if (payload && payload.id) userId = payload.id;
        }

        // Fetch categories
        const categoriesData = db.prepare('SELECT * FROM ctf_categories').all() as any[];

        // Fetch challenges
        const challengesQuery = `
            SELECT id, category_id, title, description, difficulty, 
                   base_points, min_points, decay_solves, points, 
                   is_dynamic, author, status, tags, external_links, file_url 
            FROM ctf_challenges
            WHERE status = 'active'
        `;
        const challengesData = db.prepare(challengesQuery).all() as any[];

        // Fetch solves map for user
        const solvesMap: Record<number, boolean> = {};
        let userPoints = 0;

        if (userId) {
            const solves = db.prepare('SELECT challenge_id FROM ctf_solves WHERE user_id = ?').all(userId) as any[];
            solves.forEach(s => { solvesMap[s.challenge_id] = true; });

            const userRow = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;
            if (userRow) userPoints = userRow.points || 0;
        }

        // Process attachments and hints for each challenge
        // Note: Hints are only returned if unlocked or we return the cost/id.
        const allHints = db.prepare('SELECT id, challenge_id, cost, sort_order FROM ctf_hints').all() as any[];
        
        let unlockedHintsMap: Record<number, boolean> = {};
        if (userId) {
            const unlocked = db.prepare('SELECT hint_id FROM ctf_unlocked_hints WHERE user_id = ?').all(userId) as any[];
            unlocked.forEach(u => { unlockedHintsMap[u.hint_id] = true; });
        }

        const allAttachments = db.prepare('SELECT id, challenge_id, file_name, file_url, file_type FROM ctf_attachments').all() as any[];

        // Build the categories payload
        const categories = categoriesData.map(cat => ({
            ...cat,
            challenges: challengesData
                .filter(ch => ch.category_id === cat.id)
                .map(ch => {
                    const chHints = allHints.filter(h => h.challenge_id === ch.id).map(h => {
                        const isUnlocked = !!unlockedHintsMap[h.id];
                        let content = null;
                        if (isUnlocked) {
                            const fullHint = db.prepare('SELECT content FROM ctf_hints WHERE id = ?').get(h.id) as any;
                            content = fullHint?.content;
                        }
                        return {
                            id: h.id,
                            cost: h.cost,
                            sort_order: h.sort_order,
                            is_unlocked: isUnlocked,
                            content: content
                        };
                    });

                    const chAttachments = allAttachments.filter(a => a.challenge_id === ch.id);

                    // Decode JSON strings safely
                    let tags = [];
                    let externalLinks = [];
                    try { tags = JSON.parse(ch.tags || '[]'); } catch(e){}
                    try { externalLinks = JSON.parse(ch.external_links || '[]'); } catch(e){}

                    // Dynamic scoring: actual points might be decayed based on total solves
                    const totalSolvesRes = db.prepare('SELECT COUNT(*) as count FROM ctf_solves WHERE challenge_id = ?').get(ch.id) as any;
                    const totalSolves = totalSolvesRes ? totalSolvesRes.count : 0;
                    
                    let currentPoints = ch.base_points;
                    if (ch.decay_solves > 0 && totalSolves > 0) {
                        const decayFactor = Math.min(totalSolves / ch.decay_solves, 1);
                        currentPoints = Math.max(ch.min_points, Math.floor(ch.base_points * (1 - decayFactor) + ch.min_points * decayFactor));
                    }

                    return {
                        ...ch,
                        points: currentPoints, // Overwrite with dynamic calculated points
                        tags,
                        external_links: externalLinks,
                        solved: !!solvesMap[ch.id],
                        total_solves: totalSolves,
                        hints: chHints,
                        attachments: chAttachments
                    };
                })
        }));

        return NextResponse.json({ categories, userPoints });
    } catch (error) {
        console.error('CTF GET error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
