"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface Term {
    id: number;
    termEn: string;
    termAr: string;
    definitionEn: string;
    definitionAr: string;
    example: string;
    level: string;
    categoryId: number;
}

export default function AdminTerms() {
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Term>>({});
    const [isEditing, setIsEditing] = useState(false);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchTerms = async () => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;
            const res = await fetch(`/api/terms?limit=${limit}&offset=${offset}&q=${search}`);
            const data = await res.json();

            const termList = Array.isArray(data.terms) ? data.terms : [];
            const mapped = termList.map((t: any) => ({
                ...t,
                termEn: t.term_en,
                termAr: t.term_ar,
                definitionEn: t.definition_en,
                definitionAr: t.definition_ar,
                categoryId: t.category_id
            }));
            setTerms(mapped);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch terms', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTerms();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing ? `/api/terms/${formData.id}` : '/api/terms';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({});
                setIsEditing(false);
                fetchTerms();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await fetch(`/api/terms/${id}`, { method: 'DELETE' });
            fetchTerms();
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (term: Term) => {
        setFormData(term);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAdd = () => {
        setFormData({ level: 'مبتدئ', categoryId: 1 });
        setIsEditing(false);
        setShowModal(true);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="animate-fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-cyber-100 mb-1">إدارة المصطلحات</h1>
                    <p className="text-cyber-400 text-sm">إدارة مكتبة المصطلحات ({total} مصطلح)</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="flex bg-[#0b0e14] border border-cyber-800 rounded-xl p-2.5 w-full md:w-64">
                         <Search size={16} className="text-cyber-500 ml-2" />
                         <input
                            type="text"
                            placeholder="بحث..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-transparent text-sm w-full outline-none text-white focus:placeholder-cyber-600"
                        />
                    </div>
                    <button onClick={openAdd} className="px-4 py-2 bg-accent text-cyber-100 font-bold rounded-xl hover:bg-accent-dim transition-colors flex items-center gap-2 whitespace-nowrap">
                        <Plus size={18} /> إضافة
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden mb-4 border border-cyber-800/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-[#0b0e14] text-cyber-500 text-xs uppercase border-b border-cyber-800/50">
                            <tr>
                                <th className="px-6 py-4">المصطلح (EN)</th>
                                <th className="px-6 py-4">المصطلح (AR)</th>
                                <th className="px-6 py-4">المستوى</th>
                                <th className="px-6 py-4">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-800/20">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-8 text-cyber-400">جاري التحميل...</td></tr>
                            ) : terms.map((term) => (
                                <tr key={term.id} className="hover:bg-cyber-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-cyber-100 font-medium font-mono text-sm" dir="ltr">{term.termEn}</td>
                                    <td className="px-6 py-4 text-cyber-200">{term.termAr}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${term.level === 'مبتدئ' ? 'text-accent border-accent/20 bg-accent/5' :
                                            term.level === 'متوسط' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                                                'text-purple-400 border-purple-400/20 bg-purple-400/5'
                                            }`}>
                                            {term.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                                            <button onClick={() => openEdit(term)} className="p-1.5 rounded-lg hover:bg-neon-blue/20 text-neon-blue transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(term.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 rounded-lg bg-cyber-900 border border-cyber-800 text-cyber-300 disabled:opacity-50 hover:border-neon-blue transition-colors text-sm"
                    >
                        السابق
                    </button>
                    <span className="px-4 py-2 text-cyber-500 text-sm">
                        صفحة {page} من {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 rounded-lg bg-cyber-900 border border-cyber-800 text-cyber-300 disabled:opacity-50 hover:border-neon-blue transition-colors text-sm"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="glass-card w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto border border-cyber-700">
                        <h2 className="text-xl font-bold text-cyber-100 mb-6 border-b border-cyber-800 pb-3">{isEditing ? 'تعديل مصطلح' : 'إضافة مصطلح جديد'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-cyber-500 text-xs mb-1">المصطلح (EN)</label>
                                    <input required className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-2.5 text-white focus:border-accent outline-none"
                                        value={formData.termEn || ''} onChange={e => setFormData({ ...formData, termEn: e.target.value })} dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-cyber-500 text-xs mb-1">المصطلح (AR)</label>
                                    <input required className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-2.5 text-white focus:border-accent outline-none"
                                        value={formData.termAr || ''} onChange={e => setFormData({ ...formData, termAr: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-cyber-500 text-xs mb-1">المستوى</label>
                                    <select className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-2.5 text-white outline-none focus:border-accent"
                                        value={formData.level || 'مبتدئ'} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                                        <option value="مبتدئ">مبتدئ</option>
                                        <option value="متوسط">متوسط</option>
                                        <option value="متقدم">متقدم</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-cyber-500 text-xs mb-1">ID التصنيف</label>
                                    <input type="number" required className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-2.5 text-white outline-none focus:border-accent"
                                        value={formData.categoryId || 1} onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-cyber-500 text-xs mb-1">التعريف (AR)</label>
                                <textarea required className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-3 text-white h-24 focus:border-accent outline-none resize-none"
                                    value={formData.definitionAr || ''} onChange={e => setFormData({ ...formData, definitionAr: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-cyber-500 text-xs mb-1">التعريف (EN)</label>
                                <textarea required className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-3 text-white h-24 focus:border-accent outline-none resize-none"
                                    value={formData.definitionEn || ''} onChange={e => setFormData({ ...formData, definitionEn: e.target.value })} dir="ltr" />
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-cyber-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-cyber-400 hover:text-white transition-colors">إلغاء</button>
                                <button type="submit" className="px-8 py-2 rounded-lg bg-accent text-white font-bold hover:bg-accent-dim transition-all shadow-lg shadow-accent/20">حفظ المصطلح</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
