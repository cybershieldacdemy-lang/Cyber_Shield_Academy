/**
 * 🧠 AI Chat API — نقطة نهاية المحادثة مع المساعد الذكي
 * POST: Send message & get AI response
 * GET:  Load conversation history
 * DELETE: Clear conversation
 */
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { chat, isConfigured, AIMessage, AIContext } from '@/lib/ai-engine';
import { getAuthUser, getRequestIP } from '@/lib/api-guard';

export const runtime = "nodejs";

// Rate limiting: per-IP for guests, per-user for authenticated
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxPerMin: number): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || entry.resetAt < now) {
        rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
        return true;
    }
    if (entry.count >= maxPerMin) return false;
    entry.count++;
    return true;
}

// Cleanup rate limit map every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
        if (val.resetAt < now) rateLimitMap.delete(key);
    }
}, 300_000);

// ═══════════════════════════════════════════════════════════
// POST — Send message to AI
// ═══════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
    try {
        if (!isConfigured()) {
            return NextResponse.json({
                message: '⚠️ نموذج الذكاء الاصطناعي المحلي غير متوفر. تأكد من تحميل ملف النموذج.',
                configured: false,
            }, { status: 503 });
        }

        const user = await getAuthUser();
        const ip = getRequestIP(request);

        // Rate limiting: 20/min for auth users, 5/min for guests
        const rateLimitKey = user ? `user:${user.id}` : `ip:${ip}`;
        const maxPerMin = user ? 20 : 5;
        if (!checkRateLimit(rateLimitKey, maxPerMin)) {
            return NextResponse.json({
                message: '⏳ لقد تجاوزت حد الرسائل. يرجى الانتظار دقيقة.',
            }, { status: 429 });
        }

        // Daily limit for guests: 15 messages/day
        if (!user) {
            const dayAgo = new Date(Date.now() - 86400_000).toISOString();
            const guestUsage = (db.prepare(
                `SELECT COUNT(*) as count FROM ai_usage_logs WHERE ip_address = ? AND created_at > ?`
            ).get(ip, dayAgo) as any)?.count || 0;

            if (guestUsage >= 15) {
                return NextResponse.json({
                    message: '📝 لقد استنفدت رسائلك المجانية اليوم. سجّل حساباً للحصول على رسائل غير محدودة!',
                    requireAuth: true,
                }, { status: 429 });
            }
        }

        const body = await request.json();
        const { message, conversationId, contextType, contextId, contextTitle, contextDescription, contextDifficulty } = body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ message: 'الرسالة مطلوبة' }, { status: 400 });
        }

        if (message.length > 2000) {
            return NextResponse.json({ message: 'الرسالة طويلة جداً (الحد الأقصى 2000 حرف)' }, { status: 400 });
        }

        // Build context
        const context: AIContext = {
            type: contextType || 'general',
            id: contextId,
            title: contextTitle,
            description: contextDescription,
            difficulty: contextDifficulty,
        };

        // Load or create conversation
        let convId = conversationId;
        let history: AIMessage[] = [];

        if (convId) {
            const conv = db.prepare('SELECT messages FROM ai_conversations WHERE id = ?').get(convId) as any;
            if (conv) {
                try { history = JSON.parse(conv.messages); } catch { history = []; }
            }
        }

        if (!convId) {
            convId = crypto.randomUUID();
        }

        // Get user level
        const level = user?.experience_level || 'beginner';

        // Limit history to last 20 messages to control token usage
        const recentHistory = history.slice(-20);

        // Call AI
        const result = await chat(message, recentHistory, level as string, context);

        // Update history
        const updatedHistory = [
            ...history,
            { role: 'user' as const, content: message },
            { role: 'model' as const, content: result.response },
        ];

        // Auto-generate title from first user message
        const title = history.length === 0 ? message.slice(0, 60) : undefined;

        // Save conversation
        db.prepare(`
            INSERT INTO ai_conversations (id, user_id, context_type, context_id, title, messages, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                messages = excluded.messages,
                updated_at = CURRENT_TIMESTAMP
        `).run(
            convId,
            user?.id || `guest:${ip}`,
            context.type,
            context.id || null,
            title || '',
            JSON.stringify(updatedHistory)
        );

        // Log usage
        db.prepare(`
            INSERT INTO ai_usage_logs (user_id, ip_address, tokens_used, context_type)
            VALUES (?, ?, ?, ?)
        `).run(user?.id || null, ip, result.tokensUsed, context.type);

        return NextResponse.json({
            response: result.response,
            conversationId: convId,
            tokensUsed: result.tokensUsed,
        });
    } catch (error: any) {
        console.error('AI Chat error:', error);

        try {
            // Check if it's a structured error from ai-engine
            const errData = JSON.parse(error.message);
            
            if (errData.type === 'SAFETY') {
                return NextResponse.json({ 
                    errorType: 'safety',
                    message: '⚠️ عذراً، لا أستطيع الإجابة على هذا السؤال لأسباب تتعلق بالسلامة.' 
                }, { status: 400 });
            }
            if (errData.type === 'QUOTA_EXCEEDED') {
                return NextResponse.json({ 
                    errorType: 'quota',
                    message: '⏳ تم تجاوز حد الاستخدام المجاني أو الحصة المخصصة. يرجى المحاولة بعد قليل.' 
                }, { status: 429 });
            }
            if (errData.type === 'UNAUTHORIZED') {
                return NextResponse.json({ 
                    errorType: 'unauthorized',
                    message: '❌ مشكلة في مفتاح API (API Key غير صالح). يرجى مراجعة إعدادات النظام.' 
                }, { status: 401 });
            }
        } catch {
            // Normal fallback if it's not our JSON error
        }

        return NextResponse.json({ 
            errorType: 'server',
            message: '❌ الخادم يواجه مشكلة في معالجة طلبك.' 
        }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════
// GET — Load conversation history
// ═══════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        if (conversationId) {
            const conv = db.prepare('SELECT * FROM ai_conversations WHERE id = ?').get(conversationId) as any;
            if (!conv) return NextResponse.json({ messages: [] });
            return NextResponse.json({
                conversationId: conv.id,
                messages: JSON.parse(conv.messages || '[]'),
                contextType: conv.context_type,
                title: conv.title,
            });
        }

        // List recent conversations for user
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ conversations: [] });
        }

        const conversations = db.prepare(`
            SELECT id, title, context_type, updated_at
            FROM ai_conversations
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT 20
        `).all(user.id);

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('AI GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════
// DELETE — Clear conversation
// ═══════════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        if (conversationId) {
            db.prepare('DELETE FROM ai_conversations WHERE id = ?').run(conversationId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ message: 'conversationId مطلوب' }, { status: 400 });
    } catch (error) {
        console.error('AI DELETE error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
