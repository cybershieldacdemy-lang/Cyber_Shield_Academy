/**
 * 📊 User Analytics & Progress Dashboard API
 * 
 * Comprehensive learning analytics for users and admins:
 * - Learning velocity (courses per month)
 * - Skill progression over time
 * - Activity heatmap data
 * - Completion rates
 * - Peer comparison
 */
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const uid = user.id;

    // ─── Overall Progress ───
    const coursesEnrolled = (db.prepare(
      `SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ?`
    ).get(uid) as any)?.c || 0;

    const coursesCompleted = (db.prepare(
      `SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ? AND completed = 1`
    ).get(uid) as any)?.c || 0;

    const labsCompleted = (db.prepare(
      `SELECT COUNT(*) as c FROM lab_completions WHERE user_id = ?`
    ).get(uid) as any)?.c || 0;

    const ctfSolved = (db.prepare(
      `SELECT COUNT(*) as c FROM ctf_solves WHERE user_id = ?`
    ).get(uid) as any)?.c || 0;

    const totalPoints = (db.prepare(
      `SELECT points FROM users WHERE id = ?`
    ).get(uid) as any)?.points || 0;

    const certificates = (db.prepare(
      `SELECT COUNT(*) as c FROM certificates WHERE user_id = ?`
    ).get(uid) as any)?.c || 0;

    // ─── Learning Streak ───
    const recentDays = db.prepare(`
      SELECT DISTINCT DATE(last_watched_at) as d 
      FROM lesson_progress WHERE user_id = ? 
      UNION 
      SELECT DISTINCT DATE(solved_at) as d FROM ctf_solves WHERE user_id = ?
      UNION
      SELECT DISTINCT DATE(completed_at) as d FROM lab_completions WHERE user_id = ?
      ORDER BY d DESC LIMIT 60
    `).all(uid, uid, uid) as any[];

    let streak = 0;
    for (let i = 0; i < recentDays.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      if (recentDays[i]?.d === expected) streak++;
      else break;
    }

    // ─── Activity Heatmap (last 90 days) ───
    const heatmap = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count FROM (
        SELECT enrolled_at as created_at FROM course_enrollments WHERE user_id = ?
        UNION ALL
        SELECT completed_at FROM lab_completions WHERE user_id = ?
        UNION ALL
        SELECT solved_at FROM ctf_solves WHERE user_id = ?
        UNION ALL
        SELECT last_watched_at FROM lesson_progress WHERE user_id = ?
      ) combined
      WHERE date >= DATE('now', '-90 days')
      GROUP BY date
      ORDER BY date
    `).all(uid, uid, uid, uid) as any[];

    // ─── Monthly Progress ───
    const monthlyProgress = db.prepare(`
      SELECT 
        strftime('%Y-%m', completed_at) as month,
        COUNT(*) as completions
      FROM lab_completions WHERE user_id = ?
      GROUP BY month ORDER BY month DESC LIMIT 6
    `).all(uid) as any[];

    // ─── Peer Comparison ───
    const totalUsers = (db.prepare(`SELECT COUNT(*) as c FROM users`).get() as any)?.c || 1;
    const usersBelow = (db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE points < ?`
    ).get(totalPoints) as any)?.c || 0;
    const percentile = Math.round((usersBelow / totalUsers) * 100);

    // ─── Time Spent Learning ───
    const watchedSeconds = (db.prepare(
      `SELECT SUM(watched_seconds) as total FROM video_progress WHERE user_id = ?`
    ).get(uid) as any)?.total || 0;

    // ─── CTF Category Performance ───
    const ctfPerformance = db.prepare(`
      SELECT cc.category_id, COUNT(*) as solved, SUM(cs.points_earned) as points
      FROM ctf_solves cs
      JOIN ctf_challenges cc ON cs.challenge_id = cc.id
      WHERE cs.user_id = ?
      GROUP BY cc.category_id
    `).all(uid) as any[];

    return NextResponse.json({
      overview: {
        coursesEnrolled,
        coursesCompleted,
        labsCompleted,
        ctfSolved,
        totalPoints,
        certificates,
        streak,
        percentile,
        totalLearningHours: Math.round(watchedSeconds / 3600),
      },
      heatmap,
      monthlyProgress,
      ctfPerformance,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
