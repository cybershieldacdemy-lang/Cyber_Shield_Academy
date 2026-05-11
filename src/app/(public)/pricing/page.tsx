"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const plans = [
    {
        id: "free",
        name: "مجاني",
        nameEn: "Free",
        price: "0",
        period: "/ شهرياً",
        desc: "ابدأ رحلتك في تعلم الأمن السيبراني مجاناً",
        color: "#38b2ac",
        popular: false,
        features: [
            { text: "الوصول للدورات الأساسية", included: true },
            { text: "قاموس 500+ مصطلح سيبراني", included: true },
            { text: "مقالات ونصائح أمنية", included: true },
            { text: "3 مختبرات تجريبية شهرياً", included: true },
            { text: "شهادات إتمام أساسية", included: true },
            { text: "الدورات المتقدمة", included: false },
            { text: "مختبرات عملية غير محدودة", included: false },
            { text: "دعم فني مباشر", included: false },
            { text: "مسارات تعلم مخصصة", included: false },
        ],
        cta: "ابدأ مجاناً",
    },
    {
        id: "pro",
        name: "احترافي",
        nameEn: "Pro",
        price: "49",
        period: "/ شهرياً",
        desc: "للمتعلمين الجادين الراغبين في التعمق والاحتراف",
        color: "#c8962e",
        popular: true,
        features: [
            { text: "جميع مميزات الباقة المجانية", included: true },
            { text: "الدورات المتقدمة والمتخصصة", included: true },
            { text: "25 مختبر عملي شهرياً", included: true },
            { text: "شهادات إتمام معتمدة", included: true },
            { text: "مسارات تعلم مخصصة", included: true },
            { text: "دعم فني عبر البريد", included: true },
            { text: "تحديات CTF أسبوعية", included: true },
            { text: "مختبرات غير محدودة", included: false },
            { text: "جلسات إرشاد شخصية", included: false },
        ],
        cta: "اشترك الآن",
    },
    {
        id: "enterprise",
        name: "مؤسسي",
        nameEn: "Enterprise",
        price: "199",
        period: "/ شهرياً",
        desc: "للفرق والمؤسسات التي تسعى لتدريب موظفيها",
        color: "#805ad5",
        popular: false,
        features: [
            { text: "جميع مميزات الباقة الاحترافية", included: true },
            { text: "مختبرات عملية غير محدودة", included: true },
            { text: "جلسات إرشاد شخصية", included: true },
            { text: "لوحة تحكم إدارية للفريق", included: true },
            { text: "تقارير تقدم الموظفين", included: true },
            { text: "دعم فني مباشر 24/7", included: true },
            { text: "محتوى مخصص للمؤسسة", included: true },
            { text: "API للتكامل مع أنظمتكم", included: true },
            { text: "حتى 50 مستخدم", included: true },
        ],
        cta: "تواصل معنا",
    },
];

const comparisons = [
    { feature: "الدورات الأساسية", free: "✓", pro: "✓", enterprise: "✓" },
    { feature: "الدورات المتقدمة", free: "—", pro: "✓", enterprise: "✓" },
    { feature: "المختبرات العملية", free: "3/شهر", pro: "25/شهر", enterprise: "غير محدود" },
    { feature: "شهادات الإتمام", free: "أساسية", pro: "معتمدة", enterprise: "معتمدة" },
    { feature: "مسارات مخصصة", free: "—", pro: "✓", enterprise: "✓" },
    { feature: "تحديات CTF", free: "—", pro: "أسبوعية", enterprise: "يومية" },
    { feature: "الدعم الفني", free: "مجتمعي", pro: "بريد إلكتروني", enterprise: "مباشر 24/7" },
    { feature: "عدد المستخدمين", free: "1", pro: "1", enterprise: "حتى 50" },
    { feature: "تقارير التقدم", free: "أساسية", pro: "تفصيلية", enterprise: "مؤسسية" },
];

const guarantees = [
    { icon: "🔒", title: "ضمان استرداد المال", desc: "استرداد كامل خلال 30 يوماً بدون أسئلة" },
    { icon: "🔄", title: "إلغاء في أي وقت", desc: "يمكنك إلغاء اشتراكك في أي لحظة بكل سهولة" },
    { icon: "🛡️", title: "دفع آمن 100%", desc: "جميع المعاملات مشفرة ومحمية بأعلى معايير الأمان" },
    { icon: "📞", title: "دعم مستمر", desc: "فريق دعم متخصص لمساعدتك في أي استفسار" },
];

export default function PricingPage() {
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            fetch("/api/subscription/status", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.subscription) setCurrentPlan(data.subscription.plan_id);
                })
                .catch(() => {});
        }
    }, []);

    const handleSubscribe = async (planId: string) => {
        if (planId === "free") return;
        if (planId === "enterprise") {
            window.location.href = "/contact";
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/register";
            return;
        }

        setLoadingPlan(planId);
        try {
            const res = await fetch("/api/subscription/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ planId }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.message || "حدث خطأ أثناء إنشاء جلسة الدفع");
            }
        } catch {
            alert("حدث خطأ في الاتصال");
        } finally {
            setLoadingPlan(null);
        }
    };

    const getButtonContent = (plan: typeof plans[0]) => {
        if (currentPlan === plan.id) return { text: "✓ باقتك الحالية", disabled: true };
        if (plan.id === "free" && !isLoggedIn) return { text: "ابدأ مجاناً", disabled: false };
        if (plan.id === "free") return { text: "الباقة المجانية", disabled: true };
        if (loadingPlan === plan.id) return { text: "جاري التوجيه...", disabled: true };
        return { text: plan.cta, disabled: false };
    };

    return (
        <div style={{ paddingTop: "80px" }}>
            {/* Header */}
            <div className="page-header">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                    background: 'rgba(200, 150, 46, 0.08)',
                    border: '1px solid rgba(200, 150, 46, 0.15)',
                }}>
                    <span style={{ color: '#c8962e', fontSize: '0.85rem', fontWeight: 600 }}>✦ خطط تناسب الجميع</span>
                </div>
                <h1>
                    خطط <span className="gradient-text">الأسعار</span>
                </h1>
                <p>اختر الخطة المناسبة لك وابدأ رحلتك في تعلم الأمن السيبراني</p>
            </div>

            {/* Pricing Cards */}
            <section className="section-container" style={{ paddingTop: '20px' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
                    {plans.map((plan, i) => {
                        const btn = getButtonContent(plan);
                        return (
                            <div
                                key={i}
                                className="glass-card overflow-hidden relative flex flex-col"
                                style={{
                                    borderColor: plan.popular ? 'rgba(200,150,46,0.4)' : undefined,
                                    boxShadow: plan.popular ? '0 8px 40px rgba(200,150,46,0.12)' : undefined,
                                    transform: plan.popular ? 'scale(1.03)' : undefined,
                                }}
                            >
                                {plan.popular && (
                                    <div className="text-center py-2 text-xs font-bold text-white" style={{
                                        background: 'linear-gradient(135deg, #c8962e, #e8c068)',
                                    }}>
                                        ⭐ الأكثر شعبية
                                    </div>
                                )}
                                {currentPlan === plan.id && (
                                    <div className="text-center py-2 text-xs font-bold text-white" style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                    }}>
                                        ✓ باقتك الحالية
                                    </div>
                                )}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold mb-1" style={{ color: '#1a1612' }}>{plan.name}</h3>
                                        <p className="text-xs font-mono mb-4" style={{ color: '#7a7164' }} dir="ltr">{plan.nameEn}</p>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-black" style={{ color: plan.color }}>${plan.price}</span>
                                            <span className="text-sm" style={{ color: '#7a7164' }}>{plan.period}</span>
                                        </div>
                                        <p className="text-xs mt-3" style={{ color: '#5c5549' }}>{plan.desc}</p>
                                    </div>

                                    <div className="space-y-3 flex-1 mb-8">
                                        {plan.features.map((f, j) => (
                                            <div key={j} className="flex items-center gap-3">
                                                {f.included ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4cbb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                )}
                                                <span className="text-sm" style={{ color: f.included ? '#3d3730' : '#a89f8e' }}>
                                                    {f.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    {plan.id === "free" && !isLoggedIn ? (
                                        <Link href="/register" className="btn-secondary w-full justify-center py-4">
                                            {btn.text}
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={btn.disabled || loadingPlan === plan.id}
                                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${btn.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            style={{
                                                background: btn.disabled
                                                    ? 'rgba(200,150,46,0.1)'
                                                    : plan.popular
                                                        ? 'linear-gradient(135deg, #c8962e, #e8c068)'
                                                        : 'rgba(200,150,46,0.08)',
                                                color: btn.disabled ? '#a89f8e' : plan.popular ? '#fff' : '#c8962e',
                                                border: `1px solid rgba(200,150,46,${plan.popular ? '0' : '0.2'})`,
                                            }}
                                        >
                                            {loadingPlan === plan.id && (
                                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            )}
                                            {btn.text}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Comparison Table */}
            <section className="section-container" style={{ background: 'rgba(200, 150, 46, 0.02)' }}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">
                        مقارنة <span className="gradient-text">تفصيلية</span>
                    </h2>
                    <p style={{ color: '#5c5549' }}>قارن بين الخطط واختر ما يناسب احتياجاتك</p>
                </div>
                <div className="max-w-5xl mx-auto glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(200,150,46,0.15)' }}>
                                    <th className="text-right p-5 text-sm font-bold" style={{ color: '#1a1612' }}>الميزة</th>
                                    <th className="p-5 text-center text-sm font-bold" style={{ color: '#38b2ac' }}>مجاني</th>
                                    <th className="p-5 text-center text-sm font-bold" style={{ color: '#c8962e', background: 'rgba(200,150,46,0.04)' }}>احترافي</th>
                                    <th className="p-5 text-center text-sm font-bold" style={{ color: '#805ad5' }}>مؤسسي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisons.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(200,150,46,0.08)' }}>
                                        <td className="p-4 text-sm font-medium" style={{ color: '#3d3730' }}>{row.feature}</td>
                                        <td className="p-4 text-center text-sm" style={{ color: row.free === "✓" ? '#38b2ac' : row.free === "—" ? '#d4cbb8' : '#5c5549' }}>{row.free}</td>
                                        <td className="p-4 text-center text-sm" style={{ color: row.pro === "✓" ? '#c8962e' : '#5c5549', background: 'rgba(200,150,46,0.04)' }}>{row.pro}</td>
                                        <td className="p-4 text-center text-sm" style={{ color: row.enterprise === "✓" ? '#805ad5' : '#5c5549' }}>{row.enterprise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Guarantees */}
            <section className="section-container">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                    {guarantees.map((g, i) => (
                        <div key={i} className="glass-card p-6 text-center group">
                            <div className="text-3xl mb-3">{g.icon}</div>
                            <h3 className="font-bold text-sm mb-2" style={{ color: '#1a1612' }}>{g.title}</h3>
                            <p className="text-xs leading-relaxed" style={{ color: '#5c5549' }}>{g.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="section-container text-center" style={{ paddingTop: '0' }}>
                <div className="glass-card p-10 md:p-14 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'radial-gradient(rgba(200, 150, 46, 0.3) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }} />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            لديك أسئلة حول <span className="gradient-text">الأسعار</span>؟
                        </h2>
                        <p className="mb-8 max-w-xl mx-auto" style={{ color: '#5c5549' }}>
                            تواصل مع فريقنا وسنساعدك في اختيار الخطة المناسبة لاحتياجاتك
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/contact" className="btn-primary px-8 py-3.5">تواصل معنا</Link>
                            <Link href="/register" className="btn-secondary px-8 py-3.5">سجل مجاناً</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
