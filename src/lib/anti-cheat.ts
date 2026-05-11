/**
 * 🛡️ Anti-Cheat System for CTF & Labs
 * 
 * Prevents flag sharing, automated solving, and exploitation:
 * - Flag submission rate limiting (per user + per challenge)
 * - Timing analysis (too-fast solves = suspicious)
 * - Flag format validation
 * - IP correlation (same IP solving for multiple accounts)
 * - Submission pattern analysis
 */
import db from '@/lib/db';
import logger from '@/lib/logger';

interface AntiCheatResult {
  allowed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// ─── Rate Limiting per user per challenge ───
const submissionMap = new Map<string, { count: number; firstAt: number }>();

export function checkFlagSubmission(
  userId: string,
  challengeId: number,
  submittedFlag: string,
  ipAddress: string
): AntiCheatResult {
  const key = `${userId}:${challengeId}`;
  const now = Date.now();

  // 1. Rate limit: max 10 submissions per challenge per 5 minutes
  const entry = submissionMap.get(key);
  if (entry) {
    if (now - entry.firstAt < 5 * 60 * 1000) {
      if (entry.count >= 10) {
        logger.security(`CTF rate limit: ${userId} on challenge ${challengeId}`, { ip: ipAddress });
        return { allowed: false, reason: 'تم تجاوز حد المحاولات. انتظر 5 دقائق.', severity: 'medium' };
      }
      entry.count++;
    } else {
      submissionMap.set(key, { count: 1, firstAt: now });
    }
  } else {
    submissionMap.set(key, { count: 1, firstAt: now });
  }

  // 2. Flag format validation
  if (!submittedFlag || typeof submittedFlag !== 'string') {
    return { allowed: false, reason: 'صيغة العلم غير صالحة', severity: 'low' };
  }
  if (submittedFlag.length > 200) {
    return { allowed: false, reason: 'العلم طويل جداً', severity: 'medium' };
  }

  // 3. Check for injection in flag
  const injectionPatterns = [/[<>]/, /javascript:/i, /\bon\w+=/, /union\s+select/i, /;\s*drop/i];
  if (injectionPatterns.some(p => p.test(submittedFlag))) {
    logger.security(`CTF injection attempt by ${userId}`, { flag: submittedFlag.slice(0, 50), ip: ipAddress });
    return { allowed: false, reason: 'محتوى غير مسموح', severity: 'critical' };
  }

  // 4. Timing analysis: Check if user solved previous challenge impossibly fast
  try {
    const recentSolves = db.prepare(`
      SELECT solved_at FROM ctf_solves 
      WHERE user_id = ? 
      ORDER BY solved_at DESC LIMIT 3
    `).all(userId) as any[];

    if (recentSolves.length >= 3) {
      const newest = new Date(recentSolves[0].solved_at).getTime();
      const oldest = new Date(recentSolves[2].solved_at).getTime();
      const timeDiff = newest - oldest;
      // 3 solves in under 30 seconds = suspicious
      if (timeDiff < 30000) {
        logger.security(`CTF speed hack suspected: ${userId} — 3 solves in ${timeDiff}ms`, { ip: ipAddress });
        return { allowed: false, reason: 'نشاط مشبوه. تم تعليق الإرسال مؤقتاً.', severity: 'high' };
      }
    }
  } catch { /* table might not exist */ }

  // 5. IP correlation: Check if same IP is submitting for multiple users
  try {
    const ipUsers = db.prepare(`
      SELECT DISTINCT user_id FROM ctf_solves cs
      JOIN audit_logs al ON cs.user_id = al.user_id
      WHERE al.ip_address = ? AND cs.solved_at > datetime('now', '-1 hour')
    `).all(ipAddress) as any[];

    if (ipUsers.length > 2) {
      logger.security(`CTF multi-account suspected from IP ${ipAddress}`, {
        users: ipUsers.map((u: any) => u.user_id),
      });
      // Don't block, just flag for review
    }
  } catch { /* skip if query fails */ }

  return { allowed: true };
}

// ─── Lab Anti-Cheat ───
export function checkLabSubmission(
  userId: string,
  labId: string,
  ipAddress: string
): AntiCheatResult {
  // Check if lab was actually started by this user
  try {
    const labStart = db.prepare(`
      SELECT created_at FROM audit_logs 
      WHERE user_id = ? AND resource_id = ? AND action = 'LAB_START'
      ORDER BY created_at DESC LIMIT 1
    `).get(userId, labId) as any;

    if (!labStart) {
      logger.security(`Lab completion without start: ${userId} on ${labId}`, { ip: ipAddress });
      return { allowed: false, reason: 'لم يتم بدء المختبر', severity: 'high' };
    }

    // Check timing: completing a lab in under 10 seconds is impossible
    const startTime = new Date(labStart.created_at).getTime();
    const elapsed = Date.now() - startTime;
    if (elapsed < 10000) {
      logger.security(`Lab speed hack: ${userId} completed ${labId} in ${elapsed}ms`, { ip: ipAddress });
      return { allowed: false, reason: 'نشاط مشبوه', severity: 'critical' };
    }
  } catch { /* skip */ }

  return { allowed: true };
}

// ─── Cleanup stale entries every 10 minutes ───
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, entry] of submissionMap) {
    if (entry.firstAt < cutoff) submissionMap.delete(key);
  }
}, 10 * 60 * 1000);
