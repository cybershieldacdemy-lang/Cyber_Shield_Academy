"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface SubscriptionData {
    plan_id: string;
    status: string;
    name_ar: string;
    name_en: string;
    price: number;
    features: string[];
    limits: any;
    current_period_end: string | null;
    cancel_at_period_end: number;
    has_stripe: boolean;
}

interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    plan_name: string;
}

const planColors: Record<string, string> = {
    free: '#38b2ac',
    pro: '#c8962e',
    enterprise: '#805ad5',
};

const planIcons: Record<string, string> = {
    free: '🆓',
    pro: '⭐',
    enterprise: '🏢',
};

export default function SubscriptionManager() {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("/api/subscription/status", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.subscription) setSubscription(data.subscription);
                if (data.payments) setPayments(data.payments);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const openPortal = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setPortalLoading(true);
        try {
            const res = await fetch("/api/subscription/portal", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert(data.message || "خطأ");
        } catch {
            alert("حدث خطأ");
        } finally {
            setPortalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#c8962e', borderTopColor: 'transparent' }} />
                <p style={{ color: '#7a7164' }}>جاري تحميل بيانات الاشتراك...</p>
            </div>
        );
    }

    if (!subscription) return null;

    const color = planColors[subscription.plan_id] || '#c8962e';
    const icon = planIcons[subscription.plan_id] || '📋';
    const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

    return (
        <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-3 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)`, borderBottom: `1px solid ${color}30` }}>
                    <h3 className="font-bold text-sm" style={{ color }}>💳 الاشتراك الحالي</h3>
                    {subscription.cancel_at_period_end === 1 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500 font-bold">سيُلغى</span>
                    )}
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                            {icon}
                        </div>
                        <div>
                            <h4 className="text-xl font-black" style={{ color: '#1a1612' }}>
                                باقة {subscription.name_ar}
                            </h4>
                            <p className="text-sm" style={{ color: '#7a7164' }}>
                                {subscription.price > 0 ? `$${subscription.price}/شهرياً` : 'مجاني'}
                                {periodEnd && ` • يجدد في ${periodEnd}`}
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                        {subscription.features.slice(0, 6).map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#3d3730' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {f}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        {subscription.plan_id === 'free' ? (
                            <Link href="/pricing" className="btn-primary px-6 py-2.5 text-sm">
                                ترقية الباقة ⬆️
                            </Link>
                        ) : (
                            <>
                                {subscription.has_stripe && (
                                    <button
                                        onClick={openPortal}
                                        disabled={portalLoading}
                                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                        style={{ background: 'rgba(200,150,46,0.08)', color: '#c8962e', border: '1px solid rgba(200,150,46,0.2)' }}
                                    >
                                        {portalLoading ? (
                                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : '⚙️'}
                                        إدارة الاشتراك
                                    </button>
                                )}
                                <Link href="/pricing" className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all" style={{ background: 'rgba(200,150,46,0.04)', color: '#7a7164', border: '1px solid rgba(200,150,46,0.1)' }}>
                                    تغيير الباقة
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-3" style={{ borderBottom: '1px solid rgba(200,150,46,0.1)' }}>
                        <h3 className="font-bold text-sm" style={{ color: '#3d3730' }}>📋 سجل المدفوعات</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'rgba(200,150,46,0.06)' }}>
                        {payments.map(p => (
                            <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold" style={{ color: '#1a1612' }}>{p.plan_name || 'اشتراك'}</p>
                                    <p className="text-xs" style={{ color: '#7a7164' }}>
                                        {new Date(p.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black" style={{ color: '#1a1612' }}>${p.amount}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.status === 'succeeded' ? 'bg-green-500/10 text-green-600' : p.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
                                        {p.status === 'succeeded' ? 'ناجح' : p.status === 'failed' ? 'فاشل' : 'معلّق'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
