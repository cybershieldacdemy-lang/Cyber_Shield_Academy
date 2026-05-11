'use client';

interface DocumentViewerProps {
  document: {
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
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:  { label: 'قيد المراجعة', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: '⏳' },
  APPROVED: { label: 'معتمد',        color: 'text-green-400  bg-green-400/10  border-green-400/30',  icon: '✅' },
  REJECTED: { label: 'مرفوض',        color: 'text-red-400    bg-red-400/10    border-red-400/30',    icon: '❌' },
  ARCHIVED: { label: 'مؤرشف',        color: 'text-gray-400   bg-gray-400/10   border-gray-400/30',   icon: '📦' },
};

const ACTION_LABELS: Record<string, string> = {
  CREATED:  'إنشاء المستند',
  SUBMITTED: 'رفع المستند',
  REVIEWED: 'مراجعة',
  APPROVED: 'اعتماد',
  REJECTED: 'رفض',
  ARCHIVED: 'أرشفة',
};

export default function DocumentViewer({ document: doc }: DocumentViewerProps) {
  const fields = JSON.parse(doc.template.schema) as Array<{
    name: string; labelAr: string; labelEn: string;
  }>;
  const data = JSON.parse(doc.data) as Record<string, string>;
  const status = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG['PENDING'];

  const handlePrint = () => window.open(`/dashboard/admin/documents/${doc.id}/print`, '_blank');

  return (
    <div className="max-w-3xl mx-auto" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h2 className="text-white font-bold text-lg">📄 عرض المستند</h2>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10
                     border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/20 hover:to-blue-500/20
                     transition-all text-sm font-medium"
        >
          📥 تصدير PDF
        </button>
      </div>

      {/* Document Paper */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden print:shadow-none print:border-gray-300">

        {/* Document Header */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {doc.template.code}
                </span>
                <span className="text-xs text-white/40 border-r border-white/20 pr-2">
                  {doc.template.category}
                </span>
              </div>
              <h1 className="text-white text-xl font-bold">{doc.template.titleAr}</h1>
              <p className="text-white/40 text-sm mt-1">{doc.template.titleEn}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>
        </div>

        {/* Document Meta */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-8 py-5 border-b border-white/10">
          <div>
            <p className="text-white/40 text-xs mb-1">رقم المستند</p>
            <p className="text-white font-mono text-sm">{doc.serialNumber}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">تاريخ الإنشاء</p>
            <p className="text-white text-sm">{new Date(doc.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">مقدم الطلب</p>
            <p className="text-white text-sm">{doc.submitter.name}</p>
          </div>
          {doc.reviewer && (
            <div>
              <p className="text-white/40 text-xs mb-1">المراجع</p>
              <p className="text-white text-sm">{doc.reviewer.name}</p>
            </div>
          )}
          <div className="md:col-span-2">
            <p className="text-white/40 text-xs mb-1">التوقيع الرقمي</p>
            <p className="text-white/30 font-mono text-[10px] break-all">
              {doc.signature ?? '—'}
            </p>
          </div>
        </div>

        {/* Document Fields */}
        <div className="px-8 py-6 space-y-5">
          {fields.map(field => (
            <div key={field.name} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <p className="text-white/40 text-xs mb-1">{field.labelAr} — <span className="text-white/20">{field.labelEn}</span></p>
              <p className="text-white text-sm whitespace-pre-wrap">{data[field.name] || '—'}</p>
            </div>
          ))}
        </div>

        {/* Review Notes */}
        {doc.reviewNotes && (
          <div className="px-8 pb-5">
            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
              <p className="text-yellow-400 text-xs font-bold mb-2">📝 ملاحظات المراجع</p>
              <p className="text-white/70 text-sm">{doc.reviewNotes}</p>
            </div>
          </div>
        )}

        {/* Activity Log */}
        {doc.logs && doc.logs.length > 0 && (
          <div className="px-8 pb-8 border-t border-white/10 pt-6">
            <p className="text-white/60 text-sm font-bold mb-4">📋 سجل النشاط</p>
            <div className="relative">
              <div className="absolute right-3 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-4">
                {doc.logs.map(log => (
                  <div key={log.id} className="flex items-start gap-4 pr-8 relative">
                    <div className="absolute right-0 top-1 w-6 h-6 rounded-full bg-slate-800 border border-white/20
                                    flex items-center justify-center text-xs">
                      {log.user.role === 'admin' ? '🛡️' : '👤'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{log.user.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </div>
                      {log.notes && <p className="text-white/40 text-xs mt-0.5">{log.notes}</p>}
                      <p className="text-white/20 text-[10px] mt-1">{new Date(log.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
