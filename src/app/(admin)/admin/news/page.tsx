"use client";
import { useEffect, useState, useCallback } from "react";

interface NewsItem {
    id: number; title_ar: string; title_en: string; severity: string; cve_id: string; affected: string; source: string; created_at: string;
}

export default function AdminNewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<NewsItem | null>(null);
    const [form, setForm] = useState({ title_ar: "", title_en: "", content_ar: "", severity: "medium", cve_id: "", affected: "", source: "" });
    const limit = 10;

    const fetchNews = useCallback(async () => {
        const res = await fetch(`/api/news?limit=${limit}&offset=${page * limit}&search=${search}`);
        const data = await res.json();
        setNews(data.news || []);
        setTotal(data.total || 0);
    }, [page, search]);

    useEffect(() => { fetchNews(); }, [fetchNews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editing ? "PUT" : "POST";
        const url = editing ? `/api/news/${editing.id}` : "/api/news";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, published: 1 }) });
        setShowForm(false); setEditing(null);
        setForm({ title_ar: "", title_en: "", content_ar: "", severity: "medium", cve_id: "", affected: "", source: "" });
        fetchNews();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;
        await fetch(`/api/news/${id}`, { method: "DELETE" });
        fetchNews();
    };

    const severityBadge = (s: string) => {
        const colors: Record<string, string> = { critical: "#e53e3e", high: "#dd6b20", medium: "#d69e2e", low: "#2c7a7b" };
        return <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: `${colors[s] || '#888'}20`, color: colors[s] || '#888' }}>{s.toUpperCase()}</span>;
    };

    const inputStyle = { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(200,150,46,0.15)' };
    const inputCls = "w-full px-3 py-2 rounded-lg text-cyber-100 placeholder-cyber-500 outline-none text-sm";

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold"><span className="gradient-text">🚨 إدارة أخبار الثغرات</span></h1>
                <button onClick={() => { setShowForm(!showForm); setEditing(null); }} className="btn-primary !py-2 !px-4 !text-sm">
                    {showForm ? "✕ إلغاء" : "＋ إضافة خبر"}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 mb-6">
                    <h3 className="text-lg font-bold text-cyber-100 mb-4">{editing ? "تعديل الخبر" : "خبر جديد"}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className={inputCls} style={inputStyle} placeholder="العنوان بالعربية" value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} required />
                        <input className={inputCls} style={inputStyle} placeholder="Title in English" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} dir="ltr" required />
                        <input className={inputCls} style={inputStyle} placeholder="CVE ID (مثل: CVE-2024-1234)" value={form.cve_id} onChange={e => setForm({ ...form, cve_id: e.target.value })} dir="ltr" />
                        <select className={inputCls} style={inputStyle} value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                            <option value="critical">حرج - Critical</option>
                            <option value="high">عالي - High</option>
                            <option value="medium">متوسط - Medium</option>
                            <option value="low">منخفض - Low</option>
                        </select>
                        <input className={inputCls} style={inputStyle} placeholder="الأنظمة المتأثرة" value={form.affected} onChange={e => setForm({ ...form, affected: e.target.value })} />
                        <input className={inputCls} style={inputStyle} placeholder="المصدر" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} dir="ltr" />
                        <div className="md:col-span-2">
                            <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={4} placeholder="تفاصيل الخبر..." value={form.content_ar} onChange={e => setForm({ ...form, content_ar: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="btn-primary !py-2 !px-6 !text-sm">{editing ? "💾 حفظ" : "＋ نشر"}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mb-4">
                <input className={inputCls} style={inputStyle} placeholder="🔍 بحث بالعنوان أو CVE..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-cyber-800">
                        <th className="p-3 text-right text-cyber-400">العنوان</th>
                        <th className="p-3 text-right text-cyber-400">CVE</th>
                        <th className="p-3 text-right text-cyber-400">الخطورة</th>
                        <th className="p-3 text-right text-cyber-400">المتأثرة</th>
                        <th className="p-3 text-right text-cyber-400">إجراءات</th>
                    </tr></thead>
                    <tbody>
                        {news.map(n => (
                            <tr key={n.id} className="border-b border-cyber-800/50 hover:bg-white/3">
                                <td className="p-3 text-cyber-200">{n.title_ar}</td>
                                <td className="p-3 text-cyber-300 font-mono text-xs" dir="ltr">{n.cve_id || '—'}</td>
                                <td className="p-3">{severityBadge(n.severity)}</td>
                                <td className="p-3 text-cyber-400 text-xs">{n.affected || '—'}</td>
                                <td className="p-3">
                                    <button onClick={() => { setEditing(n); setForm({ title_ar: n.title_ar, title_en: n.title_en, content_ar: "", severity: n.severity, cve_id: n.cve_id, affected: n.affected, source: n.source }); setShowForm(true); }} className="text-accent hover:underline text-xs ml-2">تعديل</button>
                                    <button onClick={() => handleDelete(n.id)} className="text-red-400 hover:underline text-xs">حذف</button>
                                </td>
                            </tr>
                        ))}
                        {news.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-cyber-500">لا توجد أخبار</td></tr>}
                    </tbody>
                </table>
            </div>

            {total > limit && (
                <div className="flex justify-center gap-2 mt-4">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-30">← السابق</button>
                    <span className="text-cyber-400 text-sm pt-1">{page + 1} / {Math.ceil(total / limit)}</span>
                    <button disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-30">التالي →</button>
                </div>
            )}
        </div>
    );
}
