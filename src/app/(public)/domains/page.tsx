import Link from "next/link";
import { domains } from "@/data/domains-data";

export default function DomainsPage() {
    return (
        <div style={{ paddingTop: '80px' }}>
            <div className="page-header">
                <div className="text-5xl mb-4">🛡️</div>
                <h1>تخصصات <span className="gradient-text">الأمن السيبراني</span></h1>
                <p>12 تخصصاً أساسياً يغطي جميع جوانب حماية الفضاء الرقمي — من أمن الشبكات إلى التوعية الأمنية</p>
            </div>

            {/* Core Domains */}
            <section className="section-container">
                <h2 className="text-2xl font-bold mb-2 text-center">🔹 الأقسام <span className="gradient-text">الأساسية</span></h2>
                <p className="text-cyber-400 text-center mb-10 text-sm">المجالات الخمسة الرئيسية التي يبنى عليها الأمن السيبراني</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {domains.slice(0, 5).map((domain) => (
                        <Link key={domain.id} href={`/domains/${domain.slug}`} className="glass-card p-7 group block">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl">{domain.icon}</div>
                                <div>
                                    <h3 className="font-bold text-cyber-100 group-hover:text-accent transition-colors">{domain.nameAr}</h3>
                                    <p className="text-xs text-cyber-500 font-mono" dir="ltr">{domain.nameEn}</p>
                                </div>
                            </div>
                            <p className="text-cyber-400 text-sm leading-relaxed mb-4">{domain.descriptionAr}</p>
                            <div className="flex flex-wrap gap-2">
                                {domain.topics.slice(0, 3).map((t, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: `${domain.color}15`, color: domain.color, border: `1px solid ${domain.color}30` }}>
                                        {t.titleAr}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Advanced Domains */}
            <section className="section-container" style={{ background: 'linear-gradient(180deg, transparent, rgba(200,150,46,0.02), transparent)' }}>
                <h2 className="text-2xl font-bold mb-2 text-center">🚀 التخصصات <span className="gradient-text">المتقدمة</span></h2>
                <p className="text-cyber-400 text-center mb-10 text-sm">مجالات احترافية متخصصة للمستوى المتوسط والمتقدم</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {domains.slice(5, 10).map((domain) => (
                        <Link key={domain.id} href={`/domains/${domain.slug}`} className="glass-card p-7 group block">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl">{domain.icon}</div>
                                <div>
                                    <h3 className="font-bold text-cyber-100 group-hover:text-accent transition-colors">{domain.nameAr}</h3>
                                    <p className="text-xs text-cyber-500 font-mono" dir="ltr">{domain.nameEn}</p>
                                </div>
                            </div>
                            <p className="text-cyber-400 text-sm leading-relaxed mb-4">{domain.descriptionAr}</p>
                            <div className="flex flex-wrap gap-2">
                                {domain.topics.slice(0, 3).map((t, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: `${domain.color}15`, color: domain.color, border: `1px solid ${domain.color}30` }}>
                                        {t.titleAr}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Governance Domains */}
            <section className="section-container">
                <h2 className="text-2xl font-bold mb-2 text-center">🏛️ الأقسام <span className="gradient-text">الإدارية والتنظيمية</span></h2>
                <p className="text-cyber-400 text-center mb-10 text-sm">الجانب التنظيمي والإداري من الأمن السيبراني</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {domains.slice(10).map((domain) => (
                        <Link key={domain.id} href={`/domains/${domain.slug}`} className="glass-card p-7 group block">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl">{domain.icon}</div>
                                <div>
                                    <h3 className="font-bold text-cyber-100 group-hover:text-accent transition-colors">{domain.nameAr}</h3>
                                    <p className="text-xs text-cyber-500 font-mono" dir="ltr">{domain.nameEn}</p>
                                </div>
                            </div>
                            <p className="text-cyber-400 text-sm leading-relaxed mb-4">{domain.descriptionAr}</p>
                            <div className="flex flex-wrap gap-2">
                                {domain.topics.map((t, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: `${domain.color}15`, color: domain.color, border: `1px solid ${domain.color}30` }}>
                                        {t.titleAr}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
