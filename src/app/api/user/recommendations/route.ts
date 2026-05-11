/**
 * 🧠 AI Recommendations API
 * GET: Personalized course, lab, and analytics recommendations
 */
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { recommendCourses, recommendLabs, getUserAnalytics } from '@/lib/recommendation-engine';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const [courses, labs, analytics] = await Promise.all([
      Promise.resolve(recommendCourses(user.id, 6)),
      Promise.resolve(recommendLabs(user.id, 4)),
      Promise.resolve(getUserAnalytics(user.id)),
    ]);

    return NextResponse.json({
      recommendations: { courses, labs },
      analytics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ message: 'Error generating recommendations' }, { status: 500 });
  }
}
