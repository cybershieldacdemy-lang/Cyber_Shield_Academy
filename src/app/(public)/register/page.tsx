"use client";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// أنواع البيانات
// ═══════════════════════════════════════════════════════════
interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    country: string;
    bio: string;
    experience_level: string;
    account_type: string;
    security_question: string;
    security_answer: string;
    agreed: boolean;
}

const INITIAL_DATA: FormData = {
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", country: "", bio: "",
    experience_level: "beginner",
    account_type: "",
    security_question: "", security_answer: "",
    agreed: false,
};

const ACCOUNT_TYPES = [
    {
        val: "student", label: "طالب", icon: "🎓", color: "#c8962e",
        desc: "تعلّم أساسيات ومتقدمات الأمن السيبراني",
        features: ["الوصول للدورات التعليمية", "تتبع التقدم والشهادات", "المصطلحات والتمارين"],
    },
    {
        val: "instructor", label: "مدرّب", icon: "👨‍🏫", color: "#2da5c7",
        desc: "شارك خبرتك وعلّم الآخرين",
        features: ["إنشاء وإدارة الدورات", "متابعة أداء الطلاب", "نشر المقالات التعليمية"],
    },
    {
        val: "researcher", label: "باحث أمني", icon: "🔬", color: "#805ad5",
        desc: "اكتشف الثغرات وساهم في الأبحاث",
        features: ["نشر تقارير الثغرات", "الوصول لأدوات التحليل", "التعاون مع فريق البحث"],
    },
    {
        val: "analyst", label: "محلل سيبراني", icon: "📊", color: "#d69e2e",
        desc: "راقب التهديدات وحلّل البيانات الأمنية",
        features: ["لوحة مراقبة التهديدات", "تقارير الأمن الدورية", "أخبار الثغرات الأمنية"],
    },
];

const COUNTRIES = [
    "السعودية", "مصر", "الإمارات", "العراق", "المغرب", "الأردن",
    "الكويت", "قطر", "البحرين", "عمان", "تونس", "الجزائر",
    "ليبيا", "سوريا", "لبنان", "فلسطين", "اليمن", "السودان", "أخرى",
];

const SECURITY_QUESTIONS = [
    "ما هو اسم مدرستك الابتدائية؟",
    "ما هو اسم حيوانك الأليف الأول؟",
    "ما هي مدينة ميلادك؟",
    "ما هو اسم أفضل صديق في طفولتك؟",
    "ما هو كتابك المفضل؟",
    "ما هو الطعام المفضل لديك؟",
];

const STEPS = [
    { num: 1, title: "البيانات الأساسية", icon: "👤", desc: "الاسم والبريد وكلمة المرور" },
    { num: 2, title: "نوع الحساب", icon: "🏷️", desc: "اختر نوع حسابك والمعلومات الشخصية" },
    { num: 3, title: "الحماية والأمان", icon: "🔐", desc: "سؤال الأمان والتحقق" },
    { num: 4, title: "المراجعة والتأكيد", icon: "✅", desc: "مراجعة جميع البيانات" },
];

// ═══════════════════════════════════════════════════════════
// الصفحة الرئيسية
// ═══════════════════════════════════════════════════════════
export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(INITIAL_DATA);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const update = useCallback((field: keyof FormData, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError("");
    }, []);

    // ═══════════════════════════════════════════════════════
    // قوة كلمة المرور
    // ═══════════════════════════════════════════════════════
    const passwordStrength = useMemo(() => {
        const p = form.password;
        if (!p) return { score: 0, label: "", color: "" };
        let score = 0;
        if (p.length >= 8) score++;
        if (p.length >= 12) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[a-z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) score++;

        if (score <= 2) return { score, label: "ضعيفة 🔴", color: "#e53e3e" };
        if (score <= 4) return { score, label: "متوسطة 🟡", color: "#d69e2e" };
        return { score, label: "قوية 🟢", color: "#2c7a7b" };
    }, [form.password]);

    // ═══════════════════════════════════════════════════════
    // التحقق من كل خطوة
    // ═══════════════════════════════════════════════════════
    const validateStep = (s: number): boolean => {
        switch (s) {
            case 1:
                if (!form.name.trim()) { setError("الاسم الكامل مطلوب"); return false; }
                if (form.name.trim().length < 3) { setError("الاسم يجب أن يكون 3 أحرف على الأقل"); return false; }
                if (!form.email.trim()) { setError("البريد الإلكتروني مطلوب"); return false; }
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) { setError("البريد الإلكتروني غير صالح"); return false; }
                if (!form.password) { setError("كلمة المرور مطلوبة"); return false; }
                if (form.password.length < 8) { setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return false; }
                if (!/[A-Z]/.test(form.password)) { setError("يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل"); return false; }
                if (!/[a-z]/.test(form.password)) { setError("يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل"); return false; }
                if (!/[0-9]/.test(form.password)) { setError("يجب أن تحتوي كلمة المرور على رقم واحد على الأقل"); return false; }
                if (!/[^A-Za-z0-9]/.test(form.password)) { setError("يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (!@#$%...)"); return false; }
                if (form.password !== form.confirmPassword) { setError("كلمتا المرور غير متطابقتين"); return false; }
                return true;
            case 2:
                if (!form.account_type) { setError("يرجى اختيار نوع الحساب"); return false; }
                if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone)) { setError("رقم الهاتف غير صالح"); return false; }
                if (!form.country) { setError("يرجى اختيار الدولة"); return false; }
                return true;
            case 3:
                if (!form.security_question) { setError("يرجى اختيار سؤال الأمان"); return false; }
                if (!form.security_answer.trim()) { setError("يرجى إدخال جواب سؤال الأمان"); return false; }
                if (form.security_answer.trim().length < 3) { setError("جواب الأمان يجب أن يكون 3 أحرف على الأقل"); return false; }
                return true;
            case 4:
                if (!form.agreed) { setError("يرجى الموافقة على الشروط والأحكام"); return false; }
                return true;
            default: return true;
        }
    };

    const getAccountLabel = (val: string) => ACCOUNT_TYPES.find(a => a.val === val)?.label || val;
    const getAccountIcon = (val: string) => ACCOUNT_TYPES.find(a => a.val === val)?.icon || "";

    const nextStep = () => {
        if (validateStep(step)) {
            setError("");
            setStep(s => Math.min(s + 1, 4));
        }
    };

    const prevStep = () => {
        setError("");
        setStep(s => Math.max(s - 1, 1));
    };

    // ═══════════════════════════════════════════════════════
    // إرسال النموذج
    // ═══════════════════════════════════════════════════════
    const handleSubmit = async () => {
        if (!validateStep(4)) return;
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                    phone: form.phone.trim(),
                    country: form.country,
                    bio: form.bio.trim(),
                    experience_level: form.experience_level,
                    account_type: form.account_type,
                    security_question: form.security_question,
                    security_answer: form.security_answer.trim(),
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "حدث خطأ في إنشاء الحساب");
                return;
            }

            // Auto-login
            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
            });
            const loginData = await loginRes.json();

            if (loginRes.ok) {
                localStorage.setItem("token", loginData.token);
                localStorage.setItem("user", JSON.stringify(loginData.user));
                router.push("/dashboard");
                router.refresh();
            } else {
                router.push("/login");
            }
        } catch {
            setError("حدث خطأ في الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl text-cyber-100 placeholder-cyber-500 outline-none focus:ring-2 focus:ring-accent/30 transition-all";
    const inputStyle = { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(200,150,46,0.15)' };

    const activeColor = '#c8962e';
    const inactiveColor = '#a89f8e';

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh' }} className="flex items-center justify-center">
            <div className="w-full max-w-2xl mx-4 py-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🛡️</div>
                    <h1 className="text-2xl font-bold"><span className="gradient-text">إنشاء حساب آمن</span></h1>
                    <p className="text-cyber-400 text-sm mt-2">أكمل الخطوات التالية لإنشاء حسابك في أكاديمية الدرع السيبراني</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-0 mb-8 px-4">
                    {STEPS.map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 cursor-pointer"
                                    style={{
                                        background: step >= s.num
                                            ? 'linear-gradient(135deg, rgba(200,150,46,0.2), rgba(200,150,46,0.08))'
                                            : 'rgba(255,255,255,0.6)',
                                        border: step >= s.num
                                            ? '2px solid rgba(200,150,46,0.6)'
                                            : '2px solid rgba(200,150,46,0.15)',
                                        color: step >= s.num ? activeColor : inactiveColor,
                                        transform: step === s.num ? 'scale(1.1)' : 'scale(1)',
                                        boxShadow: step === s.num ? '0 0 20px rgba(200,150,46,0.2)' : 'none',
                                    }}
                                    onClick={() => { if (s.num < step) setStep(s.num); }}
                                >
                                    {step > s.num ? "✓" : s.icon}
                                </div>
                                <span className="text-[10px] mt-1 text-center whitespace-nowrap" style={{ color: step >= s.num ? activeColor : inactiveColor }}>
                                    {s.title}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className="w-10 sm:w-16 h-0.5 mx-1 rounded transition-all duration-300" style={{
                                    background: step > s.num ? activeColor : 'rgba(200,150,46,0.15)',
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl text-center text-sm flex items-center justify-center gap-2" style={{ background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', color: '#e53e3e' }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Form Card */}
                <div className="glass-card p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-cyber-100 flex items-center gap-2">
                            <span className="text-2xl">{STEPS[step - 1].icon}</span>
                            {STEPS[step - 1].title}
                        </h2>
                        <p className="text-cyber-500 text-sm mt-1">{STEPS[step - 1].desc}</p>
                    </div>

                    {/* ═══ Step 1: البيانات الأساسية ═══ */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">الاسم الكامل <span className="text-red-400">*</span></label>
                                <input type="text" value={form.name} onChange={e => update("name", e.target.value)}
                                    className={inputCls} style={inputStyle} placeholder="أدخل اسمك الكامل" required />
                                {form.name && form.name.length < 3 && <p className="text-xs text-amber-400 mt-1">⚠️ الاسم قصير جداً</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">البريد الإلكتروني <span className="text-red-400">*</span></label>
                                <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                                    className={inputCls} style={inputStyle} placeholder="example@email.com" dir="ltr" required />
                                {form.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email) && (
                                    <p className="text-xs text-red-400 mt-1">❌ البريد الإلكتروني غير صالح</p>
                                )}
                                {form.email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email) && (
                                    <p className="text-xs mt-1" style={{ color: '#2c7a7b' }}>✅ البريد الإلكتروني صالح</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">كلمة المرور <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)}
                                        className={inputCls} style={inputStyle} placeholder="••••••••" dir="ltr" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-500 hover:text-cyber-300 text-sm">
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                {form.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(200,150,46,0.1)' }}>
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${(passwordStrength.score / 6) * 100}%`, background: passwordStrength.color }} />
                                            </div>
                                            <span className="text-xs" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                                            <span style={{ color: form.password.length >= 8 ? '#2c7a7b' : inactiveColor }}>
                                                {form.password.length >= 8 ? '✅' : '⬜'} 8 أحرف على الأقل
                                            </span>
                                            <span style={{ color: /[A-Z]/.test(form.password) ? '#2c7a7b' : inactiveColor }}>
                                                {/[A-Z]/.test(form.password) ? '✅' : '⬜'} حرف كبير
                                            </span>
                                            <span style={{ color: /[a-z]/.test(form.password) ? '#2c7a7b' : inactiveColor }}>
                                                {/[a-z]/.test(form.password) ? '✅' : '⬜'} حرف صغير
                                            </span>
                                            <span style={{ color: /[0-9]/.test(form.password) ? '#2c7a7b' : inactiveColor }}>
                                                {/[0-9]/.test(form.password) ? '✅' : '⬜'} رقم
                                            </span>
                                            <span style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? '#2c7a7b' : inactiveColor }}>
                                                {/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? '✅' : '⬜'} رمز خاص
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">تأكيد كلمة المرور <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)}
                                        className={inputCls} style={inputStyle} placeholder="••••••••" dir="ltr" required />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-500 hover:text-cyber-300 text-sm">
                                        {showConfirm ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                {form.confirmPassword && (
                                    <p className="text-xs mt-1" style={{ color: form.password === form.confirmPassword ? '#2c7a7b' : '#e53e3e' }}>
                                        {form.password === form.confirmPassword ? '✅ كلمتا المرور متطابقتان' : '❌ كلمتا المرور غير متطابقتين'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ Step 2: نوع الحساب والمعلومات ═══ */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {/* Account Type Selection */}
                            <div>
                                <label className="block text-sm text-cyber-300 mb-3">نوع الحساب <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ACCOUNT_TYPES.map(acct => (
                                        <button key={acct.val} type="button" onClick={() => update("account_type", acct.val)}
                                            className="p-4 rounded-xl text-right transition-all duration-200 group"
                                            style={{
                                                background: form.account_type === acct.val
                                                    ? `linear-gradient(135deg, ${acct.color}18, ${acct.color}08)`
                                                    : 'rgba(255,255,255,0.5)',
                                                border: form.account_type === acct.val
                                                    ? `2px solid ${acct.color}80`
                                                    : '1px solid rgba(200,150,46,0.12)',
                                                transform: form.account_type === acct.val ? 'scale(1.01)' : 'scale(1)',
                                            }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-3xl">{acct.icon}</span>
                                                <div>
                                                    <div className="text-sm font-bold" style={{ color: form.account_type === acct.val ? acct.color : '#3d3730' }}>{acct.label}</div>
                                                    <div className="text-[11px] text-cyber-500">{acct.desc}</div>
                                                </div>
                                                {form.account_type === acct.val && <span className="mr-auto text-lg">✅</span>}
                                            </div>
                                            <div className="space-y-1 mr-11">
                                                {acct.features.map((f, i) => (
                                                    <div key={i} className="text-[10px] flex items-center gap-1" style={{ color: form.account_type === acct.val ? acct.color : inactiveColor }}>
                                                        <span>•</span> {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-cyber-300 mb-2">رقم الهاتف <span className="text-cyber-600 text-xs">(اختياري)</span></label>
                                    <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)}
                                        className={inputCls} style={inputStyle} placeholder="+966 5XX XXX XXXX" dir="ltr" />
                                    {form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone) && (
                                        <p className="text-xs text-red-400 mt-1">❌ رقم الهاتف غير صالح</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm text-cyber-300 mb-2">الدولة <span className="text-red-400">*</span></label>
                                    <select value={form.country} onChange={e => update("country", e.target.value)}
                                        className={inputCls} style={inputStyle}>
                                        <option value="">اختر دولتك</option>
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">مستوى الخبرة في الأمن السيبراني</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { val: "beginner", label: "مبتدئ", icon: "🌱", desc: "أبدأ رحلتي" },
                                        { val: "intermediate", label: "متوسط", icon: "⚡", desc: "لدي خبرة" },
                                        { val: "advanced", label: "متقدم", icon: "🔥", desc: "محترف" },
                                    ].map(lvl => (
                                        <button key={lvl.val} type="button" onClick={() => update("experience_level", lvl.val)}
                                            className="p-4 rounded-xl text-center transition-all duration-200"
                                            style={{
                                                background: form.experience_level === lvl.val
                                                    ? 'linear-gradient(135deg, rgba(200,150,46,0.12), rgba(200,150,46,0.04))'
                                                    : 'rgba(255,255,255,0.5)',
                                                border: form.experience_level === lvl.val
                                                    ? '2px solid rgba(200,150,46,0.5)'
                                                    : '1px solid rgba(200,150,46,0.12)',
                                                transform: form.experience_level === lvl.val ? 'scale(1.02)' : 'scale(1)',
                                            }}>
                                            <div className="text-2xl mb-1">{lvl.icon}</div>
                                            <div className="text-sm font-bold" style={{ color: form.experience_level === lvl.val ? activeColor : '#5c5549' }}>{lvl.label}</div>
                                            <div className="text-[10px] text-cyber-500 mt-0.5">{lvl.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">نبذة عنك <span className="text-cyber-600 text-xs">(اختياري)</span></label>
                                <textarea value={form.bio} onChange={e => update("bio", e.target.value)}
                                    className={inputCls} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
                                    placeholder="أخبرنا عن اهتماماتك في الأمن السيبراني..."
                                    maxLength={300} />
                                <p className="text-[10px] text-cyber-600 text-left mt-1" dir="ltr">{form.bio.length}/300</p>
                            </div>
                        </div>
                    )}

                    {/* ═══ Step 3: الحماية والأمان ═══ */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl mb-2" style={{ background: 'rgba(200,150,46,0.06)', border: '1px solid rgba(200,150,46,0.12)' }}>
                                <p className="text-cyber-300 text-sm">🛡️ سؤال الأمان يُستخدم لاستعادة حسابك في حال نسيت كلمة المرور. اختر سؤالاً يمكنك تذكر إجابته دائماً.</p>
                            </div>

                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">سؤال الأمان <span className="text-red-400">*</span></label>
                                <select value={form.security_question} onChange={e => update("security_question", e.target.value)}
                                    className={inputCls} style={inputStyle}>
                                    <option value="">اختر سؤال الأمان</option>
                                    {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-cyber-300 mb-2">جواب سؤال الأمان <span className="text-red-400">*</span></label>
                                <input type="text" value={form.security_answer} onChange={e => update("security_answer", e.target.value)}
                                    className={inputCls} style={inputStyle} placeholder="أدخل الجواب" />
                                <p className="text-[10px] text-cyber-600 mt-1">💡 تأكد من تذكر هذا الجواب — سيُطلب منك عند استعادة الحساب</p>
                            </div>

                            {/* Security Checklist */}
                            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,150,46,0.12)' }}>
                                <h3 className="text-sm font-bold text-cyber-200 mb-3">📋 قائمة التحقق الأمنية</h3>
                                <div className="space-y-2 text-sm">
                                    {[
                                        { check: form.password.length >= 8, label: "كلمة مرور بطول 8 أحرف أو أكثر" },
                                        { check: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password), label: "أحرف كبيرة وصغيرة" },
                                        { check: /[0-9]/.test(form.password), label: "رقم واحد على الأقل" },
                                        { check: /[!@#$%^&*(),.?":{}|<>]/.test(form.password), label: "رمز خاص (مُستحسن)" },
                                        { check: !!form.security_question, label: "سؤال أمان محدد" },
                                        { check: form.security_answer.length >= 3, label: "جواب أمان صالح" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-lg">{item.check ? '✅' : '⬜'}</span>
                                            <span style={{ color: item.check ? '#2c7a7b' : inactiveColor }}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ Step 4: المراجعة والتأكيد ═══ */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl" style={{ background: 'rgba(200,150,46,0.06)', border: '1px solid rgba(200,150,46,0.12)' }}>
                                <p className="text-cyber-300 text-sm">📝 راجع بياناتك بعناية قبل إنشاء الحساب. يمكنك العودة لأي خطوة لتعديل البيانات.</p>
                            </div>

                            {/* Review Data */}
                            <div className="space-y-3">
                                {[
                                    { label: "الاسم", value: form.name, icon: "👤" },
                                    { label: "البريد", value: form.email, icon: "📧" },
                                    { label: "كلمة المرور", value: "•".repeat(form.password.length), icon: "🔑" },
                                    { label: "نوع الحساب", value: `${getAccountIcon(form.account_type)} ${getAccountLabel(form.account_type)}`, icon: "🏷️" },
                                    { label: "الهاتف", value: form.phone || "—", icon: "📱" },
                                    { label: "الدولة", value: form.country || "—", icon: "🌍" },
                                    { label: "المستوى", value: form.experience_level === "beginner" ? "مبتدئ 🌱" : form.experience_level === "intermediate" ? "متوسط ⚡" : "متقدم 🔥", icon: "📊" },
                                    { label: "سؤال الأمان", value: form.security_question, icon: "🔐" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,150,46,0.08)' }}>
                                        <span className="text-lg">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs text-cyber-500">{item.label}</span>
                                            <p className="text-sm text-cyber-200 truncate">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {form.bio && (
                                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,150,46,0.08)' }}>
                                    <span className="text-xs text-cyber-500">📝 نبذة</span>
                                    <p className="text-sm text-cyber-300 mt-1">{form.bio}</p>
                                </div>
                            )}

                            {/* Terms Agreement */}
                            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,150,46,0.12)' }}>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="accent-amber-600 mt-1" checked={form.agreed}
                                        onChange={e => update("agreed", e.target.checked)} />
                                    <span className="text-sm text-cyber-300 leading-relaxed">
                                        أوافق على <Link href="/policies?tab=terms" target="_blank" className="text-accent hover:underline">الشروط والأحكام</Link> و
                                        <Link href="/policies?tab=privacy" target="_blank" className="text-accent hover:underline"> سياسة الخصوصية</Link> وباقي السياسات الأمنية.
                                        أتعهد بأن جميع البيانات المُدخلة صحيحة.
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 gap-4">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-6 py-3 rounded-xl text-sm font-bold text-cyber-300 transition-all hover:text-cyber-950"
                                style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,150,46,0.12)' }}>
                                → الخطوة السابقة
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 4 ? (
                            <button onClick={nextStep} className="btn-primary px-8 py-3">
                                الخطوة التالية ←
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading || !form.agreed}
                                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? "⏳ جاري إنشاء الحساب..." : "🚀 إنشاء الحساب"}
                            </button>
                        )}
                    </div>

                    <p className="text-center text-cyber-500 text-sm mt-6">
                        لديك حساب بالفعل؟ <Link href="/login" className="text-accent hover:underline">سجل الدخول</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
