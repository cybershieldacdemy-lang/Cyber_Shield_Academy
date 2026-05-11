"use client";
import { useState, useEffect } from "react";

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/news")
            .then(res => res.json())
            .then(data => setNews(data.news || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getSeverityDetails = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return { label: 'حرجة', color: '#c53030' };
            case 'high': return { label: 'عالية', color: '#dd6b20' };
            case 'medium': return { label: 'متوسطة', color: '#c8962e' };
            case 'low': return { label: 'منخفضة', color: '#3182ce' };
            default: return { label: 'غير محدد', color: '#718096' };
        }
    };

    return (
        <div style={{ paddingTop: "80px" }} className="min-h-screen">
            <div className="page-header">
                <div className="text-5xl mb-4">🚨</div>
                <h1>أخبار <span className="gradient-text">الثغرات والهجمات</span></h1>
                <p>آخر الأخبار والتنبيهات الأمنية حول الثغرات والهجمات السيبرانية العالمية</p>
            </div>
            <div className="section-container">
                <div className="space-y-5">
                    {loading ? (
                        <div className="text-center py-20 animate-pulse text-cyber-500">جاري جمع بيانات الهجمات...</div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">لا توجد سجلات حالياً</div>
                    ) : news.map((item) => {
                        const { label, color } = getSeverityDetails(item.severity);
                        return (
                            <article key={item.id} className="glass-card p-6">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}>{label}</span>
                                    {item.cve_id && <span className="text-xs text-cyber-500 font-mono" dir="ltr">{item.cve_id}</span>}
                                    <span className="text-xs text-cyber-500">{new Date(item.created_at + 'Z').toLocaleDateString('ar-EG')}</span>
                                </div>
                                <h3 className="font-bold text-lg text-cyber-100 mb-2">{item.title_ar}</h3>
                                <p className="text-cyber-400 text-sm leading-relaxed mb-3">{item.content_ar}</p>
                                {item.affected && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-cyber-500">الأنظمة المتأثرة:</span>
                                        <span className="text-xs px-2 py-1 rounded-md text-cyber-300" style={{ background: 'rgba(200,150,46,0.08)', border: '1px solid rgba(200,150,46,0.15)' }} dir="ltr">{item.affected}</span>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
