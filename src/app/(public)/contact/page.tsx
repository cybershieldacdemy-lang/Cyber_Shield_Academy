"use client";
import { useState } from "react";
import Link from "next/link";

const contactMethods = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        ),
        title: "واتساب",
        value: "+967778999706",
        desc: "تواصل مباشر عبر واتساب",
        color: "#25d366",
        href: "https://wa.me/967778999706",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8962e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        ),
        title: "البريد الإلكتروني",
        value: "cybershieldacademy@gmail.com",
        desc: "نرد خلال 24 ساعة",
        color: "#c8962e",
        href: "mailto:cybershieldacademy@gmail.com",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38b2ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        ),
        title: "الدعم المباشر",
        value: "متاح يومياً",
        desc: "من 9 صباحاً - 5 مساءً",
        color: "#38b2ac",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#805ad5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </svg>
        ),
        title: "تويتر / X",
        value: "@CyberShieldAR",
        desc: "تابعنا للأخبار والتحديثات",
        color: "#805ad5",
    },
];

const supportTopics = [
    { value: "", label: "اختر موضوع الرسالة" },
    { value: "general", label: "استفسار عام" },
    { value: "courses", label: "الدورات التدريبية" },
    { value: "technical", label: "مشكلة تقنية" },
    { value: "partnership", label: "شراكة أو تعاون" },
    { value: "suggestion", label: "اقتراح أو ملاحظة" },
    { value: "other", label: "أخرى" },
];

const faqs = [
    {
        q: "كيف يمكنني التسجيل في الدورات؟",
        a: "يمكنك إنشاء حساب مجاني والتسجيل في الدورات مباشرة من صفحة الدورات التدريبية.",
    },
    {
        q: "هل الدورات مجانية؟",
        a: "نعم، معظم المحتوى التعليمي مجاني. بعض الدورات المتقدمة قد تتطلب اشتراكاً مدفوعاً.",
    },
    {
        q: "هل أحصل على شهادة بعد إتمام الدورة؟",
        a: "نعم، ستحصل على شهادة إتمام معتمدة بعد إكمال متطلبات كل دورة بنجاح.",
    },
    {
        q: "ما هي المتطلبات المسبقة للتعلم؟",
        a: "لا يشترط خبرة سابقة للمستوى المبتدئ، لكن بعض الدورات المتقدمة تتطلب معرفة أساسية.",
    },
    {
        q: "كيف أتواصل مع فريق الدعم؟",
        a: "يمكنك مراسلتنا عبر النموذج أدناه أو البريد الإلكتروني وسنرد خلال 24 ساعة.",
    },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [statusMsg, setStatusMsg] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setStatusMsg(data.message);
                setForm({ name: "", email: "", subject: "", message: "" });
            } else {
                setStatus("error");
                setStatusMsg(data.message);
            }
        } catch {
            setStatus("error");
            setStatusMsg("حدث خطأ في الاتصال بالخادم");
        }
    };

    const inputClasses = "w-full px-5 py-3.5 rounded-xl outline-none transition-all duration-300 text-sm";
    const inputStyle = {
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(200,150,46,0.12)',
        color: '#1a1612',
    };
    const inputFocusStyle = {
        borderColor: 'rgba(200,150,46,0.4)',
        boxShadow: '0 0 0 3px rgba(200,150,46,0.08)',
    };

    return (
        <div style={{ paddingTop: "80px" }}>
            {/* Hero Header */}
            <div className="page-header" style={{ paddingBottom: '20px' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                    background: 'rgba(200, 150, 46, 0.08)',
                    border: '1px solid rgba(200, 150, 46, 0.15)',
                }}>
                    <span style={{ color: '#c8962e', fontSize: '0.85rem', fontWeight: 600 }}>✦ نسعد بتواصلكم معنا</span>
                </div>
                <h1>
                    تواصل <span className="gradient-text">معنا</span>
                </h1>
                <p>لديك سؤال أو اقتراح أو تحتاج مساعدة؟ فريقنا جاهز لمساعدتك في أي وقت</p>
            </div>

            {/* Contact Methods Cards */}
            <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                    {contactMethods.map((method, i) => (
                        <a
                            key={i}
                            href={method.href || '#'}
                            target={method.href ? '_blank' : undefined}
                            rel={method.href ? 'noopener noreferrer' : undefined}
                            className="glass-card p-7 text-center group block"
                            style={{ animationDelay: `${i * 0.1}s`, textDecoration: 'none' }}
                        >
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                                style={{
                                    background: `${method.color}12`,
                                    border: `1px solid ${method.color}25`,
                                }}
                            >
                                {method.icon}
                            </div>
                            <h3 className="font-bold text-base mb-1" style={{ color: '#1a1612' }}>
                                {method.title}
                            </h3>
                            <p className="text-sm font-semibold mb-1" style={{ color: method.color }} dir="ltr">
                                {method.value}
                            </p>
                            <p className="text-xs" style={{ color: '#7a7164' }}>
                                {method.desc}
                            </p>
                        </a>
                    ))}
                </div>
            </section>

            {/* Main Contact Section: Form + Map/Info */}
            <section className="section-container" style={{ paddingTop: '0', paddingBottom: '60px' }}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
                    {/* Contact Form - Takes 3 columns */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                                    background: 'linear-gradient(135deg, #c8962e, #e8c068)',
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: '#1a1612' }}>أرسل رسالتك</h2>
                                    <p className="text-xs" style={{ color: '#7a7164' }}>سنقوم بالرد في أقرب وقت ممكن</p>
                                </div>
                            </div>

                            {/* Status Messages */}
                            {status === "success" && (
                                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-up" style={{
                                    background: 'rgba(56,178,172,0.08)',
                                    border: '1px solid rgba(56,178,172,0.25)',
                                }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(56,178,172,0.15)' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2c7a7b" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <p className="text-sm font-medium" style={{ color: '#2c7a7b' }}>{statusMsg}</p>
                                </div>
                            )}
                            {status === "error" && (
                                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-up" style={{
                                    background: 'rgba(229,62,62,0.08)',
                                    border: '1px solid rgba(229,62,62,0.25)',
                                }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(229,62,62,0.15)' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </div>
                                    <p className="text-sm font-medium" style={{ color: '#e53e3e' }}>{statusMsg}</p>
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>
                                            الاسم الكامل
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className={inputClasses}
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                            placeholder="أدخل اسمك الكامل"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>
                                            البريد الإلكتروني
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className={inputClasses}
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                            placeholder="example@email.com"
                                            dir="ltr"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>
                                        موضوع الرسالة
                                    </label>
                                    <select
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className={inputClasses}
                                        style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                        required
                                    >
                                        {supportTopics.map((topic) => (
                                            <option key={topic.value} value={topic.value} disabled={topic.value === ""}>
                                                {topic.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>
                                        الرسالة
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        className={inputClasses + " resize-none"}
                                        style={inputStyle}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                        placeholder="اكتب رسالتك هنا بالتفصيل..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="btn-primary w-full justify-center text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontSize: '1rem' }}
                                >
                                    {status === "loading" ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeDashoffset="10" />
                                            </svg>
                                            جاري الإرسال...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 justify-center">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                            إرسال الرسالة
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Side Info - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Working Hours Card */}
                        <div className="glass-card p-7">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                                    background: 'rgba(56,178,172,0.1)',
                                    border: '1px solid rgba(56,178,172,0.2)',
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38b2ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-base" style={{ color: '#1a1612' }}>ساعات العمل</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { day: "الأحد - الخميس", time: "9:00 ص - 5:00 م", active: true },
                                    { day: "الجمعة", time: "10:00 ص - 2:00 م", active: true },
                                    { day: "السبت", time: "مغلق", active: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{
                                        background: item.active ? 'rgba(56,178,172,0.04)' : 'rgba(229,62,62,0.04)',
                                    }}>
                                        <span className="text-sm font-medium" style={{ color: '#3d3730' }}>{item.day}</span>
                                        <span className="text-sm flex items-center gap-1.5" style={{ color: item.active ? '#2c7a7b' : '#e53e3e' }} dir="ltr">
                                            <span className="w-2 h-2 rounded-full" style={{ background: item.active ? '#38b2ac' : '#e53e3e' }} />
                                            {item.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Response Card */}
                        <div className="glass-card p-7">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                                    background: 'rgba(200,150,46,0.1)',
                                    border: '1px solid rgba(200,150,46,0.2)',
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8962e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-base" style={{ color: '#1a1612' }}>استجابة سريعة</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "وقت الرد المتوسط", value: "أقل من 24 ساعة", icon: "⚡" },
                                    { label: "نسبة الرضا", value: "98%", icon: "⭐" },
                                    { label: "رسائل مجابة هذا الشهر", value: "+250", icon: "✉️" },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-lg">{stat.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-xs" style={{ color: '#7a7164' }}>{stat.label}</p>
                                            <p className="text-sm font-bold" style={{ color: '#1a1612' }}>{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="glass-card p-7">
                            <h3 className="font-bold text-base mb-4" style={{ color: '#1a1612' }}>تابعنا على</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { name: "تويتر / X", handle: "@CyberShieldAR", color: "#1a1612", icon: "𝕏", url: "https://x.com/CyberShieldAR" },
                                    { name: "يوتيوب", handle: "CyberShield", color: "#e53e3e", icon: "▶", url: "https://youtube.com/@CyberShield" },
                                    { name: "جيتهب", handle: "cybershield", color: "#333", icon: "◈", url: "https://github.com/cybershield" },
                                    { name: "لينكدإن", handle: "cybershield", color: "#0077b5", icon: "in", url: "https://linkedin.com/company/cybershield" },
                                ].map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
                                        style={{
                                            border: '1px solid rgba(200,150,46,0.1)',
                                            background: 'rgba(255,255,255,0.5)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = `${social.color}40`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(200,150,46,0.1)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                                            style={{ background: `${social.color}10`, color: social.color, border: `1px solid ${social.color}20` }}
                                        >
                                            {social.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold" style={{ color: '#1a1612' }}>{social.name}</p>
                                            <p className="text-xs" style={{ color: '#7a7164' }} dir="ltr">{social.handle}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="section-container" style={{ background: 'rgba(200, 150, 46, 0.02)', paddingTop: '60px', paddingBottom: '60px' }}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">
                        الأسئلة <span className="gradient-text">الشائعة</span>
                    </h2>
                    <p style={{ color: '#5c5549' }}>إجابات على الأسئلة الأكثر شيوعاً حول خدماتنا</p>
                </div>
                <div className="max-w-3xl mx-auto space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="glass-card overflow-hidden transition-all duration-300"
                            style={{
                                borderColor: openFaq === i ? 'rgba(200,150,46,0.3)' : undefined,
                            }}
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-5 text-right transition-all"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <span className="text-sm font-bold flex-1" style={{ color: '#1a1612' }}>
                                    {faq.q}
                                </span>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#c8962e"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        transition: 'transform 0.3s ease',
                                        transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                        flexShrink: 0,
                                        marginRight: '12px',
                                    }}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            <div
                                style={{
                                    maxHeight: openFaq === i ? '200px' : '0',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease, padding 0.3s ease',
                                    padding: openFaq === i ? '0 20px 20px' : '0 20px',
                                }}
                            >
                                <p className="text-sm leading-relaxed" style={{ color: '#5c5549' }}>
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-container text-center" style={{ paddingTop: '20px' }}>
                <div className="glass-card p-10 md:p-14 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'radial-gradient(rgba(200, 150, 46, 0.3) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }} />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            مستعد لبدء رحلتك في <span className="gradient-text">الأمن السيبراني</span>؟
                        </h2>
                        <p className="mb-8 max-w-xl mx-auto" style={{ color: '#5c5549' }}>
                            انضم إلى آلاف المتعلمين واكتشف عالم الأمن السيبراني مع أفضل المحتوى التعليمي العربي
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/register" className="btn-primary text-base px-8 py-3.5">
                                🎓 سجل مجاناً الآن
                            </Link>
                            <Link href="/courses" className="btn-secondary text-base px-8 py-3.5">
                                استعرض الدورات
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════ */
/* 📱 Floating Quick Contact Buttons                          */
/* ═══════════════════════════════════════════════════════════ */
function _FloatingContactButtons() {
    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 50,
        }}>
            {/* WhatsApp Button */}
            <a
                href="https://wa.me/967778999706"
                target="_blank"
                rel="noopener noreferrer"
                title="تواصل عبر واتساب"
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(37,211,102,0.4)'; }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            </a>

            {/* Email Button */}
            <a
                href="mailto:cybershieldacademy@gmail.com"
                title="أرسل بريد إلكتروني"
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c8962e, #e8c068)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(200,150,46,0.4)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,150,46,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(200,150,46,0.4)'; }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
            </a>
        </div>
    );
}
