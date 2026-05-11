/**
 * 👥 Team & Community Engine
 * 
 * Team creation, challenges, and community features:
 * - Create/join teams for CTF competitions
 * - Team leaderboard
 * - Forum-like discussions on labs
 * - Collaboration on challenges
 */
import db from '@/lib/db';

// ─── Team Management ───
export function createTeam(captainId: string, name: string, description: string) {
  const id = crypto.randomUUID();
  
  // Check team name uniqueness
  const existing = db.prepare(`SELECT id FROM teams WHERE name = ?`).get(name);
  if (existing) throw new Error('اسم الفريق مستخدم بالفعل');

  // Check user isn't already in a team
  const membership = db.prepare(
    `SELECT id FROM team_members WHERE user_id = ? AND status = 'active'`
  ).get(captainId);
  if (membership) throw new Error('أنت عضو في فريق بالفعل');

  db.prepare(`
    INSERT INTO teams (id, name, description, captain_id, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(id, name, description, captainId);

  // Add captain as member
  db.prepare(`
    INSERT INTO team_members (id, team_id, user_id, role, status, joined_at)
    VALUES (?, ?, ?, 'captain', 'active', CURRENT_TIMESTAMP)
  `).run(crypto.randomUUID(), id, captainId);

  return id;
}

export function joinTeam(userId: string, teamId: string) {
  // Check team exists
  const team = db.prepare(`SELECT id, max_members FROM teams WHERE id = ?`).get(teamId) as any;
  if (!team) throw new Error('الفريق غير موجود');

  // Check not already member
  const existing = db.prepare(
    `SELECT id FROM team_members WHERE user_id = ? AND status = 'active'`
  ).get(userId);
  if (existing) throw new Error('أنت عضو في فريق بالفعل');

  // Check team size
  const memberCount = (db.prepare(
    `SELECT COUNT(*) as c FROM team_members WHERE team_id = ? AND status = 'active'`
  ).get(teamId) as any)?.c || 0;
  
  const maxMembers = team.max_members || 5;
  if (memberCount >= maxMembers) throw new Error('الفريق ممتلئ');

  db.prepare(`
    INSERT INTO team_members (id, team_id, user_id, role, status, joined_at)
    VALUES (?, ?, ?, 'member', 'active', CURRENT_TIMESTAMP)
  `).run(crypto.randomUUID(), teamId, userId);
}

export function getTeamLeaderboard(limit = 20) {
  return db.prepare(`
    SELECT t.id, t.name, t.description, t.avatar,
      COUNT(tm.id) as member_count,
      COALESCE(SUM(u.points), 0) as total_points
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.status = 'active'
    LEFT JOIN users u ON tm.user_id = u.id
    GROUP BY t.id
    ORDER BY total_points DESC
    LIMIT ?
  `).all(limit) as any[];
}

export function getTeamDetails(teamId: string) {
  const team = db.prepare(`SELECT * FROM teams WHERE id = ?`).get(teamId) as any;
  if (!team) return null;

  const members = db.prepare(`
    SELECT tm.*, u.name, u.avatar, u.points, u.experience_level
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ? AND tm.status = 'active'
    ORDER BY u.points DESC
  `).all(teamId) as any[];

  return { ...team, members };
}
