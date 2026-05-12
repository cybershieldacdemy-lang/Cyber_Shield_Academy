import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';

        // Stats
        const total = (db.prepare('SELECT COUNT(*) as c FROM subscriptions').get() as any)?.c || 0;
        const free = (db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE plan_id = 'free'").get() as any)?.c || 0;
        const pro = (db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE plan_id = 'pro' AND status = 'active'").get() as any)?.c || 0;
        const enterprise = (db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE plan_id = 'enterprise' AND status = 'active'").get() as any)?.c || 0;
        const active = (db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'active'").get() as any)?.c || 0;
        const canceled = (db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'canceled'").get() as any)?.c || 0;

        // MRR calculation
        const mrrResult = db.prepare(`
            SELECT COALESCE(SUM(p.price), 0) as mrr 
            FROM subscriptions s 
            JOIN plans p ON s.plan_id = p.id 
            WHERE s.status = 'active' AND p.price > 0
        `).get() as any;

        // Subscriptions list
        let whereClause = '1=1';
        if (filter === 'active') whereClause = "s.status = 'active'";
        else if (filter === 'pro') whereClause = "s.plan_id = 'pro'";
        else if (filter === 'enterprise') whereClause = "s.plan_id = 'enterprise'";
        else if (filter === 'canceled') whereClause = "s.status = 'canceled'";

        const subscriptions = db.prepare(`
            SELECT s.id, s.plan_id, s.status, s.current_period_end, s.created_at,
                   u.name as user_name, u.email as user_email,
                   p.name_ar as plan_name, p.price
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            JOIN plans p ON s.plan_id = p.id
            WHERE ${whereClause}
            ORDER BY s.created_at DESC
            LIMIT 100
        `).all();

        return NextResponse.json({
            stats: {
                total,
                free,
                pro,
                enterprise,
                mrr: mrrResult?.mrr || 0,
                active,
                canceled,
            },
            subscriptions,
        });

    } catch (error: any) {
        console.error('Admin subscriptions error:', error);
        return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 });
    }
}
