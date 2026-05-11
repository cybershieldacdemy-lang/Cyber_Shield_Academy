import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';
import { comparePassword } from '@/lib/auth';

export async function DELETE(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true });
    if (error) return error;

    try {
        const { password } = (body as { password?: string }) || {};

        if (!password) {
            return NextResponse.json({ message: 'كلمة المرور مطلوبة لتأكيد الحذف' }, { status: 400 });
        }

        // Verify password before deletion
        const dbUser = db.prepare('SELECT password FROM users WHERE id = ?').get(user!.id) as any;
        const isValid = await comparePassword(password, dbUser.password);

        if (!isValid) {
            logAudit({
                action: 'DELETE_ATTEMPT',
                userId: user!.id,
                ip: req.headers.get('x-real-ip') || '127.0.0.1',
                resource: 'account_deletion',
                details: 'محاولة حذف الحساب بكلمة مرور خاطئة',
                severity: 'high',
            });
            return NextResponse.json({ message: 'كلمة المرور غير صحيحة' }, { status: 401 });
        }

        // Perform Deletion (Cascade delete logic should be in DB, but here we do it manually to be safe)
        const deleteTransaction = db.transaction(() => {
            // Delete related data first
            db.prepare('DELETE FROM progress WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM certificates WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM login_attempts WHERE email = ?').run(user!.email);
            db.prepare('DELETE FROM course_enrollments WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM lesson_progress WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM quiz_attempts WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM lab_completions WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM comments WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM lesson_comments WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM video_progress WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM video_bookmarks WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM notifications WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM user_badges WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM user_achievements WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM ctf_solves WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM job_applications WHERE user_id = ?').run(user!.id);
            db.prepare('DELETE FROM session_messages WHERE sender_id = ?').run(user!.id);
            // Finally delete the user
            db.prepare('DELETE FROM users WHERE id = ?').run(user!.id);
        });

        deleteTransaction();

        logAudit({
            action: 'ACCOUNT_DELETED',
            // User ID is gone, so maybe log "DELETED_USER" or keep ID for reference
            userId: `DELETED_${user!.id}`,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'account_deletion',
            details: `تم حذف الحساب نهائياً بناءً على طلب المستخدم (${user!.email})`,
            severity: 'critical',
        });

        const response = NextResponse.json({ message: 'تم حذف الحساب نهائياً. وداعاً! 👋' });
        // Clear auth cookie
        response.cookies.set('token', '', { maxAge: 0, path: '/' });

        return response;
    } catch (err) {
        console.error('Delete account error:', err);
        return NextResponse.json({ message: 'فشل حذف الحساب' }, { status: 500 });
    }
}
