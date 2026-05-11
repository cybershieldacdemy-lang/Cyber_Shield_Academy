/**
 * 🎯 Skill Profile & Career Matching Engine
 * 
 * Builds dynamic skill profiles from user activity:
 * - Course completions → skill scores
 * - Lab completions → practical skill scores
 * - CTF solves → offensive skill scores
 * - Certifications → verified credentials
 * 
 * Matches users with job postings based on skill overlap.
 */
import db from '@/lib/db';

// ─── Skill Categories ───
const SKILL_MAP: Record<string, { category: string; weight: number }> = {
  network: { category: 'network_security', weight: 1 },
  web: { category: 'web_security', weight: 1 },
  crypto: { category: 'cryptography', weight: 1 },
  forensics: { category: 'digital_forensics', weight: 1 },
  malware: { category: 'malware_analysis', weight: 1 },
  osint: { category: 'osint', weight: 1 },
  pentest: { category: 'penetration_testing', weight: 1.2 },
  reverse: { category: 'reverse_engineering', weight: 1.2 },
  cloud: { category: 'cloud_security', weight: 1 },
  mobile: { category: 'mobile_security', weight: 1 },
  iot: { category: 'iot_security', weight: 1 },
  general: { category: 'general_security', weight: 0.5 },
};

export interface SkillScore {
  category: string;
  score: number; // 0-100
  level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  sources: { type: string; count: number }[];
}

export interface SkillProfile {
  userId: string;
  totalScore: number;
  rank: string;
  skills: SkillScore[];
  certifications: string[];
  strengths: string[];
  gaps: string[];
  updatedAt: string;
}

function scoreToLevel(score: number): SkillScore['level'] {
  if (score >= 80) return 'expert';
  if (score >= 60) return 'advanced';
  if (score >= 40) return 'intermediate';
  if (score >= 20) return 'beginner';
  return 'novice';
}

function pointsToRank(points: number): string {
  if (points >= 10000) return 'Elite Hacker';
  if (points >= 5000) return 'Senior Pentester';
  if (points >= 2000) return 'Security Analyst';
  if (points >= 1000) return 'Junior Analyst';
  if (points >= 500) return 'Security Enthusiast';
  if (points >= 100) return 'Script Kiddie';
  return 'Noob';
}

// ─── Build Complete Skill Profile ───
export function buildSkillProfile(userId: string): SkillProfile {
  const skillScores: Record<string, { points: number; sources: { type: string; count: number }[] }> = {};

  // Initialize all skills
  for (const [, info] of Object.entries(SKILL_MAP)) {
    if (!skillScores[info.category]) {
      skillScores[info.category] = { points: 0, sources: [] };
    }
  }

  // 1. Course completions
  try {
    const courses = db.prepare(`
      SELECT c.category, COUNT(*) as count
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.user_id = ? AND ce.completed = 1
      GROUP BY c.category
    `).all(userId) as any[];

    for (const row of courses) {
      const cat = SKILL_MAP[row.category]?.category || 'general_security';
      if (!skillScores[cat]) skillScores[cat] = { points: 0, sources: [] };
      skillScores[cat].points += row.count * 15;
      skillScores[cat].sources.push({ type: 'courses', count: row.count });
    }
  } catch { /* skip */ }

  // 2. Lab completions
  try {
    const labs = db.prepare(`
      SELECT l.category, COUNT(*) as count, SUM(lc.points_earned) as total_points
      FROM lab_completions lc
      JOIN labs l ON lc.lab_id = l.id
      WHERE lc.user_id = ?
      GROUP BY l.category
    `).all(userId) as any[];

    for (const row of labs) {
      const cat = SKILL_MAP[row.category]?.category || 'general_security';
      if (!skillScores[cat]) skillScores[cat] = { points: 0, sources: [] };
      skillScores[cat].points += row.count * 20; // Labs worth more (hands-on)
      skillScores[cat].sources.push({ type: 'labs', count: row.count });
    }
  } catch { /* skip */ }

  // 3. CTF solves
  try {
    const ctf = db.prepare(`
      SELECT cc.category_id as category, COUNT(*) as count, SUM(cs.points_earned) as total
      FROM ctf_solves cs
      JOIN ctf_challenges cc ON cs.challenge_id = cc.id
      WHERE cs.user_id = ?
      GROUP BY cc.category_id
    `).all(userId) as any[];

    for (const row of ctf) {
      const cat = SKILL_MAP[row.category]?.category || 'general_security';
      if (!skillScores[cat]) skillScores[cat] = { points: 0, sources: [] };
      skillScores[cat].points += row.count * 25; // CTF worth most (offensive skill)
      skillScores[cat].sources.push({ type: 'ctf', count: row.count });
    }
  } catch { /* skip */ }

  // 4. Get certifications
  let certifications: string[] = [];
  try {
    const certs = db.prepare(
      `SELECT course_title FROM certificates WHERE user_id = ?`
    ).all(userId) as any[];
    certifications = certs.map(c => c.course_title);
  } catch { /* skip */ }

  // 5. Get user points for rank
  const user = db.prepare(`SELECT points FROM users WHERE id = ?`).get(userId) as any;
  const totalPoints = user?.points || 0;

  // Build skill array, normalize scores to 0-100
  const maxPoints = Math.max(1, ...Object.values(skillScores).map(s => s.points));
  const skills: SkillScore[] = Object.entries(skillScores)
    .map(([category, data]) => ({
      category,
      score: Math.min(100, Math.round((data.points / maxPoints) * 100)),
      level: scoreToLevel(Math.min(100, Math.round((data.points / maxPoints) * 100))),
      sources: data.sources.filter(s => s.count > 0),
    }))
    .filter(s => s.score > 0 || s.sources.length > 0)
    .sort((a, b) => b.score - a.score);

  // Identify strengths (top 3) and gaps (bottom 3 with score < 30)
  const strengths = skills.filter(s => s.score >= 40).slice(0, 3).map(s => s.category);
  const gaps = skills.filter(s => s.score < 30 && s.score > 0).slice(-3).map(s => s.category);

  return {
    userId,
    totalScore: totalPoints,
    rank: pointsToRank(totalPoints),
    skills,
    certifications,
    strengths,
    gaps,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Job Matching ───
export function matchJobs(userId: string, limit = 10) {
  const profile = buildSkillProfile(userId);
  const userSkills = new Set(profile.skills.filter(s => s.score >= 20).map(s => s.category));

  try {
    const jobs = db.prepare(`
      SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC LIMIT 50
    `).all() as any[];

    // Score each job based on skill overlap
    const scored = jobs.map(job => {
      const jobRole = job.role?.toLowerCase() || '';
      let matchScore = 0;

      // Simple keyword matching against user skills
      for (const skill of userSkills) {
        if (jobRole.includes(skill.replace('_', ' ')) || 
            jobRole.includes(skill.replace('_security', '')) ||
            job.requirements?.toLowerCase().includes(skill.replace('_', ' '))) {
          matchScore += 20;
        }
      }

      // Boost for experience level match
      if (profile.rank.includes('Senior') && jobRole.includes('senior')) matchScore += 15;
      if (profile.rank.includes('Junior') && jobRole.includes('junior')) matchScore += 15;

      return { ...job, matchScore, matchPercentage: Math.min(100, matchScore) };
    });

    return scored
      .filter(j => j.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  } catch {
    return [];
  }
}
