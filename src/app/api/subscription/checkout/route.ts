import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { createCheckoutSession } from '@/lib/stripe';
import { logAudit } from '@/lib/data-protection';
import { getRequestIP } from '@/lib/api-guard';

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
        }

        const { planId } = await request.json();
        if (!planId || planId === 'free') {
            return NextResponse.json({ message: 'الباقة غير صالحة' }, { status: 400 });
        }

        const ip = getRequestIP(request);

        const checkoutUrl = await createCheckoutSession(
            { id: user.id, email: user.email, name: user.name as string },
            planId
        );

        logAudit({
            action: 'CHECKOUT_SESSION_CREATED',
            userId: user.id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            details: `تم إنشاء جلسة دفع للباقة: ${planId}`,
            severity: 'medium'
        });

        return NextResponse.json({ url: checkoutUrl });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ message: error.message || 'حدث خطأ أثناء إنشاء جلسة الدفع' }, { status: 500 });
    }
}
