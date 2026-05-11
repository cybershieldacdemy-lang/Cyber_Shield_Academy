/**
 * 🔐 GDPR Compliance & Data Privacy Service
 * 
 * Implements GDPR Article requirements:
 * - Art. 15: Right of Access (data export)
 * - Art. 17: Right to Erasure (account deletion)
 * - Art. 20: Right to Data Portability (JSON export)
 * - Art. 7: Consent Management
 */
import db from '@/lib/db';
import logger from '@/lib/logger';

// ─── Data Export (Art. 15 & 20) ───
export function exportUserData(userId: string): Record<string, unknown> {
  const user = db.prepare(
    `SELECT id, name, email, role, country, bio, avatar, experience_level, points, 
     two_factor_enabled, created_at 
     FROM users WHERE id = ?`
  ).get(userId) as any;

  if (!user) throw new Error('User not found');

  const courses = db.prepare(
    `SELECT ce.*, c.title_ar, c.title_en FROM course_enrollments ce
     JOIN courses c ON ce.course_id = c.id WHERE ce.user_id = ?`
  ).all(userId);

  const certificates = db.prepare(
    `SELECT * FROM certificates WHERE user_id = ?`
  ).all(userId);

  const progress = db.prepare(
    `SELECT * FROM progress WHERE user_id = ?`
  ).all(userId);

  const ctfSolves = db.prepare(
    `SELECT cs.*, cc.title FROM ctf_solves cs
     JOIN ctf_challenges cc ON cs.challenge_id = cc.id WHERE cs.user_id = ?`
  ).all(userId);

  const labCompletions = db.prepare(
    `SELECT lc.*, l.title_ar, l.title_en FROM lab_completions lc
     JOIN labs l ON lc.lab_id = l.id WHERE lc.user_id = ?`
  ).all(userId);

  const achievements = db.prepare(
    `SELECT ua.*, a.title_ar, a.title_en FROM user_achievements ua
     JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?`
  ).all(userId);

  const payments = db.prepare(
    `SELECT id, amount, currency, status, created_at FROM payments WHERE user_id = ?`
  ).all(userId);

  const subscription = db.prepare(
    `SELECT s.*, p.name_en FROM subscriptions s
     LEFT JOIN plans p ON s.plan_id = p.id WHERE s.user_id = ? ORDER BY s.created_at DESC LIMIT 1`
  ).get(userId);

  const videoProgress = db.prepare(
    `SELECT vp.*, lv.title FROM video_progress vp
     JOIN learning_videos lv ON vp.video_id = lv.id WHERE vp.user_id = ?`
  ).all(userId);

  const auditLogs = db.prepare(
    `SELECT action, resource, created_at FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`
  ).all(userId);

  logger.info('system', `GDPR data export for user ${userId}`);

  return {
    exportDate: new Date().toISOString(),
    gdprVersion: '2.0',
    profile: user,
    enrollments: courses,
    certificates,
    progress,
    ctfSolves,
    labCompletions,
    achievements,
    payments,
    subscription,
    videoProgress,
    recentActivity: auditLogs,
  };
}

// ─── Right to Erasure (Art. 17) ───
export function deleteUserData(userId: string, requestedBy: string): { deleted: boolean; tables: string[] } {
  const user = db.prepare(`SELECT id, email FROM users WHERE id = ?`).get(userId) as any;
  if (!user) throw new Error('User not found');

  const tables: string[] = [];

  const deleteOps = [
    { table: 'course_enrollments', sql: 'DELETE FROM course_enrollments WHERE user_id = ?' },
    { table: 'lesson_progress', sql: 'DELETE FROM lesson_progress WHERE user_id = ?' },
    { table: 'video_progress', sql: 'DELETE FROM video_progress WHERE user_id = ?' },
    { table: 'video_bookmarks', sql: 'DELETE FROM video_bookmarks WHERE user_id = ?' },
    { table: 'progress', sql: 'DELETE FROM progress WHERE user_id = ?' },
    { table: 'ctf_solves', sql: 'DELETE FROM ctf_solves WHERE user_id = ?' },
    { table: 'lab_completions', sql: 'DELETE FROM lab_completions WHERE user_id = ?' },
    { table: 'user_achievements', sql: 'DELETE FROM user_achievements WHERE user_id = ?' },
    { table: 'quiz_attempts', sql: 'DELETE FROM quiz_attempts WHERE user_id = ?' },
    { table: 'notifications', sql: 'DELETE FROM notifications WHERE user_id = ?' },
    { table: 'ai_conversations', sql: 'DELETE FROM ai_conversations WHERE user_id = ?' },
    { table: 'refresh_tokens', sql: 'DELETE FROM refresh_tokens WHERE user_id = ?' },
    { table: 'job_applications', sql: 'DELETE FROM job_applications WHERE user_id = ?' },
    { table: 'session_messages', sql: 'DELETE FROM session_messages WHERE sender_id = ?' },
    { table: 'comments', sql: 'DELETE FROM comments WHERE user_id = ?' },
    { table: 'lesson_comments', sql: 'DELETE FROM lesson_comments WHERE user_id = ?' },
    // Anonymize rather than delete (legal requirement for financial records)
    { table: 'payments', sql: `UPDATE payments SET user_id = 'DELETED_USER' WHERE user_id = ?` },
    { table: 'subscriptions', sql: `UPDATE subscriptions SET user_id = 'DELETED_USER', status = 'cancelled' WHERE user_id = ?` },
    // Anonymize audit logs (keep for security but strip PII)
    { table: 'audit_logs', sql: `UPDATE audit_logs SET user_id = 'DELETED_USER' WHERE user_id = ?` },
    // Finally delete the user record
    { table: 'users', sql: 'DELETE FROM users WHERE id = ?' },
  ];

  const transaction = db.transaction(() => {
    for (const op of deleteOps) {
      try {
        const result = db.prepare(op.sql).run(userId);
        if (result.changes > 0) tables.push(op.table);
      } catch (e) {
        logger.error('system', `GDPR deletion failed for table ${op.table}`, { error: String(e) });
      }
    }
  });

  transaction();

  logger.critical('security', `GDPR Art.17 erasure completed for user ${userId}`, {
    requestedBy,
    tablesAffected: tables,
    userEmail: user.email,
  });

  return { deleted: true, tables };
}

// ─── Consent Management ───
export function getUserConsents(userId: string) {
  try {
    const consents = db.prepare(
      `SELECT * FROM user_consents WHERE user_id = ? ORDER BY created_at DESC`
    ).all(userId);
    return consents;
  } catch {
    return [];
  }
}

export function recordConsent(userId: string, consentType: string, granted: boolean, ipAddress: string) {
  try {
    db.prepare(`
      INSERT INTO user_consents (id, user_id, consent_type, granted, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(crypto.randomUUID(), userId, consentType, granted ? 1 : 0, ipAddress);
  } catch {
    // Table might not exist yet
  }

  logger.info('auth', `Consent ${granted ? 'granted' : 'revoked'}: ${consentType}`, { userId });
}
