import Stripe from 'stripe';
import db from '@/lib/db';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════
// 💳 STRIPE SERVICE — خدمة الدفع والاشتراكات
// ═══════════════════════════════════════════════════════════

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-04-30.basil' as any,
});

export default stripe;

// ═══════════════════════════════════════════════════════════
// 📋 PLAN DEFINITIONS — تعريفات الباقات
// ═══════════════════════════════════════════════════════════

export const PLAN_HIERARCHY: Record<string, number> = {
    free: 0,
    pro: 1,
    enterprise: 2,
};

export function seedPlans() {
    const plans = [
        {
            id: 'free',
            name_ar: 'مجاني',
            name_en: 'Free',
            price: 0,
            stripe_price_id: '',
            features: JSON.stringify([
                'الوصول للدورات الأساسية',
                'قاموس 500+ مصطلح سيبراني',
                'مقالات ونصائح أمنية',
                '3 مختبرات تجريبية شهرياً',
                'شهادات إتمام أساسية',
            ]),
            limits: JSON.stringify({ labs_per_month: 3, advanced_courses: false, ctf_weekly: false, support: 'community' }),
        },
        {
            id: 'pro',
            name_ar: 'احترافي',
            name_en: 'Pro',
            price: 49,
            stripe_price_id: process.env.STRIPE_PRO_PRICE_ID || '',
            features: JSON.stringify([
                'جميع مميزات الباقة المجانية',
                'الدورات المتقدمة والمتخصصة',
                '25 مختبر عملي شهرياً',
                'شهادات إتمام معتمدة',
                'مسارات تعلم مخصصة',
                'دعم فني عبر البريد',
                'تحديات CTF أسبوعية',
            ]),
            limits: JSON.stringify({ labs_per_month: 25, advanced_courses: true, ctf_weekly: true, support: 'email' }),
        },
        {
            id: 'enterprise',
            name_ar: 'مؤسسي',
            name_en: 'Enterprise',
            price: 199,
            stripe_price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
            features: JSON.stringify([
                'جميع مميزات الباقة الاحترافية',
                'مختبرات عملية غير محدودة',
                'جلسات إرشاد شخصية',
                'لوحة تحكم إدارية للفريق',
                'تقارير تقدم الموظفين',
                'دعم فني مباشر 24/7',
                'محتوى مخصص للمؤسسة',
                'API للتكامل مع أنظمتكم',
                'حتى 50 مستخدم',
            ]),
            limits: JSON.stringify({ labs_per_month: -1, advanced_courses: true, ctf_weekly: true, support: '24/7' }),
        },
    ];

    const upsert = db.prepare(`
        INSERT INTO plans (id, name_ar, name_en, price, stripe_price_id, features, limits)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name_ar = excluded.name_ar,
            name_en = excluded.name_en,
            price = excluded.price,
            stripe_price_id = excluded.stripe_price_id,
            features = excluded.features,
            limits = excluded.limits
    `);

    for (const plan of plans) {
        upsert.run(plan.id, plan.name_ar, plan.name_en, plan.price, plan.stripe_price_id, plan.features, plan.limits);
    }
}

// Seed plans on import
seedPlans();

// ═══════════════════════════════════════════════════════════
// 👤 CUSTOMER MANAGEMENT — إدارة العملاء
// ═══════════════════════════════════════════════════════════

export async function getOrCreateStripeCustomer(user: { id: string; email: string; name: string }): Promise<string> {
    // Check if user already has a Stripe customer ID
    const sub = db.prepare('SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? AND stripe_customer_id != ""').get(user.id) as { stripe_customer_id: string } | undefined;

    if (sub?.stripe_customer_id) {
        return sub.stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
    });

    return customer.id;
}

// ═══════════════════════════════════════════════════════════
// 🛒 CHECKOUT SESSION — إنشاء جلسة دفع
// ═══════════════════════════════════════════════════════════

export async function createCheckoutSession(user: { id: string; email: string; name: string }, planId: string): Promise<string> {
    const plan = db.prepare('SELECT * FROM plans WHERE id = ? AND is_active = 1').get(planId) as any;
    if (!plan) throw new Error('الباقة غير موجودة');
    if (plan.price === 0) throw new Error('الباقة المجانية لا تحتاج للدفع');
    if (!plan.stripe_price_id) throw new Error('الباقة غير مربوطة بـ Stripe بعد');

    const customerId = await getOrCreateStripeCustomer(user);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
        success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/checkout/cancel`,
        metadata: {
            userId: user.id,
            planId: planId,
        },
        subscription_data: {
            metadata: {
                userId: user.id,
                planId: planId,
            },
        },
    });

    return session.url || '';
}

// ═══════════════════════════════════════════════════════════
// 🔧 CUSTOMER PORTAL — بوابة إدارة الاشتراك
// ═══════════════════════════════════════════════════════════

export async function createCustomerPortalSession(customerId: string): Promise<string> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/dashboard`,
    });

    return session.url;
}

// ═══════════════════════════════════════════════════════════
// ❌ CANCEL SUBSCRIPTION — إلغاء الاشتراك
// ═══════════════════════════════════════════════════════════

export async function cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
    });
}

// ═══════════════════════════════════════════════════════════
// 📊 SUBSCRIPTION HELPERS — دوال مساعدة
// ═══════════════════════════════════════════════════════════

export function getUserSubscription(userId: string) {
    const sub = db.prepare(`
        SELECT s.*, p.name_ar, p.name_en, p.price, p.features, p.limits
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = ? AND s.status IN ('active', 'past_due')
        ORDER BY s.created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!sub) {
        // Return default free plan
        const freePlan = db.prepare('SELECT * FROM plans WHERE id = ?').get('free') as any;
        return {
            plan_id: 'free',
            status: 'active',
            name_ar: freePlan?.name_ar || 'مجاني',
            name_en: freePlan?.name_en || 'Free',
            price: 0,
            features: freePlan?.features || '[]',
            limits: freePlan?.limits || '{}',
            stripe_subscription_id: '',
            stripe_customer_id: '',
            current_period_end: null,
            cancel_at_period_end: 0,
        };
    }

    return sub;
}

export function getUserPayments(userId: string, limit = 10) {
    return db.prepare(`
        SELECT p.*, pl.name_ar as plan_name
        FROM payments p
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        LEFT JOIN plans pl ON s.plan_id = pl.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC LIMIT ?
    `).all(userId, limit);
}

export function activateSubscription(userId: string, planId: string, stripeSubId: string, stripeCustomerId: string, periodStart: string, periodEnd: string) {
    const id = crypto.randomUUID();

    // Deactivate any existing subscriptions
    db.prepare('UPDATE subscriptions SET status = ? WHERE user_id = ? AND status = ?').run('replaced', userId, 'active');

    // Create new subscription
    db.prepare(`
        INSERT INTO subscriptions (id, user_id, plan_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end)
        VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(id, userId, planId, stripeSubId, stripeCustomerId, periodStart, periodEnd);

    return id;
}

export function recordPayment(userId: string, subscriptionId: string, stripePaymentIntentId: string, amount: number, currency: string, status: string) {
    const id = crypto.randomUUID();
    db.prepare(`
        INSERT INTO payments (id, user_id, subscription_id, stripe_payment_intent_id, amount, currency, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, subscriptionId, stripePaymentIntentId, amount, currency, status);
    return id;
}
