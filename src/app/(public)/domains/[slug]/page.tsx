import { domains } from "@/data/domains-data";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
    return domains.map((d) => ({ slug: d.slug }));
}

export default async function DomainDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const domain = domains.find((d) => d.slug === slug);
    if (!domain) return notFound();

    return (
        <div style={{ paddingTop: '80px' }}>
            <div className="page-header">
                <div className="text-6xl mb-4">{domain.icon}</div>
                <h1><span className="gradient-text">{domain.nameAr}</span></h1>
                <p className="font-mono text-cyber-400 mb-2" dir="ltr">{domain.nameEn}</p>
                <p>{domain.descriptionAr}</p>
            </div>

            <section className="section-container">
                {/* English Description */}
                <div className="glass-card p-8 max-w-4xl mx-auto mb-10">
                    <h2 className="text-lg font-bold text-cyber-200 mb-3">Description</h2>
                    <p className="text-cyber-400 leading-relaxed" dir="ltr">{domain.descriptionEn}</p>
                </div>

                {/* Topics */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">المواضيع <span className="gradient-text">الرئيسية</span></h2>
                    <div className="space-y-5">
                        {domain.topics.map((topic, i) => (
                            <div key={i} className="glass-card p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black" style={{ background: `${domain.color}20`, color: domain.color, border: `1px solid ${domain.color}40` }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-cyber-100">{topic.titleAr}</h3>
                                        <p className="text-xs text-cyber-500 font-mono" dir="ltr">{topic.titleEn}</p>
                                    </div>
                                </div>
                                <p className="text-cyber-400 text-sm leading-relaxed mr-13">{topic.descAr}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="text-center mt-12">
                    <Link href="/domains" className="btn-secondary">
                        ← العودة لجميع التخصصات
                    </Link>
                </div>
            </section>
        </div>
    );
}
