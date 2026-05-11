import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { getUserSubscription, getUserPayments } from '@/lib/stripe';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
        }

        const subscription = getUserSubscription(user.id);
        const payments = getUserPayments(user.id, 10);

        return NextResponse.json({
            subscription: {
                plan_id: subscription.plan_id,
                status: subscription.status,
                name_ar: subscription.name_ar,
                name_en: subscription.name_en,
                price: subscription.price,
                features: JSON.parse(subscription.features || '[]'),
                limits: JSON.parse(subscription.limits || '{}'),
                current_period_end: subscription.current_period_end,
                cancel_at_period_end: subscription.cancel_at_period_end,
                has_stripe: !!subscription.stripe_customer_id,
            },
            payments,
        });

    } catch (error: any) {
        console.error('Subscription status error:', error);
        return NextResponse.json({ message: 'حدث خطأ في جلب حالة الاشتراك' }, { status: 500 });
    }
}
