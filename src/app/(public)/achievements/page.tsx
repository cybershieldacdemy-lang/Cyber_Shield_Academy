"use client";
import { useState } from "react";
import Link from "next/link";

const badgeCategories = [
    { name: "التعلم", color: "#2da5c7", icon: "📚" },
    { name: "المختبرات", color: "#38b2ac", icon: "🧪" },
    { name: "التحديات", color: "#e53e3e", icon: "⚔️" },
    { name: "المجتمع", color: "#805ad5", icon: "👥" },
];

const badges = [
    { name: "المتعلم الأول", nameEn: "First Learner", desc: "أكمل أول درس في الأكاديمية", icon: "🌟", xp: 50, category: "التعلم", rarity: "شائعة", color: "#38b2ac", unlocked: true, progress: 100 },
    { name: "محارب الشبكات", nameEn: "Network Warrior", desc: "أكمل 10 دروس في أمن الشبكات", icon: "🌐", xp: 300, category: "التعلم", rarity: "نادرة", color: "#2da5c7", unlocked: true, progress: 100 },
    { name: "صائد الثغرات", nameEn: "Bug Hunter", desc: "اكتشف 5 ثغرات في المختبرات", icon: "🐛", xp: 500, category: "المختبرات", rarity: "نادرة", color: "#e53e3e", unlocked: false, progress: 60 },
    { name: "خبير التشفير", nameEn: "Crypto Expert", desc: "أكمل جميع دروس التشفير", icon: "🔐", xp: 400, category: "التعلم", rarity: "نادرة", color: "#c8962e", unlocked: false, progress: 45 },
    { name: "بطل CTF", nameEn: "CTF Champion", desc: "احتل المركز الأول في تحدي CTF", icon: "🏆", xp: 1000, category: "التحديات", rarity: "أسطورية", color: "#d69e2e", unlocked: false, progress: 0 },
    { name: "الدرع الأزرق", nameEn: "Blue Shield", desc: "أكمل مسار الفريق الأزرق بالكامل", icon: "🛡️", xp: 800, category: "المختبرات", rarity: "ملحمية", color: "#3182ce", unlocked: false, progress: 20 },
    { name: "المساعد النشط", nameEn: "Active Helper", desc: "ساعد 10 متعلمين في المجتمع", icon: "🤝", xp: 200, category: "المجتمع", rarity: "شائعة", color: "#805ad5", unlocked: true, progress: 100 },
    { name: "الهاكر الأخلاقي", nameEn: "Ethical Hacker", desc: "أكمل 20 مختبراً بنجاح", icon: "💻", xp: 600, category: "المختبرات", rarity: "ملحمية", color: "#2c7a7b", unlocked: false, progress: 35 },
    { name: "ناشر المعرفة", nameEn: "Knowledge Spreader", desc: "اكتب 5 مقالات في المجتمع", icon: "✍️", xp: 250, category: "المجتمع", rarity: "نادرة", color: "#805ad5", unlocked: false, progress: 40 },
    { name: "المحترف", nameEn: "The Professional", desc: "احصل على 5000 نقطة XP", icon: "⭐", xp: 500, category: "التحديات", rarity: "ملحمية", color: "#c8962e", unlocked: false, progress: 70 },
    { name: "ملك الأدوات", nameEn: "Tool Master", desc: "استخدم 15 أداة أمنية مختلفة", icon: "🔧", xp: 350, category: "المختبرات", rarity: "نادرة", color: "#dd6b20", unlocked: false, progress: 50 },
    { name: "الوحش الأسطوري", nameEn: "Legendary Beast", desc: "أكمل جميع المختبرات والدورات", icon: "🐉", xp: 2000, category: "التحديات", rarity: "أسطورية", color: "#c53030", unlocked: false, progress: 5 },
];

const leaderboard = [
    { rank: 1, name: "أحمد الرشيدي", xp: 12450, level: "خبير", badge: "🥇", avatar: "👨‍💻" },
    { rank: 2, name: "سارة المنصوري", xp: 11200, level: "خبير", badge: "🥈", avatar: "👩‍💻" },
    { rank: 3, name: "خالد العتيبي", xp: 10800, level: "متقدم", badge: "🥉", avatar: "👨‍💻" },
    { rank: 4, name: "نورا الحربي", xp: 9500, level: "متقدم", badge: "4", avatar: "👩‍💻" },
    { rank: 5, name: "عبدالله السالم", xp: 8900, level: "متقدم", badge: "5", avatar: "👨‍💻" },
    { rank: 6, name: "ريم الشمري", xp: 8100, level: "متوسط", badge: "6", avatar: "👩‍💻" },
    { rank: 7, name: "فيصل الدوسري", xp: 7600, level: "متوسط", badge: "7", avatar: "👨‍💻" },
    { rank: 8, name: "لمى القحطاني", xp: 7200, level: "متوسط", badge: "8", avatar: "👩‍💻" },
];

const levels = [
    { name: "مبتدئ", xpRange: "0 - 1,000", color: "#38b2ac", icon: "🌱" },
    { name: "متعلم", xpRange: "1,001 - 3,000", color: "#2da5c7", icon: "📖" },
    { name: "متوسط", xpRange: "3,001 - 6,000", color: "#2b6cb0", icon: "⚡" },
    { name: "متقدم", xpRange: "6,001 - 10,000", color: "#805ad5", icon: "🚀" },
    { name: "خبير", xpRange: "10,001 - 15,000", color: "#c8962e", icon: "👑" },
    { name: "أسطوري", xpRange: "15,001+", color: "#e53e3e", icon: "🐉" },
];

export default function AchievementsPage() {
    const [filter, setFilter] = useState("الكل");
    const filteredBadges = filter === "الكل" ? badges : badges.filter(b => b.category === filter);

    const getRarityStyle = (rarity: string) => {
        switch (rarity) {
            case "شائعة": return { bg: 'rgba(56,178,172,0.1)', color: '#2c7a7b', border: '1px solid rgba(56,178,172,0.25)' };
            case "نادرة": return { bg: 'rgba(45,165,199,0.1)', color: '#2b6cb0', border: '1px solid rgba(45,165,199,0.25)' };
            case "ملحمية": return { bg: 'rgba(128,90,213,0.1)', color: '#6b46c1', border: '1px solid rgba(128,90,213,0.25)' };
            case "أسطورية": return { bg: 'rgba(200,150,46,0.1)', color: '#8b7340', border: '1px solid rgba(200,150,46,0.3)' };
            default: return { bg: 'rgba(200,150,46,0.05)', color: '#7a7164', border: '1px solid rgba(200,150,46,0.1)' };
        }
    };

    return (
        <div style={{ paddingTop: "80px" }}>
            {/* Header */}
            <div className="page-header">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                    background: 'rgba(200, 150, 46, 0.08)',
                    border: '1px solid rgba(200, 150, 46, 0.15)',
                }}>
                    <span style={{ color: '#c8962e', fontSize: '0.85rem', fontWeight: 600 }}>✦ اكسب الشارات وارتقِ بمستواك</span>
                </div>
                <h1>
                    الإنجازات <span className="gradient-text">والشارات</span>
                </h1>
                <p>أكمل التحديات واحصل على شارات حصرية تعكس مستوى مهاراتك في الأمن السيبراني</p>
            </div>

            {/* Quick Stats */}
            <section className="section-container" style={{ paddingTop: '10px', paddingBottom: '30px' }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                        { value: "12", label: "شارة متاحة", icon: "🏅" },
                        { value: "3", label: "شارات مفتوحة", icon: "🔓" },
                        { value: "2,750", label: "نقاط XP", icon: "⚡" },
                        { value: "متوسط", label: "المستوى الحالي", icon: "📊" },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-5 text-center">
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <div className="text-2xl font-black gradient-text">{stat.value}</div>
                            <div className="text-xs mt-1" style={{ color: '#7a7164' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Levels Progress */}
            <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '50px' }}>
                <h2 className="text-2xl font-bold text-center mb-8">
                    مستويات <span className="gradient-text">التقدم</span>
                </h2>
                <div className="max-w-4xl mx-auto glass-card p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {levels.map((level, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 transition-transform group-hover:scale-110" style={{
                                    background: `${level.color}12`,
                                    border: `2px solid ${level.color}30`,
                                }}>
                                    {level.icon}
                                </div>
                                <p className="text-sm font-bold mb-1" style={{ color: level.color }}>{level.name}</p>
                                <p className="text-xs" style={{ color: '#7a7164' }} dir="ltr">{level.xpRange} XP</p>
                            </div>
                        ))}
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium" style={{ color: '#3d3730' }}>تقدمك نحو المستوى التالي</span>
                            <span className="text-sm font-bold" style={{ color: '#c8962e' }}>2,750 / 6,000 XP</span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(200,150,46,0.1)' }}>
                            <div className="h-full rounded-full transition-all duration-1000" style={{
                                width: '46%',
                                background: 'linear-gradient(135deg, #c8962e, #e8c068)',
                            }} />
                        </div>
                        <p className="text-xs mt-2 text-center" style={{ color: '#7a7164' }}>تحتاج 3,250 XP للوصول إلى مستوى متقدم</p>
                    </div>
                </div>
            </section>

            {/* Badges Section */}
            <section className="section-container" style={{ background: 'rgba(200, 150, 46, 0.02)', paddingTop: '60px' }}>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-3">
                        الشارات <span className="gradient-text">المتاحة</span>
                    </h2>
                    <p style={{ color: '#5c5549' }}>أكمل المهام واحصل على شارات حصرية</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {["الكل", ...badgeCategories.map(c => c.name)].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                            style={{
                                background: filter === cat ? 'linear-gradient(135deg, #c8962e, #e8c068)' : 'rgba(255,255,255,0.7)',
                                color: filter === cat ? '#fff' : '#5c5549',
                                border: filter === cat ? 'none' : '1px solid rgba(200,150,46,0.15)',
                                cursor: 'pointer',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                    {filteredBadges.map((badge, i) => {
                        const rarityStyle = getRarityStyle(badge.rarity);
                        return (
                            <div
                                key={i}
                                className="glass-card p-6 group relative overflow-hidden"
                                style={{
                                    opacity: badge.unlocked ? 1 : 0.75,
                                }}
                            >
                                {/* Unlocked indicator */}
                                {badge.unlocked && (
                                    <div className="absolute top-4 left-4">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#38b2ac" stroke="none">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Badge Icon */}
                                <div className="text-center mb-4">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto transition-transform group-hover:scale-110"
                                        style={{
                                            background: `${badge.color}12`,
                                            border: `2px solid ${badge.color}30`,
                                            filter: badge.unlocked ? 'none' : 'grayscale(50%)',
                                        }}
                                    >
                                        {badge.icon}
                                    </div>
                                </div>

                                {/* Badge Info */}
                                <div className="text-center">
                                    <h3 className="font-bold text-base mb-0.5" style={{ color: '#1a1612' }}>{badge.name}</h3>
                                    <p className="text-xs font-mono mb-2" style={{ color: '#a89f8e' }} dir="ltr">{badge.nameEn}</p>
                                    <p className="text-xs mb-3" style={{ color: '#5c5549' }}>{badge.desc}</p>

                                    {/* Rarity & XP */}
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                            background: rarityStyle.bg,
                                            color: rarityStyle.color,
                                            border: rarityStyle.border,
                                        }}>
                                            {badge.rarity}
                                        </span>
                                        <span className="text-xs font-bold" style={{ color: '#c8962e' }}>⚡ {badge.xp} XP</span>
                                    </div>

                                    {/* Progress */}
                                    {!badge.unlocked && (
                                        <div>
                                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(200,150,46,0.1)' }}>
                                                <div className="h-full rounded-full" style={{
                                                    width: `${badge.progress}%`,
                                                    background: `linear-gradient(135deg, ${badge.color}, ${badge.color}aa)`,
                                                }} />
                                            </div>
                                            <p className="text-xs mt-1.5" style={{ color: '#7a7164' }}>{badge.progress}% مكتمل</p>
                                        </div>
                                    )}
                                    {badge.unlocked && (
                                        <p className="text-xs font-bold" style={{ color: '#2c7a7b' }}>✅ تم الحصول عليها</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Leaderboard */}
            <section className="section-container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">
                        لوحة <span className="gradient-text">المتصدرين</span>
                    </h2>
                    <p style={{ color: '#5c5549' }}>أفضل المتعلمين هذا الشهر</p>
                </div>
                <div className="max-w-3xl mx-auto glass-card overflow-hidden">
                    {leaderboard.map((player, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-5 transition-all"
                            style={{
                                borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(200,150,46,0.08)' : 'none',
                                background: i < 3 ? 'rgba(200,150,46,0.03)' : 'transparent',
                            }}
                        >
                            {/* Rank */}
                            <div className="w-8 text-center font-black text-lg" style={{
                                color: i === 0 ? '#c8962e' : i === 1 ? '#7a7164' : i === 2 ? '#b7791f' : '#a89f8e',
                            }}>
                                {i < 3 ? player.badge : player.rank}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{
                                background: 'rgba(200,150,46,0.08)',
                                border: '1px solid rgba(200,150,46,0.15)',
                            }}>
                                {player.avatar}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <p className="text-sm font-bold" style={{ color: '#1a1612' }}>{player.name}</p>
                                <p className="text-xs" style={{ color: '#7a7164' }}>المستوى: {player.level}</p>
                            </div>

                            {/* XP */}
                            <div className="text-left">
                                <span className="text-sm font-bold" style={{ color: '#c8962e' }} dir="ltr">{player.xp.toLocaleString()}</span>
                                <span className="text-xs mr-1" style={{ color: '#7a7164' }}>XP</span>
                            </div>
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
                            ابدأ جمع <span className="gradient-text">الإنجازات</span> الآن
                        </h2>
                        <p className="mb-8 max-w-xl mx-auto" style={{ color: '#5c5549' }}>
                            سجل حسابك وابدأ رحلتك في تحقيق الإنجازات وجمع نقاط الخبرة
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/register" className="btn-primary px-8 py-3.5">🏆 ابدأ رحلتك</Link>
                            <Link href="/labs" className="btn-secondary px-8 py-3.5">استكشف المختبرات</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
