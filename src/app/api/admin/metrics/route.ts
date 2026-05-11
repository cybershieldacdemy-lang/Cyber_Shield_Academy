import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Mock dates
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        
        // 1. Total sessions today
        const sessionsTodayStmt = db.prepare('SELECT COUNT(*) as count FROM live_sessions WHERE scheduled_at >= ?');
        const sessionsToday = sessionsTodayStmt.get(startOfDay.toISOString()) as any;

        // 2. Total active sessions right now
        const activeSessionsStmt = db.prepare("SELECT COUNT(*) as count FROM live_sessions WHERE status = 'active'");
        const activeSessions = activeSessionsStmt.get() as any;

        // 3. Total Historic Bookings
        const totalBookingsStmt = db.prepare('SELECT COUNT(*) as count FROM live_sessions');
        const totalBookings = totalBookingsStmt.get() as any;

        // 4. Instructors Count
        const instructorsStmt = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher' OR account_type = 'instructor'");
        const totalInstructors = instructorsStmt.get() as any;

        // 5. Aggregate distribution for pie chart (Chat/Video/Voice)
        const distributionStmt = db.prepare('SELECT session_type, COUNT(*) as value FROM live_sessions GROUP BY session_type');
        const distribution = distributionStmt.all();

        return NextResponse.json({
            overview: {
                totalSessionsToday: sessionsToday.count,
                activeSessionsNow: activeSessions.count,
                totalBookings: totalBookings.count,
                totalInstructors: totalInstructors.count
            },
            distribution
        });
    } catch (error: any) {
        console.error("Admin Metrics API Error:", error);
        return NextResponse.json({ message: "Server error", detail: error.message }, { status: 500 });
    }
}
