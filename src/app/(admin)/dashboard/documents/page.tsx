'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface DocRecord {
  id: string;
  serialNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  createdAt: string;
  template: { code: string; titleAr: string; category: string };
  submitter: { name: string; email: string; avatar?: string | null };
}

const STATUS = {
  PENDING:  { label: 'قيد المراجعة', color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' },
  APPROVED: { label: 'معتمد',        color: 'bg-green-400/10  text-green-400  border-green-400/30'  },
  REJECTED: { label: 'مرفوض',        color: 'bg-red-400/10    text-red-400    border-red-400/30'    },
  ARCHIVED: { label: 'مؤرشف',        color: 'bg-gray-400/10   text-gray-400   border-gray-400/30'   },
};

const CATEGORIES = ['All', 'Users', 'Instructors', 'Courses', 'Labs', 'Exams', 'Certificates', 'Technical'];

export default function AdminDocumentsPage() {
  const [docs, setDocs]         = useState<DocRecord[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter]   = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQ, setSearchQ]   = useState('');
  const [page, setPage]         = useState(1);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (statusFilter)   params.set('status',   statusFilter);
    if (categoryFilter && categoryFilter !== 'All') params.set('category', categoryFilter);

    const res  = await fetch(`/api/documents?${params}`);
    const json = await res.json();
    setDocs(json.documents ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const displayed = searchQ
    ? docs.filter(d =>
        d.serialNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
        d.submitter.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        d.template.titleAr.includes(searchQ)
      )
    : docs;

  const stats = {
    total:    total,
    pending:  docs.filter(d => d.status === 'PENDING').length,
    approved: docs.filter(d => d.status === 'APPROVED').length,
    rejected: docs.filter(d => d.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">📂 إدارة المستندات</h1>
            <p className="text-white/40 text-sm mt-1">Document Management System — CyberShield Academy</p>
          </div>
          <Link
            href="/dashboard/instructor/documents"
            className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400
                       hover:bg-cyan-500/20 transition-all text-sm font-medium"
          >
            ➕ تقديم مستند جديد
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي المستندات', value: stats.total,    icon: '📋', color: 'from-blue-500/20 to-blue-500/5',   border: 'border-blue-500/20' },
            { label: 'قيد المراجعة',     value: stats.pending,  icon: '⏳', color: 'from-yellow-500/20 to-yellow-500/5', border: 'border-yellow-500/20' },
            { label: 'معتمدة',            value: stats.approved, icon: '✅', color: 'from-green-500/20 to-green-500/5',  border: 'border-green-500/20' },
            { label: 'مرفوضة',           value: stats.rejected, icon: '❌', color: 'from-red-500/20 to-red-500/5',      border: 'border-red-500/20' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} p-4`}>
              <p className="text-2xl">{s.icon}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
              <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 بحث باسم المستند أو المُقدم..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white
                       placeholder-white/30 focus:outline-none focus:border-cyan-400/60 text-sm"
          />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm
                       focus:outline-none focus:border-cyan-400/60 cursor-pointer"
          >
            <option value="" className="bg-slate-900">جميع الحالات</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k} className="bg-slate-900">{v.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm
                       focus:outline-none focus:border-cyan-400/60 cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="bg-slate-900">{c === 'All' ? 'جميع الفئات' : c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs">
                  <th className="text-right px-4 py-3 font-medium">رقم المستند</th>
                  <th className="text-right px-4 py-3 font-medium">النموذج</th>
                  <th className="text-right px-4 py-3 font-medium">الفئة</th>
                  <th className="text-right px-4 py-3 font-medium">مقدم الطلب</th>
                  <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-white/30">
                      <div className="inline-block animate-spin text-2xl">⚙️</div>
                      <p className="mt-2 text-sm">جاري التحميل...</p>
                    </td>
                  </tr>
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-white/30">
                      <p className="text-3xl mb-2">📭</p>
                      <p className="text-sm">لا توجد مستندات تطابق البحث</p>
                    </td>
                  </tr>
                ) : displayed.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors
                                ${idx % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-cyan-400 text-xs">{doc.serialNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {doc.template.code}
                        </span>
                        <p className="text-white/70 text-xs mt-1">{doc.template.titleAr}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">{doc.template.category}</td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs">{doc.submitter.name}</p>
                      <p className="text-white/30 text-[10px]">{doc.submitter.email}</p>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {new Date(doc.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS[doc.status].color}`}>
                        {STATUS[doc.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/admin/documents/${doc.id}`}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70
                                     hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400
                                     transition-all text-xs"
                        >
                          عرض
                        </Link>
                        <a
                          href={`/dashboard/admin/documents/${doc.id}/print`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400
                                     hover:bg-red-500/20 transition-all text-xs"
                          title="تصدير PDF"
                        >
                          PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 15 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <p className="text-white/30 text-xs">إجمالي {total} مستند</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60
                             hover:bg-white/10 disabled:opacity-40 text-xs"
                >
                  السابق
                </button>
                <span className="px-3 py-1.5 text-white/40 text-xs">صفحة {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={displayed.length < 15}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60
                             hover:bg-white/10 disabled:opacity-40 text-xs"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
