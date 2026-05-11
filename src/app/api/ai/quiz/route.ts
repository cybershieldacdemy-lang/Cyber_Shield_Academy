/**
 * 🧩 AI Quiz Generator — مولد الاختبارات الذكي
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz, isConfigured } from '@/lib/ai-engine';

export async function POST(request: NextRequest) {
    try {
        if (!isConfigured()) {
            return NextResponse.json({ message: 'المساعد الذكي غير مفعّل' }, { status: 503 });
        }

        const body = await request.json();
        const { topic, difficulty = 'beginner', count = 5, language = 'ar' } = body;

        if (!topic || typeof topic !== 'string') {
            return NextResponse.json({ message: 'الموضوع مطلوب' }, { status: 400 });
        }

        const safeCount = Math.min(Math.max(parseInt(String(count)) || 5, 1), 10);

        const result = await generateQuiz(topic, difficulty, safeCount, language);

        return NextResponse.json({
            questions: result.questions,
            topic,
            difficulty,
            count: result.questions.length,
        });
    } catch (error) {
        console.error('Quiz generation error:', error);
        return NextResponse.json({ message: 'خطأ في إنشاء الاختبار' }, { status: 500 });
    }
}
