'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocumentViewer from '@/components/documents/DocumentViewer';

interface DocDetail {
  id: string;
  serialNumber: string;
  status: string;
  data: string;
  signature: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  template: { code: string; titleAr: string; titleEn: string; category: string; schema: string };
  submitter: { name: string; email: string; avatar?: string | null };
  reviewer?: { name: string } | null;
  logs?: Array<{
    id: string; action: string; notes: string | null; createdAt: string;
    user: { name: string; role: string; avatar?: string | null };
  }>;
}

export default function AdminDocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router   = useRouter();
  const [doc, setDoc]         = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes]     = useState('');
  const [acting, setActing]   = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(j => { setDoc(j.document); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: 'APPROVED' | 'REJECTED' | 'ARCHIVED') => {
    setActing(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDoc(json.document);
      setFeedback({ type: 'success', msg: `تم ${action === 'APPROVED' ? 'اعتماد' : action === 'REJECTED' ? 'رفض' : 'أرشفة'} المستند بنجاح` });
    } catch (e: unknown) {
      setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'حدث خطأ' });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center text-white/40">
          <div className="text-4xl animate-spin inline-block">⚙️</div>
          <p className="mt-3">جاري تحميل المستند...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center text-white/40">
          <p className="text-3xl mb-2">📭</p>
          <p>المستند غير موجود</p>
          <button onClick={() => router.back()} className="mt-4 text-cyan-400 hover:underline text-sm">العودة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          ← العودة للقائمة
        </button>

        {/* Feedback banner */}
        {feedback && (
          <div className={`rounded-xl px-4 py-3 text-sm border ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {feedback.type === 'success' ? '✅' : '⚠️'} {feedback.msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Document Viewer */}
          <div className="lg:col-span-2">
            <DocumentViewer document={doc} />
          </div>

          {/* Right: Admin Actions */}
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm">🛡️ إجراءات المراجع</h3>

              <div>
                <label className="block text-white/40 text-xs mb-1.5">ملاحظات المراجعة (اختياري)</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm
                             placeholder-white/20 focus:outline-none focus:border-cyan-400/50 resize-none"
                  placeholder="أضف ملاحظاتك هنا..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  disabled={doc.status !== 'PENDING'}
                />
              </div>

              {doc.status === 'PENDING' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction('APPROVED')}
                    disabled={acting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500
                               text-white font-bold text-sm hover:from-green-400 hover:to-emerald-400
                               disabled:opacity-50 transition-all"
                  >
                    ✅ اعتماد المستند
                  </button>
                  <button
                    onClick={() => handleAction('REJECTED')}
                    disabled={acting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500
                               text-white font-bold text-sm hover:from-red-400 hover:to-rose-400
                               disabled:opacity-50 transition-all"
                  >
                    ❌ رفض المستند
                  </button>
                  <button
                    onClick={() => handleAction('ARCHIVED')}
                    disabled={acting}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10
                               text-white/60 font-medium text-sm hover:bg-white/10 disabled:opacity-50 transition-all"
                  >
                    📦 أرشفة
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-white/40 text-xs">
                    تم اتخاذ الإجراء بالفعل على هذا المستند.
                  </p>
                </div>
              )}
            </div>

            {/* Document meta card */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="text-white/60 font-bold">معلومات إضافية</h3>
              <div className="space-y-2 text-white/50">
                <div className="flex justify-between">
                  <span>المُقدم</span><span className="text-white">{doc.submitter.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>البريد</span><span className="text-white/60 font-mono">{doc.submitter.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>النموذج</span><span className="text-cyan-400">{doc.template.code}</span>
                </div>
                <div className="flex justify-between">
                  <span>آخر تحديث</span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
