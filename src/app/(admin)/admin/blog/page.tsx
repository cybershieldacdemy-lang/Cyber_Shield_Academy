"use client";
import { useEffect, useState, useCallback } from "react";

interface Post {
    id: number; title_ar: string; title_en: string; category: string; author: string; views: number; published: number; created_at: string;
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Post | null>(null);
    const [form, setForm] = useState({ title_ar: "", title_en: "", content_ar: "", content_en: "", excerpt_ar: "", category: "awareness", tags: "", author: "الأكاديمية" });
    const limit = 10;

    const fetchPosts = useCallback(async () => {
        const res = await fetch(`/api/blog?limit=${limit}&offset=${page * limit}&search=${search}`);
        const data = await res.json();
        setPosts(data.posts || []);
        setTotal(data.total || 0);
    }, [page, search]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editing ? "PUT" : "POST";
        const url = editing ? `/api/blog/${editing.id}` : "/api/blog";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, published: 1 }) });
        setShowForm(false); setEditing(null);
        setForm({ title_ar: "", title_en: "", content_ar: "", content_en: "", excerpt_ar: "", category: "awareness", tags: "", author: "الأكاديمية" });
        fetchPosts();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
        await fetch(`/api/blog/${id}`, { method: "DELETE" });
        fetchPosts();
    };

    const inputStyle = { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(200,150,46,0.15)' };
    const inputCls = "w-full px-3 py-2 rounded-lg text-cyber-100 placeholder-cyber-500 outline-none text-sm";

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold"><span className="gradient-text">📝 إدارة المقالات</span></h1>
                <button onClick={() => { setShowForm(!showForm); setEditing(null); }} className="btn-primary !py-2 !px-4 !text-sm">
                    {showForm ? "✕ إلغاء" : "＋ إضافة مقال"}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 mb-6">
                    <h3 className="text-lg font-bold text-cyber-100 mb-4">{editing ? "تعديل المقال" : "مقال جديد"}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className={inputCls} style={inputStyle} placeholder="العنوان بالعربية" value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} required />
                            <input className={inputCls} style={inputStyle} placeholder="Title in English" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} dir="ltr" required />
                            <select className={inputCls} style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="awareness">توعية</option>
                                <option value="tutorial">شرح</option>
                                <option value="news">أخبار</option>
                                <option value="tools">أدوات</option>
                            </select>
                            <input className={inputCls} style={inputStyle} placeholder="الكاتب" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                        </div>
                        <input className={inputCls} style={inputStyle} placeholder="ملخص المقال" value={form.excerpt_ar} onChange={e => setForm({ ...form, excerpt_ar: e.target.value })} />
                        <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={6} placeholder="محتوى المقال بالعربية..." value={form.content_ar} onChange={e => setForm({ ...form, content_ar: e.target.value })} />
                        <button type="submit" className="btn-primary !py-2 !px-6 !text-sm">{editing ? "💾 حفظ" : "＋ نشر"}</button>
                    </form>
                </div>
            )}

            <div className="mb-4">
                <input className={inputCls} style={inputStyle} placeholder="🔍 بحث في المقالات..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-cyber-800">
                        <th className="p-3 text-right text-cyber-400">العنوان</th>
                        <th className="p-3 text-right text-cyber-400">التصنيف</th>
                        <th className="p-3 text-right text-cyber-400">الكاتب</th>
                        <th className="p-3 text-right text-cyber-400">المشاهدات</th>
                        <th className="p-3 text-right text-cyber-400">إجراءات</th>
                    </tr></thead>
                    <tbody>
                        {posts.map(p => (
                            <tr key={p.id} className="border-b border-cyber-800/50 hover:bg-white/3">
                                <td className="p-3 text-cyber-200">{p.title_ar}<br /><span className="text-xs text-cyber-500" dir="ltr">{p.title_en}</span></td>
                                <td className="p-3"><span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(200,150,46,0.1)', color: '#c8962e' }}>{p.category}</span></td>
                                <td className="p-3 text-cyber-300">{p.author}</td>
                                <td className="p-3 text-cyber-300">{p.views}</td>
                                <td className="p-3">
                                    <button onClick={() => { setEditing(p); setForm({ title_ar: p.title_ar, title_en: p.title_en, content_ar: "", content_en: "", excerpt_ar: "", category: p.category, tags: "", author: p.author }); setShowForm(true); }} className="text-accent hover:underline text-xs ml-2">تعديل</button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline text-xs">حذف</button>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-cyber-500">لا توجد مقالات</td></tr>}
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
