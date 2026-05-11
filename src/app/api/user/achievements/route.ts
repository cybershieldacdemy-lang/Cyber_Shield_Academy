/**
 * 🏆 Achievements API
 * GET: Get user achievements + check for new unlocks
 */
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { evaluateAchievements, getUserLevel, ACHIEVEMENTS } from '@/lib/gamification-engine';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

    // Check for newly unlocked achievements
    const { newlyUnlocked, totalXPAwarded } = evaluateAchievements(user.id);

    // Get all earned achievements
    const earned = db.prepare(`
      SELECT ua.achievement_id, ua.earned_at
      FROM user_achievements ua
      WHERE ua.user_id = ?
      ORDER BY ua.earned_at DESC
    `).all(user.id) as any[];

    const earnedIds = new Set(earned.map(e => e.achievement_id));

    // Map achievements with earned status
    const all = ACHIEVEMENTS.map(a => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: earned.find(e => e.achievement_id === a.id)?.earned_at || null,
    }));

    // Get user level
    const userData = db.prepare(`SELECT points FROM users WHERE id = ?`).get(user.id) as any;
    const level = getUserLevel(userData?.points || 0);

    return NextResponse.json({
      achievements: all,
      earned: earned.length,
      total: ACHIEVEMENTS.length,
      newlyUnlocked,
      totalXPAwarded,
      level,
    });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json({ message: 'خطأ' }, { status: 500 });
  }
}
