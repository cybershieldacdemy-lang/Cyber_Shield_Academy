import { getUserSubscription, PLAN_HIERARCHY } from '@/lib/stripe';

// ═══════════════════════════════════════════════════════════
// 🛡️ SUBSCRIPTION GUARD — حماية الميزات حسب الباقة
// ═══════════════════════════════════════════════════════════

export function requirePlan(userId: string, minimumPlan: 'free' | 'pro' | 'enterprise'): { allowed: boolean; currentPlan: string; message: string } {
    const sub = getUserSubscription(userId);
    const currentLevel = PLAN_HIERARCHY[sub.plan_id] ?? 0;
    const requiredLevel = PLAN_HIERARCHY[minimumPlan] ?? 0;

    if (currentLevel >= requiredLevel) {
        return { allowed: true, currentPlan: sub.plan_id, message: '' };
    }

    return {
        allowed: false,
        currentPlan: sub.plan_id,
        message: `هذه الميزة تتطلب باقة "${minimumPlan === 'pro' ? 'الاحترافية' : 'المؤسسية'}" أو أعلى. باقتك الحالية: ${sub.name_ar}`,
    };
}

export function getPlanLimits(userId: string): {
    labs_per_month: number;
    advanced_courses: boolean;
    ctf_weekly: boolean;
    support: string;
    plan_id: string;
    plan_name: string;
} {
    const sub = getUserSubscription(userId);
    const limits = JSON.parse(sub.limits || '{}');

    return {
        labs_per_month: limits.labs_per_month ?? 3,
        advanced_courses: limits.advanced_courses ?? false,
        ctf_weekly: limits.ctf_weekly ?? false,
        support: limits.support ?? 'community',
        plan_id: sub.plan_id,
        plan_name: sub.name_ar,
    };
}
