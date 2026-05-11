"use client";
import { useState } from "react";
import Link from "next/link";

const specializations = [
    { value: "", label: "اختر تخصصك" },
    { value: "network-security", label: "أمن الشبكات" },
    { value: "app-security", label: "أمن التطبيقات" },
    { value: "info-security", label: "أمن المعلومات" },
    { value: "system-security", label: "أمن الأنظمة" },
    { value: "cloud-security", label: "الأمن السحابي" },
    { value: "penetration-testing", label: "اختبار الاختراق" },
    { value: "incident-response", label: "الاستجابة للحوادث" },
    { value: "malware-analysis", label: "تحليل البرمجيات الخبيثة" },
    { value: "digital-forensics", label: "التحقيق الرقمي" },
    { value: "cryptography", label: "التشفير" },
    { value: "soc-analyst", label: "محلل SOC" },
    { value: "other", label: "أخرى" },
];

export default function BecomeTeacherPage() {
    const [form, setForm] = useState({
        name: "", email: "", specialization: "", experience: "", cv_link: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [statusMsg, setStatusMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/teacher-applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setStatusMsg(data.message);
                setForm({ name: "", email: "", specialization: "", experience: "", cv_link: "" });
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
            {/* Hero */}
            <div className="page-header" style={{ paddingBottom: '20px' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                    background: 'rgba(200, 150, 46, 0.08)',
                    border: '1px solid rgba(200, 150, 46, 0.15)',
                }}>
                    <span style={{ color: '#c8962e', fontSize: '0.85rem', fontWeight: 600 }}>✦ شارك خبرتك مع الآخرين</span>
                </div>
                <h1>
                    انضم كـ<span className="gradient-text">مدرّب</span>
                </h1>
                <p>شارك خبرتك في الأمن السيبراني وساعد آلاف المتعلمين في رحلتهم التعليمية</p>
            </div>

            {/* Benefits */}
            <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    {[
                        { icon: "💰", title: "دخل إضافي", desc: "احصل على عوائد مالية من دوراتك التعليمية", color: "#c8962e" },
                        { icon: "🌍", title: "وصول عالمي", desc: "درّب آلاف الطلاب من مختلف أنحاء الوطن العربي", color: "#2da5c7" },
                        { icon: "📹", title: "جلسات مباشرة", desc: "قدّم دروساً حية عبر تقنية WebRTC المتقدمة", color: "#805ad5" },
                    ].map((item, i) => (
                        <div key={i} className="glass-card p-7 text-center group">
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <h3 className="font-bold text-base mb-2" style={{ color: '#1a1612' }}>{item.title}</h3>
                            <p className="text-sm" style={{ color: '#7a7164' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Application Form */}
            <section className="section-container" style={{ paddingTop: '0', paddingBottom: '80px' }}>
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                                background: 'linear-gradient(135deg, #c8962e, #e8c068)',
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: '#1a1612' }}>نموذج التقديم</h2>
                                <p className="text-xs" style={{ color: '#7a7164' }}>املأ البيانات وسنتواصل معك خلال 48 ساعة</p>
                            </div>
                        </div>

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
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>الاسم الكامل</label>
                                    <input
                                        type="text" value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className={inputClasses} style={inputStyle}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                        placeholder="أدخل اسمك الكامل" required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>البريد الإلكتروني</label>
                                    <input
                                        type="email" value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className={inputClasses} style={inputStyle}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                        placeholder="example@email.com" dir="ltr" required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>التخصص في الأمن السيبراني</label>
                                <select
                                    value={form.specialization}
                                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                                    className={inputClasses}
                                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                    required
                                >
                                    {specializations.map((s) => (
                                        <option key={s.value} value={s.value} disabled={s.value === ""}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>الخبرة والمؤهلات</label>
                                <textarea
                                    rows={4} value={form.experience}
                                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                    className={inputClasses + " resize-none"} style={inputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                    placeholder="اكتب عن خبرتك ومؤهلاتك في مجال الأمن السيبراني..." required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#3d3730' }}>رابط CV أو LinkedIn <span className="text-xs" style={{ color: '#a89f8e' }}>(اختياري)</span></label>
                                <input
                                    type="url" value={form.cv_link}
                                    onChange={(e) => setForm({ ...form, cv_link: e.target.value })}
                                    className={inputClasses} style={inputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(200,150,46,0.12)'; e.target.style.boxShadow = 'none'; }}
                                    placeholder="https://linkedin.com/in/your-profile" dir="ltr"
                                />
                            </div>

                            <button
                                type="submit" disabled={status === "loading"}
                                className="btn-primary w-full justify-center text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        👨‍🏫 إرسال طلب التقديم
                                    </span>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs mt-6" style={{ color: '#a89f8e' }}>
                            بالتقديم، أنت توافق على <Link href="/policies" className="underline hover:text-accent">سياسة الخصوصية</Link> الخاصة بنا
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
