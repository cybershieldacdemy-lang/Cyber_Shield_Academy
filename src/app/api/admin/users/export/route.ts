import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, getRequestIP } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// ═══════════════════════════════════════════════════════════
// GET /api/admin/users/export — Export all users as CSV
// ═══════════════════════════════════════════════════════════
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const users = db.prepare(`
            SELECT id, name, email, role, phone, country, bio, 
                   experience_level, account_type, points, email_verified, created_at
            FROM users
            ORDER BY created_at DESC
        `).all() as any[];

        // Build CSV
        const headers = ['ID', 'الاسم', 'البريد الإلكتروني', 'الدور', 'الهاتف', 'الدولة', 'النقاط', 'الحالة', 'تاريخ التسجيل'];
        const rows = users.map(u => [
            u.id,
            `"${(u.name || '').replace(/"/g, '""')}"`,
            u.email,
            u.role,
            u.phone || '',
            u.country || '',
            u.points || 0,
            u.role === 'suspended' ? 'معطل' : 'نشط',
            u.created_at || '',
        ].join(','));

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // BOM for Arabic support

        const ip = getRequestIP(request);
        logAudit({
            action: 'DATA_EXPORT',
            userId: user.id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            resource: 'users',
            details: `قام المسؤول ${user.email} بتصدير بيانات المستخدمين (${users.length} سجل)`,
            severity: 'medium',
        });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        console.error('Export users error:', error);
        return NextResponse.json({ message: 'Server error', detail: error.message }, { status: 500 });
    }
}
