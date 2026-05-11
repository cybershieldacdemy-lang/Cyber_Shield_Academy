/**
 * 📊 Platform Analytics API (Admin)
 * 
 * Comprehensive platform metrics for business intelligence:
 * - User growth, retention, engagement
 * - Revenue metrics (MRR, ARPU)
 * - Content performance
 * - Lab & CTF completion rates
 */
import { NextRequest, NextResponse } from 'next/server';
import { guardRoute } from '@/lib/api-guard';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { user, error } = await guardRoute(request, { requireAuth: true, requireAdmin: true });
  if (error) return error;

  try {
    // ─── User Metrics ───
    const totalUsers = (db.prepare(`SELECT COUNT(*) as c FROM users`).get() as any)?.c || 0;
    const newUsersToday = (db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE DATE(created_at) = DATE('now')`
    ).get() as any)?.c || 0;
    const newUsersWeek = (db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-7 days')`
    ).get() as any)?.c || 0;
    const newUsersMonth = (db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-30 days')`
    ).get() as any)?.c || 0;

    // ─── Engagement Metrics ───
    const activeToday = (db.prepare(`
      SELECT COUNT(DISTINCT user_id) as c FROM audit_logs 
      WHERE DATE(created_at) = DATE('now')
    `).get() as any)?.c || 0;

    const activeWeek = (db.prepare(`
      SELECT COUNT(DISTINCT user_id) as c FROM audit_logs 
      WHERE created_at > datetime('now', '-7 days')
    `).get() as any)?.c || 0;

    // ─── Content Metrics ───
    const totalCourses = (db.prepare(`SELECT COUNT(*) as c FROM courses`).get() as any)?.c || 0;
    const totalLabs = (db.prepare(`SELECT COUNT(*) as c FROM labs`).get() as any)?.c || 0;
    const totalCTFChallenges = (db.prepare(`SELECT COUNT(*) as c FROM ctf_challenges`).get() as any)?.c || 0;
    const totalEnrollments = (db.prepare(`SELECT COUNT(*) as c FROM course_enrollments`).get() as any)?.c || 0;
    const totalLabCompletions = (db.prepare(`SELECT COUNT(*) as c FROM lab_completions`).get() as any)?.c || 0;
    const totalCTFSolves = (db.prepare(`SELECT COUNT(*) as c FROM ctf_solves`).get() as any)?.c || 0;
    const totalCertificates = (db.prepare(`SELECT COUNT(*) as c FROM certificates`).get() as any)?.c || 0;

    // ─── Revenue Metrics ───
    const monthlyRevenue = (db.prepare(`
      SELECT SUM(amount) as total FROM payments 
      WHERE status = 'succeeded' AND created_at > datetime('now', '-30 days')
    `).get() as any)?.total || 0;

    const proSubscribers = (db.prepare(
      `SELECT COUNT(*) as c FROM subscriptions WHERE plan_id = 'pro' AND status = 'active'`
    ).get() as any)?.c || 0;

    const enterpriseSubscribers = (db.prepare(
      `SELECT COUNT(*) as c FROM subscriptions WHERE plan_id = 'enterprise' AND status = 'active'`
    ).get() as any)?.c || 0;

    // ─── Growth Chart (last 30 days) ───
    const dailySignups = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at > datetime('now', '-30 days')
      GROUP BY date ORDER BY date
    `).all() as any[];

    // ─── Top Content ───
    const topCourses = db.prepare(`
      SELECT c.title_ar, c.title_en, COUNT(ce.id) as enrollments
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      GROUP BY c.id ORDER BY enrollments DESC LIMIT 5
    `).all() as any[];

    const topLabs = db.prepare(`
      SELECT l.title_ar, l.title_en, COUNT(lc.id) as completions
      FROM labs l
      LEFT JOIN lab_completions lc ON l.id = lc.lab_id
      GROUP BY l.id ORDER BY completions DESC LIMIT 5
    `).all() as any[];

    // ─── Security Metrics ───
    const securityEvents24h = (db.prepare(`
      SELECT COUNT(*) as c FROM audit_logs 
      WHERE severity IN ('high', 'critical') AND created_at > datetime('now', '-24 hours')
    `).get() as any)?.c || 0;

    const blockedIPs = (db.prepare(
      `SELECT COUNT(*) as c FROM firewall_rules WHERE isActive = 1`
    ).get() as any)?.c || 0;

    return NextResponse.json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
        activeToday,
        activeThisWeek: activeWeek,
      },
      content: {
        courses: totalCourses,
        labs: totalLabs,
        ctfChallenges: totalCTFChallenges,
        enrollments: totalEnrollments,
        labCompletions: totalLabCompletions,
        ctfSolves: totalCTFSolves,
        certificates: totalCertificates,
      },
      revenue: {
        mrr: monthlyRevenue,
        proSubscribers,
        enterpriseSubscribers,
        arpu: totalUsers > 0 ? Math.round(monthlyRevenue / totalUsers * 100) / 100 : 0,
      },
      growth: dailySignups,
      topContent: { courses: topCourses, labs: topLabs },
      security: {
        events24h: securityEvents24h,
        blockedIPs,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
