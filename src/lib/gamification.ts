import db from '@/lib/db';

/**
 * Reviews a user's points and awards badges if they meet the threshold.
 * @param userId - ID of the user
 */
export function checkAndAwardBadges(userId: string) {
    try {
        const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;
        if (!user) return;
        
        const currentPoints = user.points;
        const eligibleBadges = db.prepare('SELECT id FROM badges WHERE points_required <= ? AND points_required > 0').all(currentPoints) as any[];

        const awardBadge = db.prepare(`
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (?, ?)
            ON CONFLICT(user_id, badge_id) DO NOTHING
        `);

        for (const badge of eligibleBadges) {
            awardBadge.run(userId, badge.id);
        }
    } catch (error) {
        console.error('Error awarding general limit badges:', error);
    }
}

/**
 * Specifically awards a certain badge id explicitly.
 */
export function awardSpecificBadge(userId: string, badgeId: string) {
    try {
        db.prepare(`
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (?, ?)
            ON CONFLICT(user_id, badge_id) DO NOTHING
        `).run(userId, badgeId);
    } catch (error) {
        console.error('Error awarding specific badge:', error);
    }
}
