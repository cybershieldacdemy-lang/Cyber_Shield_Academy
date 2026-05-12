import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { getAuthUser } from '@/lib/api-guard';
import { createCustomerPortalSession, getUserSubscription } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
        }

        const subscription = getUserSubscription(user.id);
        if (!subscription.stripe_customer_id) {
            return NextResponse.json({ message: 'لا يوجد اشتراك مدفوع لإدارته' }, { status: 400 });
        }

        const portalUrl = await createCustomerPortalSession(subscription.stripe_customer_id);
        return NextResponse.json({ url: portalUrl });

    } catch (error: any) {
        console.error('Portal error:', error);
        return NextResponse.json({ message: 'حدث خطأ في فتح بوابة الإدارة' }, { status: 500 });
    }
}
