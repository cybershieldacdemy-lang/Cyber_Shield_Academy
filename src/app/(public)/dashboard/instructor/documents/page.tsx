'use client';

import { useEffect, useState, useCallback } from 'react';
import DocumentForm from '@/components/documents/DocumentForm';

interface Template {
  id: string; code: string; titleAr: string; titleEn: string; category: string; schema: string;
}
interface DocRecord {
  id: string; serialNumber: string; status: string; createdAt: string;
  template: { code: string; titleAr: string; category: string };
}

const STATUS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:  { label: 'قيد المراجعة', color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30', icon: '⏳' },
  APPROVED: { label: 'معتمد',        color: 'bg-green-400/10  text-green-400  border-green-400/30',  icon: '✅' },
  REJECTED: { label: 'مرفوض',        color: 'bg-red-400/10    text-red-400    border-red-400/30',    icon: '❌' },
  ARCHIVED: { label: 'مؤرشف',        color: 'bg-gray-400/10   text-gray-400   border-gray-400/30',   icon: '📦' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Users: '👤', Instructors: '🧑‍🏫', Courses: '📚', Labs: '🧪',
  Exams: '📝', Certificates: '🏅', Technical: '🔧',
};

export default function InstructorDocumentsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [myDocs, setMyDocs]       = useState<DocRecord[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [tab, setTab]             = useState<'submit' | 'history'>('submit');

  const loadTemplates = useCallback(async () => {
    const res  = await fetch('/api/documents/templates');
    const json = await res.json();
    setTemplates(json.templates ?? []);
  }, []);

  const loadDocs = useCallback(async () => {
    const res  = await fetch('/api/documents?limit=50');
    const json = await res.json();
    setMyDocs(json.documents ?? []);
  }, []);

  useEffect(() => {
    loadTemplates();
    loadDocs();
  }, [loadTemplates, loadDocs]);

  // Group templates by category
  const grouped = templates.reduce<Record<string, Template[]>>((acc, t) => {
    acc[t.category] = [...(acc[t.category] || []), t];
    return acc;
  }, {});

  const handleSuccess = (doc: Record<string, unknown>) => {
    const serial = (doc as { serialNumber: string }).serialNumber;
    setSuccess(`✅ تم إرسال المستند بنجاح! الرقم المرجعي: ${serial}`);
    setActiveTemplate(null);
    loadDocs();
    setTimeout(() => setSuccess(null), 8000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">📄 نظام إدارة المستندات</h1>
          <p className="text-white/40 text-sm mt-1">قدّم طلباتك ومستنداتك وتابع حالتها بسهولة</p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {[
            { key: 'submit',  label: '➕ تقديم مستند' },
            { key: 'history', label: `📋 مستنداتي (${myDocs.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as 'submit' | 'history'); setActiveTemplate(null); }}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px
                ${tab === t.key
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-400/5'
                  : 'text-white/40 border-transparent hover:text-white/60'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Submit Tab */}
        {tab === 'submit' && (
          <>
            {!activeTemplate ? (
              <div className="space-y-6">
                {Object.entries(grouped).map(([category, tmps]) => (
                  <div key={category}>
                    <h2 className="text-white/60 text-xs font-bold mb-3 flex items-center gap-2">
                      <span>{CATEGORY_ICONS[category] ?? '📁'}</span>
                      <span>{category}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tmps.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setActiveTemplate(t)}
                          className="text-right p-4 rounded-xl bg-white/[0.03] border border-white/10
                                     hover:bg-white/[0.07] hover:border-cyan-500/30 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-mono text-cyan-400 mb-1 block">{t.code}</span>
                              <p className="text-white text-sm font-medium leading-snug">{t.titleAr}</p>
                              <p className="text-white/30 text-xs mt-0.5">{t.titleEn}</p>
                            </div>
                            <span className="text-white/20 group-hover:text-cyan-400 transition-colors text-lg mt-1">←</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <DocumentForm
                  template={activeTemplate}
                  onSuccess={handleSuccess}
                  onCancel={() => setActiveTemplate(null)}
                />
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            {myDocs.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">لم تقدّم أي مستندات بعد</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-xs">
                    <th className="text-right px-4 py-3">رقم المستند</th>
                    <th className="text-right px-4 py-3">النموذج</th>
                    <th className="text-right px-4 py-3">التاريخ</th>
                    <th className="text-right px-4 py-3">الحالة</th>
                    <th className="text-right px-4 py-3">عرض</th>
                  </tr>
                </thead>
                <tbody>
                  {myDocs.map(doc => {
                    const st = STATUS[doc.status] ?? STATUS['PENDING'];
                    return (
                      <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="px-4 py-3 font-mono text-cyan-400 text-xs">{doc.serialNumber}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {doc.template.code}
                          </span>
                          <p className="text-white/60 text-xs mt-0.5">{doc.template.titleAr}</p>
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs">
                          {new Date(doc.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${st.color}`}>
                            {st.icon} {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`/dashboard/admin/documents/${doc.id}`}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                                       text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-xs"
                          >
                            عرض
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
