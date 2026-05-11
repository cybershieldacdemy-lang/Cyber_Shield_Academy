"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    account_type?: string;
    experience_level?: string;
    country?: string;
}

// ═══════════════════════════════════════════════════════
// تكوينات أنواع الحسابات
// ═══════════════════════════════════════════════════════
const ACCOUNT_CONFIGS: Record<string, {
    label: string; icon: string; color: string; gradient: string;
    welcomeMsg: string;
    stats: { icon: string; label: string; value: string; color: string }[];
    quickLinks: { href: string; icon: string; label: string }[];
    features: { icon: string; title: string; desc: string }[];
}> = {
    student: {
        label: "طالب", icon: "🎓", color: "#c8962e",
        gradient: "linear-gradient(135deg, #c8962e, #b0831f)",
        welcomeMsg: "مرحباً بك في رحلة التعلم! ابدأ بتصفح الدورات واكتسب المهارات",
        stats: [
            { icon: "📚", label: "الدورات المسجلة", value: "0", color: "#c8962e" },
            { icon: "✅", label: "الدورات المكتملة", value: "0", color: "#2da5c7" },
            { icon: "🏆", label: "الشهادات", value: "0", color: "#805ad5" },
            { icon: "📖", label: "المصطلحات المحفوظة", value: "1,300+", color: "#d69e2e" },
        ],
        quickLinks: [
            { href: "/courses", icon: "🎓", label: "الدورات التعليمية" },
            { href: "/terms", icon: "📚", label: "المصطلحات" },
            { href: "/paths", icon: "🗺️", label: "مسارات التعلم" },
            { href: "/tools", icon: "🔧", label: "الأدوات" },
            { href: "/blog", icon: "📝", label: "المقالات" },
            { href: "/domains", icon: "🏰", label: "التخصصات" },
        ],
        features: [
            { icon: "📊", title: "تتبع التقدم", desc: "تابع تقدمك في كل دورة بشكل مفصّل" },
            { icon: "🎯", title: "تمارين عملية", desc: "طبّق ما تعلمته في تمارين تفاعلية" },
            { icon: "🏅", title: "شهادات إتمام", desc: "احصل على شهادات معتمدة عند إتمام الدورات" },
        ],
    },
    instructor: {
        label: "مدرّب", icon: "👨‍🏫", color: "#2da5c7",
        gradient: "linear-gradient(135deg, #2da5c7, #1a8aab)",
        welcomeMsg: "مرحباً بك! شارك خبرتك وساعد الطلاب في رحلة التعلم",
        stats: [
            { icon: "🎓", label: "الدورات المنشورة", value: "0", color: "#2da5c7" },
            { icon: "👥", label: "إجمالي الطلاب", value: "0", color: "#c8962e" },
            { icon: "⭐", label: "التقييم", value: "—", color: "#d69e2e" },
            { icon: "📝", label: "المقالات المنشورة", value: "0", color: "#805ad5" },
        ],
        quickLinks: [
            { href: "/dashboard/instructor", icon: "🔬", label: "مختبراتي" },
            { href: "/courses", icon: "📋", label: "إدارة الدورات" },
            { href: "/blog", icon: "✍️", label: "كتابة مقالة" },
            { href: "/terms", icon: "📚", label: "المصطلحات" },
            { href: "/tools", icon: "🔧", label: "أدوات التدريب" },
            { href: "/domains", icon: "🏰", label: "التخصصات" },
        ],
        features: [
            { icon: "📹", title: "إنشاء المحتوى", desc: "أنشئ دورات تفاعلية ومحتوى تعليمي متميز" },
            { icon: "📈", title: "تحليل الأداء", desc: "تابع أداء طلابك وحالات التقدم" },
            { icon: "💬", title: "التواصل مع الطلاب", desc: "تفاعل مع طلابك وأجب على استفساراتهم" },
        ],
    },
    researcher: {
        label: "باحث أمني", icon: "🔬", color: "#805ad5",
        gradient: "linear-gradient(135deg, #805ad5, #6b46c1)",
        welcomeMsg: "مرحباً أيها الباحث! اكتشف الثغرات وساهم في تأمين الفضاء السيبراني",
        stats: [
            { icon: "🔍", label: "الثغرات المكتشفة", value: "0", color: "#805ad5" },
            { icon: "📄", label: "التقارير المنشورة", value: "0", color: "#2da5c7" },
            { icon: "🛡️", label: "CVEs", value: "0", color: "#e53e3e" },
            { icon: "⭐", label: "نقاط السمعة", value: "0", color: "#d69e2e" },
        ],
        quickLinks: [
            { href: "/news", icon: "📰", label: "أخبار الثغرات" },
            { href: "/tools", icon: "🔬", label: "أدوات التحليل" },
            { href: "/blog", icon: "📝", label: "نشر بحث" },
            { href: "/terms", icon: "📚", label: "المصطلحات" },
            { href: "/courses", icon: "🎓", label: "دورات متقدمة" },
            { href: "/domains", icon: "🏰", label: "التخصصات" },
        ],
        features: [
            { icon: "🐛", title: "اكتشاف الثغرات", desc: "ابحث عن الثغرات الأمنية وأبلغ عنها" },
            { icon: "📊", title: "أدوات التحليل", desc: "استخدم أدوات متقدمة لتحليل التهديدات" },
            { icon: "🤝", title: "التعاون البحثي", desc: "تعاون مع باحثين آخرين في مشاريع مشتركة" },
        ],
    },
    analyst: {
        label: "محلل سيبراني", icon: "📊", color: "#d69e2e",
        gradient: "linear-gradient(135deg, #d69e2e, #b7791f)",
        welcomeMsg: "مرحباً! راقب التهديدات وحلّل البيانات الأمنية لحماية المؤسسات",
        stats: [
            { icon: "🚨", label: "التنبيهات النشطة", value: "0", color: "#e53e3e" },
            { icon: "📊", label: "التقارير", value: "0", color: "#d69e2e" },
            { icon: "🛡️", label: "التهديدات المعالجة", value: "0", color: "#c8962e" },
            { icon: "📈", label: "مستوى الأمان", value: "—", color: "#2da5c7" },
        ],
        quickLinks: [
            { href: "/news", icon: "📰", label: "آخر الأخبار الأمنية" },
            { href: "/tools", icon: "🔧", label: "أدوات المراقبة" },
            { href: "/blog", icon: "📝", label: "تقارير التحليل" },
            { href: "/terms", icon: "📚", label: "المصطلحات" },
            { href: "/courses", icon: "🎓", label: "الدورات التدريبية" },
            { href: "/domains", icon: "🏰", label: "التخصصات" },
        ],
        features: [
            { icon: "📡", title: "مراقبة التهديدات", desc: "راقب التهديدات الأمنية في الوقت الفعلي" },
            { icon: "📋", title: "إعداد التقارير", desc: "أعدّ تقارير أمنية شاملة ومفصّلة" },
            { icon: "⚡", title: "الاستجابة للحوادث", desc: "تعامل مع الحوادث الأمنية بسرعة وكفاءة" },
        ],
    },
};

// ═══════════════════════════════════════════════════════
// الصفحة الرئيسية
// ═══════════════════════════════════════════════════════
export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated) {
                    setUser(data.user);
                } else {
                    router.push("/login?redirect=/dashboard");
                }
            })
            .catch(() => router.push("/login"))
            .finally(() => setLoading(false));
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        router.refresh();
    };

    if (loading) {
        return (
            <div style={{ paddingTop: "80px" }}>
                <div className="section-container">
                    <div className="flex items-center gap-4 mb-8 animate-pulse">
                        <div className="w-16 h-16 rounded-2xl" style={{ background: '#ece4d4' }} />
                        <div>
                            <div className="h-7 w-56 rounded mb-2" style={{ background: '#ece4d4' }} />
                            <div className="h-4 w-36 rounded" style={{ background: '#f5efe3' }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="glass-card p-5 text-center animate-pulse">
                                <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{ background: '#ece4d4' }} />
                                <div className="h-6 w-10 rounded mx-auto mb-1" style={{ background: '#ece4d4' }} />
                                <div className="h-3 w-20 rounded mx-auto" style={{ background: '#f5efe3' }} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="glass-card p-4 animate-pulse">
                                <div className="h-4 w-24 rounded mx-auto" style={{ background: '#ece4d4' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const accountType = user.account_type || "student";
    const config = ACCOUNT_CONFIGS[accountType] || ACCOUNT_CONFIGS.student;

    const recentCourses = [
        { title: "أساسيات الأمن السيبراني", progress: 65, level: "مبتدئ" },
        { title: "اختبار الاختراق المتقدم", progress: 30, level: "متقدم" },
        { title: "تحليل البرمجيات الخبيثة", progress: 10, level: "متوسط" },
    ];

    return (
        <div style={{ paddingTop: "80px" }}>
            <div className="section-container">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: config.gradient }}>
                            {config.icon}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-cyber-100">مرحباً، <span className="gradient-text">{user.name}</span></h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40` }}>
                                    {config.icon} {config.label}
                                </span>
                                <span className="text-cyber-500 text-sm">{user.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {user.role === 'admin' && (
                            <Link href="/admin" className="btn-secondary !py-2 !px-4 !text-sm">⚙️ لوحة التحكم</Link>
                        )}
                        {(user.role === 'instructor' || user.role === 'teacher' || user.account_type === 'instructor') && (
                            <Link href="/instructor/dashboard" className="px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg hover:scale-105 text-[#0B0F19]" style={{ background: "linear-gradient(135deg, #00E5FF, #007BFF)" }}>
                                🧑‍🏫 لوحة المدرب
                            </Link>
                        )}
                        <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                            تسجيل الخروج
                        </button>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="p-4 rounded-xl mb-8" style={{ background: `${config.color}08`, border: `1px solid ${config.color}20` }}>
                    <p className="text-sm" style={{ color: config.color }}>💡 {config.welcomeMsg}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {config.stats.map((stat, i) => (
                        <div key={i} className="glass-card p-5 text-center group hover:scale-[1.02] transition-transform">
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-cyber-400 text-xs mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Features for this account type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {config.features.map((feature, i) => (
                        <div key={i} className="glass-card p-5 group hover:scale-[1.01] transition-transform">
                            <div className="text-3xl mb-3">{feature.icon}</div>
                            <h3 className="text-sm font-bold mb-1" style={{ color: config.color }}>{feature.title}</h3>
                            <p className="text-cyber-500 text-xs leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Courses Progress (visible for students/instructors) */}
                    {(accountType === "student" || accountType === "instructor") && (
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold text-cyber-100 mb-5">
                                {accountType === "student" ? "📈 تقدمك في الدورات" : "📈 أداء الطلاب"}
                            </h2>
                            <div className="space-y-4">
                                {recentCourses.map((course, i) => (
                                    <div key={i} className="p-4 rounded-xl" style={{ background: `${config.color}05`, border: `1px solid ${config.color}10` }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-cyber-200 font-medium">{course.title}</span>
                                            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${config.color}15`, color: config.color }}>{course.level}</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full" style={{ background: `${config.color}15` }}>
                                            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${course.progress}%`, background: config.gradient }} />
                                        </div>
                                        <div className="text-left text-xs text-cyber-400 mt-1" dir="ltr">{course.progress}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Threat Monitor (visible for analysts/researchers) */}
                    {(accountType === "analyst" || accountType === "researcher") && (
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold text-cyber-100 mb-5">
                                {accountType === "analyst" ? "🚨 آخر التنبيهات الأمنية" : "🔬 آخر الأبحاث"}
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { title: "ثغرة حرجة في OpenSSL", severity: "حرج", color: "#e53e3e", time: "منذ ساعتين" },
                                    { title: "تحديث أمني لـ Linux Kernel", severity: "عالي", color: "#d69e2e", time: "منذ 5 ساعات" },
                                    { title: "اكتشاف برمجية خبيثة جديدة", severity: "متوسط", color: "#2da5c7", time: "منذ يوم" },
                                ].map((alert, i) => (
                                    <div key={i} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.5)', border: `1px solid ${alert.color}20` }}>
                                        <span className="w-2 h-2 rounded-full" style={{ background: alert.color }} />
                                        <div className="flex-1">
                                            <p className="text-sm text-cyber-200">{alert.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${alert.color}20`, color: alert.color }}>{alert.severity}</span>
                                                <span className="text-[10px] text-cyber-600">{alert.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold text-cyber-100 mb-4">🚀 روابط سريعة</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {config.quickLinks.map((link, i) => (
                                    <Link key={i} href={link.href} className="p-3 rounded-xl text-center text-sm hover:bg-accent/5 transition-all hover:scale-[1.02]" style={{ border: `1px solid ${config.color}10` }}>
                                        <div className="text-2xl mb-1">{link.icon}</div>
                                        <div className="text-cyber-300">{link.label}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold text-cyber-100 mb-3">📋 معلومات الحساب</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-cyber-400">الاسم:</span><span className="text-cyber-200">{user.name}</span></div>
                                <div className="flex justify-between"><span className="text-cyber-400">البريد:</span><span className="text-cyber-200" dir="ltr">{user.email}</span></div>
                                <div className="flex justify-between">
                                    <span className="text-cyber-400">نوع الحساب:</span>
                                    <span className="font-bold" style={{ color: config.color }}>{config.icon} {config.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-cyber-400">الدور:</span>
                                    <span className="text-cyber-200">{user.role === 'admin' ? '🔑 مشرف' : '👤 عضو'}</span>
                                </div>
                                {user.experience_level && (
                                    <div className="flex justify-between">
                                        <span className="text-cyber-400">المستوى:</span>
                                        <span className="text-cyber-200">
                                            {user.experience_level === 'beginner' ? '🌱 مبتدئ' : user.experience_level === 'intermediate' ? '⚡ متوسط' : '🔥 متقدم'}
                                        </span>
                                    </div>
                                )}
                                {user.country && (
                                    <div className="flex justify-between"><span className="text-cyber-400">الدولة:</span><span className="text-cyber-200">🌍 {user.country}</span></div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-red-500/10">
                        <h2 className="text-lg font-bold text-cyber-100 mb-3">🛡️ الخصوصية والبيانات</h2>
                        <div className="space-y-3">
                            <button onClick={() => window.open('/api/user/export', '_blank')}
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-accent/5 text-cyber-200 text-sm transition-colors border border-cyber-700">
                                <span>📥</span> تحميل نسخة من بياناتي
                            </button>
                            <button onClick={() => {
                                const password = prompt("⚠️ لحذف حسابك نهائياً، يرجى كتابة كلمة المرور للتأكيد:");
                                if (password) {
                                    fetch('/api/user/delete', {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ password })
                                    })
                                        .then(res => {
                                            if (res.ok) {
                                                return res.json().then(data => {
                                                    alert(data.message);
                                                    localStorage.removeItem('token');
                                                    localStorage.removeItem('user');
                                                    window.location.href = '/login';
                                                });
                                            } else {
                                                return res.json().then(data => {
                                                    alert(`خطأ: ${data.message}`);
                                                });
                                            }
                                        })
                                        .catch(_err => alert('حدث خطأ أثناء الحذف'));
                                }
                            }}
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-colors border border-red-500/20">
                                <span>🗑️</span> حذف حسابي نهائياً
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
