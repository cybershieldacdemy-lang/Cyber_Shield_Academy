import { NextResponse } from 'next/server';
import { detectThreats, getThreatLevel } from '@/lib/ids-service';
import { guardRoute } from '@/lib/api-guard';


// GET /api/admin/ids/alerts
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const alerts = detectThreats();
        const threatLevel = getThreatLevel(alerts);

        // Optional: Log that admin checked IDS if needed, or keep silent to avoid noise

        return NextResponse.json({
            threatLevel,
            alerts
        });
    } catch (error) {
        console.error('IDS Scan Error:', error);
        return NextResponse.json({ message: 'Error running IDS scan' }, { status: 500 });
    }
}
