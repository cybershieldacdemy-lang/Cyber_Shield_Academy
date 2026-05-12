import { NextResponse } from 'next/server';
import stripe, { activateSubscription, recordPayment } from '@/lib/stripe';
import db from '@/lib/db';
import { logAudit } from '@/lib/data-protection';
import { sendNotificationEmail } from '@/lib/mailer';

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            // ═══════════════════════════════════════════
            // ✅ Checkout completed — activate subscription
            // ═══════════════════════════════════════════
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const userId = session.metadata?.userId;
                const planId = session.metadata?.planId;

                if (userId && planId && session.subscription) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

                    const subId = activateSubscription(
                        userId,
                        planId,
                        stripeSubscription.id,
                        session.customer as string,
                        new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
                        new Date((stripeSubscription as any).current_period_end * 1000).toISOString()
                    );

                    // Get user email for notification
                    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(userId) as any;
                    const plan = db.prepare('SELECT name_ar FROM plans WHERE id = ?').get(planId) as any;

                    if (user) {
                        sendNotificationEmail(user.email, {
                            subject: `🎉 تم تفعيل اشتراكك — باقة ${plan?.name_ar || planId}`,
                            title: `مرحباً ${user.name}! تم تفعيل اشتراكك بنجاح 🎉`,
                            body: `<p>تم تفعيل باقة <strong>${plan?.name_ar || planId}</strong> على حسابك في أكاديمية الدرع السيبراني.</p><p>يمكنك الآن الاستفادة من جميع مميزات باقتك الجديدة.</p>`,
                            ctaText: 'انتقل للوحة التحكم',
                            ctaLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                        }).catch(console.error);
                    }

                    logAudit({
                        action: 'SUBSCRIPTION_ACTIVATED',
                        userId,
                        ip: '0.0.0.0',
                        userAgent: 'Stripe Webhook',
                        details: `تم تفعيل اشتراك ${planId} — Stripe Sub: ${stripeSubscription.id}`,
                        severity: 'high'
                    });
                }
                break;
            }

            // ═══════════════════════════════════════════
            // 💰 Payment succeeded — log it
            // ═══════════════════════════════════════════
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                const subId = invoice.subscription;

                if (subId) {
                    const sub = db.prepare('SELECT id, user_id, plan_id FROM subscriptions WHERE stripe_subscription_id = ?').get(subId) as any;
                    if (sub) {
                        recordPayment(
                            sub.user_id,
                            sub.id,
                            invoice.payment_intent || '',
                            (invoice.amount_paid || 0) / 100,
                            invoice.currency || 'usd',
                            'succeeded'
                        );

                        // Update period dates
                        if (invoice.lines?.data?.[0]) {
                            const line = invoice.lines.data[0];
                            db.prepare(`
                                UPDATE subscriptions SET 
                                    current_period_start = ?, current_period_end = ?, status = 'active', updated_at = CURRENT_TIMESTAMP 
                                WHERE stripe_subscription_id = ?
                            `).run(
                                new Date(line.period.start * 1000).toISOString(),
                                new Date(line.period.end * 1000).toISOString(),
                                subId
                            );
                        }

                        logAudit({
                            action: 'PAYMENT_SUCCEEDED',
                            userId: sub.user_id,
                            ip: '0.0.0.0',
                            userAgent: 'Stripe Webhook',
                            details: `دفع ناجح — $${(invoice.amount_paid || 0) / 100} ${invoice.currency}`,
                            severity: 'medium'
                        });
                    }
                }
                break;
            }

            // ═══════════════════════════════════════════
            // ❌ Payment failed
            // ═══════════════════════════════════════════
            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const subId = invoice.subscription;

                if (subId) {
                    const sub = db.prepare('SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = ?').get(subId) as any;
                    if (sub) {
                        db.prepare('UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('past_due', sub.id);

                        recordPayment(sub.user_id, sub.id, invoice.payment_intent || '', (invoice.amount_due || 0) / 100, invoice.currency || 'usd', 'failed');

                        const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(sub.user_id) as any;
                        if (user) {
                            sendNotificationEmail(user.email, {
                                subject: '⚠️ فشل الدفع — أكاديمية الدرع السيبراني',
                                title: `تنبيه: فشل الدفع`,
                                body: `<p>مرحباً ${user.name}،</p><p>لم نتمكن من تحصيل المبلغ المطلوب لتجديد اشتراكك. يرجى تحديث معلومات الدفع لتجنب إلغاء الاشتراك.</p>`,
                                ctaText: 'تحديث معلومات الدفع',
                                ctaLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                            }).catch(console.error);
                        }

                        logAudit({
                            action: 'PAYMENT_FAILED',
                            userId: sub.user_id,
                            ip: '0.0.0.0',
                            userAgent: 'Stripe Webhook',
                            details: `فشل الدفع — $${(invoice.amount_due || 0) / 100}`,
                            severity: 'high'
                        });
                    }
                }
                break;
            }

            // ═══════════════════════════════════════════
            // 🔄 Subscription updated
            // ═══════════════════════════════════════════
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                const sub = db.prepare('SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = ?').get(subscription.id) as any;

                if (sub) {
                    const newStatus = subscription.cancel_at_period_end ? 'active' : subscription.status === 'active' ? 'active' : subscription.status;
                    db.prepare(`
                        UPDATE subscriptions SET status = ?, cancel_at_period_end = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
                    `).run(newStatus, subscription.cancel_at_period_end ? 1 : 0, sub.id);
                }
                break;
            }

            // ═══════════════════════════════════════════
            // 🗑️ Subscription deleted/canceled
            // ═══════════════════════════════════════════
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const sub = db.prepare('SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = ?').get(subscription.id) as any;

                if (sub) {
                    db.prepare('UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('canceled', sub.id);

                    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(sub.user_id) as any;
                    if (user) {
                        sendNotificationEmail(user.email, {
                            subject: '📋 تم إلغاء اشتراكك — أكاديمية الدرع السيبراني',
                            title: `تم إلغاء اشتراكك`,
                            body: `<p>مرحباً ${user.name}،</p><p>تم إلغاء اشتراكك بنجاح. ستتمكن من الاستمرار في استخدام الباقة المجانية.</p><p>يمكنك إعادة الاشتراك في أي وقت.</p>`,
                            ctaText: 'عرض الباقات',
                            ctaLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
                        }).catch(console.error);
                    }

                    logAudit({
                        action: 'SUBSCRIPTION_CANCELED',
                        userId: sub.user_id,
                        ip: '0.0.0.0',
                        userAgent: 'Stripe Webhook',
                        details: `تم إلغاء الاشتراك — Stripe Sub: ${subscription.id}`,
                        severity: 'high'
                    });
                }
                break;
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
