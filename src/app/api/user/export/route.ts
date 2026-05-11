import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

export async function GET(req: Request) {
    const { user, error } = await guardRoute(req, { requireAuth: true });
    if (error) return error;

    try {
        // Fetch all user data
        const profile = db.prepare('SELECT * FROM users WHERE id = ?').get(user!.id) as any;
        const progress = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(user!.id);
        const certificates = db.prepare('SELECT * FROM certificates WHERE user_id = ?').all(user!.id);
        const logs = db.prepare('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC').all(user!.id);

        // Sanitize sensitive fields
        if (profile) {
            delete profile.password;
            delete profile.security_answer;
            delete profile.verification_code;
        }

        const exportData = {
            generated_at: new Date().toISOString(),
            profile,
            learning_progress: progress,
            certificates,
            security_logs: logs,
        };

        logAudit({
            action: 'DATA_EXPORT',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'export_data',
            details: 'تصدير نسخة من بيانات المستخدم (حق قابلية نقل البيانات)',
            severity: 'medium',
        });

        return NextResponse.json(exportData);
    } catch (err) {
        console.error('Export error:', err);
        return NextResponse.json({ message: 'فشل تصدير البيانات' }, { status: 500 });
    }
}
