/**
 * 🏆 Advanced Gamification Engine
 * 
 * Achievement system with:
 * - Milestone achievements (first course, first lab, first CTF solve)
 * - Streak achievements (7-day, 30-day, 100-day streaks)
 * - Mastery achievements (complete all challenges in a category)
 * - Social achievements (help others, create content)
 * - Seasonal competitions
 * 
 * Experience levels with progression:
 * Script Kiddie → Noob → Beginner → Intermediate → Advanced → Expert → Elite → Legend
 */
import db from '@/lib/db';
import logger from '@/lib/logger';

// ─── Experience Level Thresholds ───
const XP_LEVELS = [
  { level: 'script_kiddie', minPoints: 0, title_ar: 'مبتدئ', title_en: 'Script Kiddie', icon: '🐣' },
  { level: 'noob', minPoints: 100, title_ar: 'هاوي', title_en: 'Noob', icon: '🌱' },
  { level: 'beginner', minPoints: 500, title_ar: 'متعلم', title_en: 'Beginner', icon: '📖' },
  { level: 'intermediate', minPoints: 1500, title_ar: 'متوسط', title_en: 'Intermediate', icon: '⚔️' },
  { level: 'advanced', minPoints: 3500, title_ar: 'متقدم', title_en: 'Advanced', icon: '🛡️' },
  { level: 'expert', minPoints: 7000, title_ar: 'خبير', title_en: 'Expert', icon: '🎯' },
  { level: 'elite', minPoints: 15000, title_ar: 'نخبة', title_en: 'Elite Hacker', icon: '💀' },
  { level: 'legend', minPoints: 30000, title_ar: 'أسطورة', title_en: 'Legend', icon: '👑' },
];

// ─── Achievement Definitions ───
export const ACHIEVEMENTS = [
  // Milestone
  { id: 'first_course', name_ar: 'أول دورة', name_en: 'First Course', icon: '📚', xp: 50, condition: 'course_complete >= 1' },
  { id: 'first_lab', name_ar: 'أول مختبر', name_en: 'First Lab', icon: '🧪', xp: 75, condition: 'lab_complete >= 1' },
  { id: 'first_ctf', name_ar: 'أول تحدي', name_en: 'First Blood', icon: '🩸', xp: 100, condition: 'ctf_solve >= 1' },
  { id: 'first_cert', name_ar: 'أول شهادة', name_en: 'Certified', icon: '🎓', xp: 150, condition: 'certificates >= 1' },

  // Volume
  { id: 'course_10', name_ar: '10 دورات', name_en: '10 Courses', icon: '📖', xp: 200, condition: 'course_complete >= 10' },
  { id: 'lab_25', name_ar: '25 مختبر', name_en: 'Lab Rat', icon: '🐀', xp: 300, condition: 'lab_complete >= 25' },
  { id: 'ctf_50', name_ar: '50 تحدي', name_en: 'Flag Hunter', icon: '🚩', xp: 500, condition: 'ctf_solve >= 50' },
  { id: 'ctf_100', name_ar: '100 تحدي', name_en: 'Flag Master', icon: '🏴', xp: 1000, condition: 'ctf_solve >= 100' },

  // Streaks
  { id: 'streak_7', name_ar: 'أسبوع متواصل', name_en: '7-Day Streak', icon: '🔥', xp: 150, condition: 'streak >= 7' },
  { id: 'streak_30', name_ar: 'شهر متواصل', name_en: '30-Day Streak', icon: '💪', xp: 500, condition: 'streak >= 30' },
  { id: 'streak_100', name_ar: '100 يوم', name_en: '100-Day Streak', icon: '🏅', xp: 2000, condition: 'streak >= 100' },

  // Points
  { id: 'points_1000', name_ar: '1000 نقطة', name_en: '1K Points', icon: '⭐', xp: 100, condition: 'points >= 1000' },
  { id: 'points_5000', name_ar: '5000 نقطة', name_en: '5K Points', icon: '🌟', xp: 250, condition: 'points >= 5000' },
  { id: 'points_10000', name_ar: '10000 نقطة', name_en: '10K Points', icon: '✨', xp: 500, condition: 'points >= 10000' },

  // Difficulty
  { id: 'hard_lab', name_ar: 'مختبر صعب', name_en: 'Hard Mode', icon: '💎', xp: 300, condition: 'hard_lab >= 1' },
  { id: 'expert_lab', name_ar: 'مختبر خبير', name_en: 'Insane Mode', icon: '🔮', xp: 750, condition: 'expert_lab >= 1' },
];

// ─── Calculate User's Current Level ───
export function getUserLevel(points: number) {
  let current = XP_LEVELS[0];
  let next = XP_LEVELS[1];

  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (points >= XP_LEVELS[i].minPoints) {
      current = XP_LEVELS[i];
      next = XP_LEVELS[i + 1] || XP_LEVELS[i];
      break;
    }
  }

  const pointsInLevel = points - current.minPoints;
  const pointsToNext = next.minPoints - current.minPoints;
  const progress = pointsToNext > 0 ? Math.min(100, Math.round((pointsInLevel / pointsToNext) * 100)) : 100;

  return {
    current,
    next: current.level !== next.level ? next : null,
    pointsInLevel,
    pointsToNext: current.level !== next.level ? next.minPoints - points : 0,
    progress,
  };
}

// ─── Check and Award Achievements ───
export function evaluateAchievements(userId: string): { newlyUnlocked: string[]; totalXPAwarded: number } {
  const newlyUnlocked: string[] = [];
  let totalXPAwarded = 0;

  // Gather user stats
  const user = db.prepare(`SELECT points FROM users WHERE id = ?`).get(userId) as any;
  if (!user) return { newlyUnlocked, totalXPAwarded };

  const stats: Record<string, number> = {
    points: user.points || 0,
    course_complete: 0,
    lab_complete: 0,
    ctf_solve: 0,
    certificates: 0,
    streak: 0,
    hard_lab: 0,
    expert_lab: 0,
  };

  try {
    stats.course_complete = (db.prepare(
      `SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ? AND completed = 1`
    ).get(userId) as any)?.c || 0;
  } catch { /* skip */ }

  try {
    stats.lab_complete = (db.prepare(
      `SELECT COUNT(*) as c FROM lab_completions WHERE user_id = ?`
    ).get(userId) as any)?.c || 0;
  } catch { /* skip */ }

  try {
    stats.ctf_solve = (db.prepare(
      `SELECT COUNT(*) as c FROM ctf_solves WHERE user_id = ?`
    ).get(userId) as any)?.c || 0;
  } catch { /* skip */ }

  try {
    stats.certificates = (db.prepare(
      `SELECT COUNT(*) as c FROM certificates WHERE user_id = ?`
    ).get(userId) as any)?.c || 0;
  } catch { /* skip */ }

  // Calculate streak
  try {
    const days = db.prepare(`
      SELECT DISTINCT DATE(created_at) as d FROM (
        SELECT enrolled_at as created_at FROM course_enrollments WHERE user_id = ?
        UNION ALL SELECT completed_at FROM lab_completions WHERE user_id = ?
        UNION ALL SELECT solved_at FROM ctf_solves WHERE user_id = ?
      ) ORDER BY d DESC LIMIT 120
    `).all(userId, userId, userId) as any[];

    let streak = 0;
    for (let i = 0; i < days.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      if (days[i]?.d === expected) streak++;
      else break;
    }
    stats.streak = streak;
  } catch { /* skip */ }

  // Check hard/expert labs
  try {
    stats.hard_lab = (db.prepare(`
      SELECT COUNT(*) as c FROM lab_completions lc
      JOIN labs l ON lc.lab_id = l.id
      WHERE lc.user_id = ? AND l.difficulty IN ('hard', 'advanced')
    `).get(userId) as any)?.c || 0;

    stats.expert_lab = (db.prepare(`
      SELECT COUNT(*) as c FROM lab_completions lc
      JOIN labs l ON lc.lab_id = l.id
      WHERE lc.user_id = ? AND l.difficulty = 'expert'
    `).get(userId) as any)?.c || 0;
  } catch { /* skip */ }

  // Get already-earned achievements
  const earnedSet = new Set<string>();
  try {
    const earned = db.prepare(
      `SELECT achievement_id FROM user_achievements WHERE user_id = ?`
    ).all(userId) as any[];
    earned.forEach(e => earnedSet.add(e.achievement_id));
  } catch { /* skip */ }

  // Evaluate each achievement
  for (const achievement of ACHIEVEMENTS) {
    if (earnedSet.has(achievement.id)) continue;

    // Parse condition like "ctf_solve >= 50"
    const match = achievement.condition.match(/^(\w+)\s*(>=|>|=)\s*(\d+)$/);
    if (!match) continue;

    const [, field, op, val] = match;
    const threshold = parseInt(val);
    const actual = stats[field] || 0;

    let met = false;
    if (op === '>=' && actual >= threshold) met = true;
    if (op === '>' && actual > threshold) met = true;
    if (op === '=' && actual === threshold) met = true;

    if (met) {
      try {
        db.prepare(`
          INSERT INTO user_achievements (id, user_id, achievement_id, earned_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING
        `).run(crypto.randomUUID(), userId, achievement.id);

        // Award XP
        db.prepare(`UPDATE users SET points = points + ? WHERE id = ?`).run(achievement.xp, userId);

        newlyUnlocked.push(achievement.id);
        totalXPAwarded += achievement.xp;
        
        logger.info('system', `Achievement unlocked: ${achievement.id} for ${userId}`, { xp: achievement.xp });
      } catch { /* skip duplicates */ }
    }
  }

  // Update experience level
  if (totalXPAwarded > 0) {
    const updatedUser = db.prepare(`SELECT points FROM users WHERE id = ?`).get(userId) as any;
    const level = getUserLevel(updatedUser.points);
    try {
      db.prepare(`UPDATE users SET experience_level = ? WHERE id = ?`).run(level.current.level, userId);
    } catch { /* skip */ }
  }

  return { newlyUnlocked, totalXPAwarded };
}
