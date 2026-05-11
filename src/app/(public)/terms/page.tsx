"use client";
import { useState, useMemo, useEffect } from "react";
import { domains } from "@/data/domains-data";
import { SmartDataView } from "@/components/ui/SmartDataView";

interface Term {
    id: number;
    term_en: string;
    term_ar: string;
    definition_ar: string;
    definition_en: string;
    example: string;
    level: string;
    category_id: number;
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const levelMap: Record<string, string> = {
    "beginner": "مبتدئ",
    "مبتدئ": "مبتدئ",
    "intermediate": "متوسط",
    "متوسط": "متوسط",
    "advanced": "متقدم",
    "متقدم": "متقدم",
};

export default function TermsPage() {
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedLetter, setSelectedLetter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(0);

    const fetchTerms = () => {
        setLoading(true);
        setError(null);
        fetch("/api/terms?limit=2000")
            .then((res) => {
                if (!res.ok) throw new Error("فشل جلب المصطلحات");
                return res.json();
            })
            .then((data) => {
                const rawTerms = data.terms || [];
                const uniqueTerms = Array.from(
                    new Map(rawTerms.map((item: Term) => [item.id, item])).values()
                ) as Term[];
                setTerms(uniqueTerms);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "حدث خطأ في الاتصال بالخادم");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    const getLevel = (t: Term) => levelMap[t.level] || t.level;

    const filtered = useMemo(() => {
        return terms.filter((t) => {
            if (search && !t.term_en.toLowerCase().includes(search.toLowerCase()) && !t.term_ar.includes(search) && !t.definition_ar.includes(search)) return false;
            if (selectedLetter && !t.term_en.toUpperCase().startsWith(selectedLetter)) return false;
            if (selectedCategory && t.category_id !== selectedCategory) return false;
            return true;
        });
    }, [terms, search, selectedLetter, selectedCategory]);

    const beginnerTerms = useMemo(() => filtered.filter(t => getLevel(t) === "مبتدئ"), [filtered]);
    const intermediateTerms = useMemo(() => filtered.filter(t => getLevel(t) === "متوسط"), [filtered]);
    const advancedTerms = useMemo(() => filtered.filter(t => getLevel(t) === "متقدم"), [filtered]);

    const getDomainName = (catId: number) => domains.find(d => d.id === catId)?.nameAr || "";

    const getLevelClass = (level: string) => {
        const mapped = levelMap[level] || level;
        if (mapped === "مبتدئ") return "badge-beginner";
        if (mapped === "متوسط") return "badge-intermediate";
        return "badge-advanced";
    };

    const levelSections = [
        {
            key: "beginner",
            title: "المصطلحات المبتدئة",
            subtitle: "مصطلحات أساسية لبداية رحلتك في الأمن السيبراني",
            icon: "🌱",
            terms: beginnerTerms,
            color: "#2c7a7b",
            gradient: "linear-gradient(135deg, rgba(56,178,172,0.08), rgba(56,178,172,0.02))",
            border: "rgba(56,178,172,0.2)",
        },
        {
            key: "intermediate",
            title: "المصطلحات المتوسطة",
            subtitle: "مصطلحات تتطلب معرفة مسبقة بأساسيات الأمن السيبراني",
            icon: "⚡",
            terms: intermediateTerms,
            color: "#2b6cb0",
            gradient: "linear-gradient(135deg, rgba(45,165,199,0.08), rgba(45,165,199,0.02))",
            border: "rgba(45,165,199,0.2)",
        },
        {
            key: "advanced",
            title: "المصطلحات المتقدمة",
            subtitle: "مصطلحات متخصصة للمحترفين والخبراء",
            icon: "🔥",
            terms: advancedTerms,
            color: "#6b46c1",
            gradient: "linear-gradient(135deg, rgba(128,90,213,0.08), rgba(128,90,213,0.02))",
            border: "rgba(128,90,213,0.2)",
        },
    ];

    return (
        <div style={{ paddingTop: "80px" }}>
            <div className="page-header">
                <div className="text-5xl mb-4">📚</div>
                <h1>المصطلحات <span className="gradient-text">السيبرانية</span></h1>
                <p>قاموس شامل لأهم مصطلحات الأمن السيبراني بالعربية والإنجليزية مع أمثلة عملية</p>
            </div>

            <div className="section-container">
                <SmartDataView
                    loading={loading}
                    error={error}
                    isEmpty={terms.length === 0}
                    isFilterEmpty={filtered.length === 0 && terms.length > 0}
                    emptyType={terms.length === 0 ? "no-data" : "filter"}
                    emptyConfig={{
                        title: "لا توجد مصطلحات مسجلة",
                        desc: "قاعدة بيانات المصطلحات فارغة حالياً.",
                        action: terms.length > 0 ? (
                            <button
                                onClick={() => { setSearch(""); setSelectedLetter(""); setSelectedCategory(0); }}
                                className="mt-4 px-6 py-2 bg-accent text-white font-bold rounded-lg hover:bg-accent-dim transition-colors"
                            >
                                مسح الفلاتر
                            </button>
                        ) : undefined
                    }}
                    onRetry={fetchTerms}
                >
                    {/* Search */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن مصطلح بالعربية أو الإنجليزية..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl text-cyber-100 placeholder-cyber-500 outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(200,150,46,0.15)' }}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-500">🔍</span>
                        </div>
                    </div>

                    {/* A-Z Index */}
                    <div className="flex flex-wrap justify-center gap-1 mb-6">
                        <button onClick={() => setSelectedLetter("")}
                            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${!selectedLetter ? 'bg-accent text-white' : 'text-cyber-400 hover:text-accent border border-cyber-700 hover:border-accent/30'}`}>
                            الكل
                        </button>
                        {alphabet.map((l) => (
                            <button key={l} onClick={() => setSelectedLetter(l === selectedLetter ? "" : l)}
                                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${selectedLetter === l ? 'bg-accent text-white' : 'text-cyber-400 hover:text-accent border border-cyber-700 hover:border-accent/30'}`}>
                                {l}
                            </button>
                        ))}
                    </div>

                    {/* Category Filter */}
                    <div className="flex justify-center mb-10">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))}
                            className="px-4 py-2 rounded-xl text-sm text-cyber-300 outline-none cursor-pointer" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(200,150,46,0.15)' }}>
                            <option value={0}>جميع التخصصات</option>
                            {domains.map((d) => <option key={d.id} value={d.id}>{d.nameAr}</option>)}
                        </select>
                    </div>

                    {/* Count */}
                    <p className="text-center text-cyber-500 text-sm mb-10">
                        عرض <span className="text-accent font-bold">{filtered.length}</span> مصطلح من أصل <span className="text-accent font-bold">{terms.length}</span>
                        {" — "}
                        <span style={{ color: "#2c7a7b" }}>{beginnerTerms.length} مبتدئ</span>
                        {" • "}
                        <span style={{ color: "#2b6cb0" }}>{intermediateTerms.length} متوسط</span>
                        {" • "}
                        <span style={{ color: "#6b46c1" }}>{advancedTerms.length} متقدم</span>
                    </p>

                    {/* Grouped by Level */}
                    {levelSections.map((section) => (
                        section.terms.length > 0 && (
                            <div key={section.key} className="mb-12">
                                {/* Section Header */}
                                <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl" style={{ background: section.gradient, border: `1px solid ${section.border}` }}>
                                    <div className="text-4xl">{section.icon}</div>
                                    <div>
                                        <h2 className="text-xl font-bold" style={{ color: section.color }}>{section.title}</h2>
                                        <p className="text-cyber-400 text-sm">{section.subtitle} — <span className="font-bold" style={{ color: section.color }}>{section.terms.length}</span> مصطلح</p>
                                    </div>
                                </div>

                                {/* Terms Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.terms.map((term) => (
                                        <div key={term.id} className="glass-card p-6 hover:scale-[1.01] transition-transform">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-cyber-100 text-lg" dir="ltr">{term.term_en}</h3>
                                                    <p className="text-accent font-semibold text-sm">{term.term_ar}</p>
                                                </div>
                                                <span className={`badge ${getLevelClass(term.level)}`}>{getLevel(term)}</span>
                                            </div>
                                            <p className="text-cyber-300 text-sm leading-relaxed mb-2">{term.definition_ar}</p>
                                            <p className="text-cyber-500 text-xs leading-relaxed mb-3" dir="ltr">{term.definition_en}</p>
                                            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(200,150,46,0.05)' }}>
                                                <span className="text-accent text-xs mt-0.5">💡</span>
                                                <p className="text-cyber-400 text-xs leading-relaxed">{term.example}</p>
                                            </div>
                                            <div className="mt-3">
                                                <span className="text-xs text-cyber-500">{getDomainName(term.category_id)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </SmartDataView>
            </div>
        </div>
    );
}
