/**
 * 🎓 AI Learning Suggestions — توصيات التعلم الذكية
 */
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { generateSuggestions, isConfigured } from '@/lib/ai-engine';
import { getAuthUser } from '@/lib/api-guard';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({
                suggestions: [
                    { title: '📝 سجّل حساباً', reason: 'للحصول على توصيات مخصصة بناءً على تقدمك', action: 'انتقل لصفحة التسجيل', priority: 'high' },
                    { title: '📚 ابدأ بالأساسيات', reason: 'تعلم المفاهيم الأساسية للأمن السيبراني', action: 'تصفح الدورات التدريبية', priority: 'high' },
                    { title: '🗺️ اختر مسارك', reason: 'حدد المجال الذي يناسب اهتماماتك', action: 'استعرض مسارات التعلم', priority: 'medium' },
                ]
            });
        }

        if (!isConfigured()) {
            return NextResponse.json({ suggestions: getStaticSuggestions(user.id) });
        }

        // Gather user progress data
        const enrollments = (db.prepare('SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ?').get(user.id) as any)?.c || 0;
        const completedCourses = (db.prepare('SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ? AND completed = 1').get(user.id) as any)?.c || 0;
        const completedLabs = (db.prepare('SELECT COUNT(*) as c FROM lab_completions WHERE user_id = ?').get(user.id) as any)?.c || 0;
        const ctfSolves = (db.prepare('SELECT COUNT(*) as c FROM ctf_solves WHERE user_id = ?').get(user.id) as any)?.c || 0;
        const quizAttempts = db.prepare('SELECT score FROM quiz_attempts WHERE user_id = ? ORDER BY attempted_at DESC LIMIT 10').all(user.id) as any[];
        const quizScores = quizAttempts.map((q: any) => q.score);
        const userInfo = db.prepare('SELECT experience_level, points FROM users WHERE id = ?').get(user.id) as any;

        const result = await generateSuggestions({
            completedCourses,
            totalEnrolled: enrollments,
            completedLabs,
            ctfSolves,
            quizScores,
            experienceLevel: userInfo?.experience_level || 'beginner',
            points: userInfo?.points || 0,
        });

        // Parse AI response
        try {
            const jsonMatch = result.suggestions.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return NextResponse.json({ suggestions: JSON.parse(jsonMatch[0]) });
            }
        } catch { /* fall through */ }

        return NextResponse.json({ suggestions: getStaticSuggestions(user.id) });
    } catch (error) {
        console.error('Suggestions error:', error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}

function getStaticSuggestions(userId: string) {
    const enrollments = (db.prepare('SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ?').get(userId) as any)?.c || 0;
    const completedLabs = (db.prepare('SELECT COUNT(*) as c FROM lab_completions WHERE user_id = ?').get(userId) as any)?.c || 0;

    const suggestions = [];

    if (enrollments === 0) {
        suggestions.push({ title: '🎓 سجّل في أول دورة', reason: 'ابدأ رحلة التعلم بتسجيلك في دورة مناسبة لمستواك', action: 'تصفح الدورات', priority: 'high' });
    }
    if (completedLabs === 0) {
        suggestions.push({ title: '🔬 جرّب مختبراً عملياً', reason: 'التطبيق العملي يعزز الفهم النظري', action: 'ادخل المختبرات', priority: 'high' });
    }
    suggestions.push({ title: '📖 وسّع معرفتك', reason: 'تعلم مصطلحات جديدة يومياً', action: 'تصفح قاموس المصطلحات', priority: 'medium' });
    suggestions.push({ title: '🚩 تحدَّ نفسك', reason: 'حل تحديات CTF يصقل مهاراتك', action: 'ابدأ تحدي CTF', priority: 'medium' });

    return suggestions;
}
