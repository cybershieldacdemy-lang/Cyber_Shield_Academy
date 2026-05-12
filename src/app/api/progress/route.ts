import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lessonId = searchParams.get('lessonId');

        if (!lessonId) {
            return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = payload.id;

        const progress = db.prepare(
            'SELECT watched_seconds, is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?'
        ).get(userId, lessonId) as { watched_seconds: number, is_completed: number } | undefined;

        return NextResponse.json({
            watched_seconds: progress?.watched_seconds || 0,
            is_completed: progress?.is_completed === 1,
        });

    } catch (error) {
        console.error('Progress GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { lessonId, watchedSeconds, isCompleted, courseId } = body;

        if (!lessonId || watchedSeconds === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = payload.id as string;
        const id = `${userId}_${lessonId}`;

        const existingProgress = db.prepare('SELECT is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId) as any;
        const wasCompleted = existingProgress?.is_completed === 1;
        const newlyCompleted = !wasCompleted && isCompleted;
        const isCompInt = isCompleted ? 1 : 0;

        // Run ALL writes in a single transaction for atomicity
        const updateTransaction = db.transaction(() => {
            // 1. Ensure enrollment
            if (courseId) {
                const enrollmentId = `${userId}_${courseId}`;
                db.prepare(`
                    INSERT INTO course_enrollments (id, user_id, course_id, enrolled_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(user_id, course_id) DO NOTHING
                `).run(enrollmentId, userId, courseId);
            }

            // 2. Upsert lesson progress
            db.prepare(`
                INSERT INTO lesson_progress (id, user_id, lesson_id, watched_seconds, is_completed, last_watched_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                watched_seconds = CASE WHEN EXCLUDED.is_completed = 1 THEN EXCLUDED.watched_seconds ELSE MAX(lesson_progress.watched_seconds, EXCLUDED.watched_seconds) END,
                is_completed = CASE WHEN lesson_progress.is_completed = 1 THEN 1 ELSE EXCLUDED.is_completed END,
                last_watched_at = CURRENT_TIMESTAMP
            `).run(id, userId, lessonId, watchedSeconds, isCompInt);

            // 3. Award lesson completion points
            if (newlyCompleted) {
                db.prepare('UPDATE users SET points = points + 10 WHERE id = ?').run(userId);
            }

            // 4. Update course progress
            if (courseId) {
                const result = db.prepare(`
                    SELECT 
                        (SELECT COUNT(*) FROM course_lessons WHERE course_id = ?) as total_lessons,
                        (SELECT COUNT(*) FROM lesson_progress lp 
                         JOIN course_lessons cl ON lp.lesson_id = cl.id 
                         WHERE cl.course_id = ? AND lp.user_id = ? AND lp.is_completed = 1) as completed_lessons
                `).get(courseId, courseId, userId) as any;
                
                if (result && result.total_lessons > 0) {
                    const percent = Math.round((result.completed_lessons / result.total_lessons) * 100);
                    const isCourseCompleted = percent === 100 ? 1 : 0;
                    
                    const existingEnrollment = db.prepare('SELECT completed FROM course_enrollments WHERE user_id = ? AND course_id = ?').get(userId, courseId) as any;
                    const newlyCourseCompleted = existingEnrollment?.completed === 0 && isCourseCompleted === 1;

                    db.prepare(`
                        UPDATE course_enrollments 
                        SET progress = ?, 
                            completed = CASE WHEN completed = 1 THEN 1 ELSE ? END,
                            completed_at = CASE WHEN completed = 0 AND ? = 1 THEN CURRENT_TIMESTAMP ELSE completed_at END
                        WHERE user_id = ? AND course_id = ?
                    `).run(percent, isCourseCompleted, isCourseCompleted, userId, courseId);

                    // Auto-generate certificate + award points on course completion
                    if (newlyCourseCompleted) {
                        db.prepare('UPDATE users SET points = points + 100 WHERE id = ?').run(userId);

                        const existingCert = db.prepare('SELECT id FROM certificates WHERE user_id = ? AND course_id = ?').get(userId, courseId);
                        
                        if (!existingCert) {
                            const courseInfo = db.prepare('SELECT title_ar FROM courses WHERE id = ?').get(courseId) as { title_ar: string };
                            const userInfo = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as { name: string };
                            
                            if (courseInfo && userInfo) {
                                 const certCode = `CERT-${crypto.randomUUID().split('-')[0].toUpperCase()}-${courseId}`;
                                 
                                 db.prepare(`
                                     INSERT INTO certificates (user_id, user_name, course_id, course_title, certificate_code)
                                     VALUES (?, ?, ?, ?, ?)
                                 `).run(userId, userInfo.name, courseId, courseInfo.title_ar, certCode);
                            }
                        }
                    }
                }
            }
        });

        updateTransaction();

        // Async gamification (non-critical, outside transaction)
        if (newlyCompleted) {
            import('@/lib/gamification').then(({ checkAndAwardBadges, awardSpecificBadge }) => {
                awardSpecificBadge(userId, 'first_blood');
                checkAndAwardBadges(userId);
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Progress POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
