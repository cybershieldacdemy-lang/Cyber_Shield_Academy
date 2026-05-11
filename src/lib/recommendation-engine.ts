/**
 * 🧠 AI Smart Recommendation Engine
 * 
 * Analyzes user learning patterns and generates personalized recommendations:
 * - Course suggestions based on completed courses and skill gaps
 * - Lab recommendations based on difficulty progression
 * - Learning path optimization
 * - Peer comparison metrics
 */
import db from '@/lib/db';

interface UserProfile {
  userId: string;
  completedCourses: number[];
  completedLabs: string[];
  ctfSolves: number;
  totalPoints: number;
  skillLevel: string;
  activeCategories: string[];
}

// ─── Build User Learning Profile ───
export function buildUserProfile(userId: string): UserProfile {
  const completedCourses = (db.prepare(
    `SELECT course_id FROM course_enrollments WHERE user_id = ? AND completed = 1`
  ).all(userId) as any[]).map(r => r.course_id);

  const completedLabs = (db.prepare(
    `SELECT lab_id FROM lab_completions WHERE user_id = ?`
  ).all(userId) as any[]).map(r => r.lab_id);

  const ctfSolves = (db.prepare(
    `SELECT COUNT(*) as count FROM ctf_solves WHERE user_id = ?`
  ).get(userId) as any)?.count || 0;

  const user = db.prepare(
    `SELECT points, experience_level FROM users WHERE id = ?`
  ).get(userId) as any;

  // Determine active categories from recent activity
  const recentActivity = db.prepare(`
    SELECT DISTINCT c.category 
    FROM course_enrollments ce
    JOIN courses c ON ce.course_id = c.id
    WHERE ce.user_id = ?
    ORDER BY ce.enrolled_at DESC LIMIT 5
  `).all(userId) as any[];

  return {
    userId,
    completedCourses,
    completedLabs,
    ctfSolves,
    totalPoints: user?.points || 0,
    skillLevel: user?.experience_level || 'beginner',
    activeCategories: recentActivity.map(r => r.category),
  };
}

// ─── Course Recommendations ───
export function recommendCourses(userId: string, limit = 6) {
  const profile = buildUserProfile(userId);
  const completedIds = profile.completedCourses;

  // Strategy 1: Courses in same categories user is active in (content-based)
  let recommendations: any[] = [];

  if (profile.activeCategories.length > 0) {
    const placeholders = profile.activeCategories.map(() => '?').join(',');
    const excludePlaceholders = completedIds.length > 0 
      ? `AND id NOT IN (${completedIds.map(() => '?').join(',')})` 
      : '';

    recommendations = db.prepare(`
      SELECT *, 'category_match' as reason
      FROM courses 
      WHERE category IN (${placeholders}) ${excludePlaceholders}
      ORDER BY RANDOM() LIMIT ?
    `).all(...profile.activeCategories, ...completedIds, Math.ceil(limit / 2)) as any[];
  }

  // Strategy 2: Difficulty progression — next level courses
  const levelMap: Record<string, string> = { beginner: 'intermediate', intermediate: 'advanced', advanced: 'advanced' };
  const nextLevel = levelMap[profile.skillLevel] || 'beginner';

  const excludeAll = [...completedIds, ...recommendations.map(r => r.id)];
  const exPlaceholders = excludeAll.length > 0 
    ? `AND id NOT IN (${excludeAll.map(() => '?').join(',')})` 
    : '';

  const levelRecs = db.prepare(`
    SELECT *, 'skill_progression' as reason
    FROM courses 
    WHERE level = ? ${exPlaceholders}
    ORDER BY RANDOM() LIMIT ?
  `).all(nextLevel, ...excludeAll, limit - recommendations.length) as any[];

  recommendations = [...recommendations, ...levelRecs];

  // Strategy 3: Popular courses (collaborative filtering fallback)
  if (recommendations.length < limit) {
    const existing = recommendations.map(r => r.id);
    const allExclude = [...completedIds, ...existing];
    const ep = allExclude.length > 0 
      ? `AND c.id NOT IN (${allExclude.map(() => '?').join(',')})` 
      : '';

    const popular = db.prepare(`
      SELECT c.*, 'popular' as reason, COUNT(ce.id) as enrollment_count
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      WHERE 1=1 ${ep}
      GROUP BY c.id
      ORDER BY enrollment_count DESC
      LIMIT ?
    `).all(...allExclude, limit - recommendations.length) as any[];

    recommendations = [...recommendations, ...popular];
  }

  return recommendations.slice(0, limit);
}

// ─── Lab Recommendations ───
export function recommendLabs(userId: string, limit = 4) {
  const profile = buildUserProfile(userId);
  const completedIds = profile.completedLabs;

  // Difficulty progression
  const diffMap: Record<string, string[]> = {
    beginner: ['beginner', 'intermediate'],
    intermediate: ['intermediate', 'advanced'],
    advanced: ['advanced', 'expert'],
  };
  const targetDiffs = diffMap[profile.skillLevel] || ['beginner'];
  const dp = targetDiffs.map(() => '?').join(',');
  const ep = completedIds.length > 0 
    ? `AND id NOT IN (${completedIds.map(() => '?').join(',')})` 
    : '';

  return db.prepare(`
    SELECT *, 'difficulty_match' as reason
    FROM labs
    WHERE difficulty IN (${dp}) AND is_online = 1 ${ep}
    ORDER BY RANDOM() LIMIT ?
  `).all(...targetDiffs, ...completedIds, limit) as any[];
}

// ─── User Analytics Summary ───
export function getUserAnalytics(userId: string) {
  const profile = buildUserProfile(userId);

  // Learning streak (consecutive days with activity)
  const recentDays = db.prepare(`
    SELECT DISTINCT DATE(last_watched_at) as d 
    FROM lesson_progress 
    WHERE user_id = ? 
    ORDER BY d DESC LIMIT 30
  `).all(userId) as any[];

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < recentDays.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    if (recentDays[i]?.d === expected) streak++;
    else break;
  }

  // Percentile ranking
  const totalUsers = (db.prepare(`SELECT COUNT(*) as c FROM users`).get() as any)?.c || 1;
  const usersBelow = (db.prepare(
    `SELECT COUNT(*) as c FROM users WHERE points < ?`
  ).get(profile.totalPoints) as any)?.c || 0;
  const percentile = Math.round((usersBelow / totalUsers) * 100);

  // Time spent learning (approximate from video progress)
  const totalWatchedSeconds = (db.prepare(
    `SELECT SUM(watched_seconds) as total FROM video_progress WHERE user_id = ?`
  ).get(userId) as any)?.total || 0;

  return {
    completedCourses: profile.completedCourses.length,
    completedLabs: profile.completedLabs.length,
    ctfSolves: profile.ctfSolves,
    totalPoints: profile.totalPoints,
    skillLevel: profile.skillLevel,
    streak,
    percentile,
    totalLearningMinutes: Math.round(totalWatchedSeconds / 60),
    activeCategories: profile.activeCategories,
  };
}
