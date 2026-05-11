'use client';

import { use, useEffect, useState } from 'react';

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
    user: { name: string; role: string };
  }>;
}

const STATUS_LABELS: Record<string, { label: string; ar: string }> = {
  PENDING:  { label: 'Pending Review', ar: 'قيد المراجعة' },
  APPROVED: { label: 'Approved',       ar: 'معتمد'        },
  REJECTED: { label: 'Rejected',       ar: 'مرفوض'        },
  ARCHIVED: { label: 'Archived',       ar: 'مؤرشف'        },
};

const ACTION_LABELS: Record<string, string> = {
  CREATED:  'إنشاء المستند',
  SUBMITTED:'رفع المستند',
  REVIEWED: 'مراجعة',
  APPROVED: 'اعتماد',
  REJECTED: 'رفض',
  ARCHIVED: 'أرشفة',
};

export default function DocumentPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc]         = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(j => { setDoc(j.document); setLoading(false); });
  }, [id]);

  // Auto-trigger print dialog once document is loaded
  useEffect(() => {
    if (!loading && doc) {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
  }, [loading, doc]);

  if (loading || !doc) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#555' }}>
        <p>جاري تحضير المستند للطباعة...</p>
      </div>
    );
  }

  const fields = JSON.parse(doc.template.schema) as Array<{
    name: string; labelAr: string; labelEn: string;
  }>;
  const data   = JSON.parse(doc.data) as Record<string, string>;
  const status = STATUS_LABELS[doc.status] ?? STATUS_LABELS['PENDING'];
  const now    = new Date(doc.createdAt);

  return (
    <>
      {/* ── Print-only stylesheet ─────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Tajawal', 'Arial', sans-serif;
          background: #f0f4f8;
          direction: rtl;
          color: #1a202c;
        }

        /* ── Screen wrapper (preview look) ─── */
        .page-wrapper {
          max-width: 900px;
          margin: 32px auto;
          padding: 0 16px;
        }

        /* Top action bar — visible on screen only */
        .action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #1e293b;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .action-bar span { color: #94a3b8; font-size: 13px; }
        .print-btn {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .print-btn:hover { opacity: 0.9; }

        /* ── A4 Document card ────────────────── */
        .doc-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          overflow: hidden;
          page-break-inside: avoid;
        }

        /* Header stripe */
        .doc-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0e7490 100%);
          color: white;
          padding: 36px 40px 28px;
          position: relative;
          overflow: hidden;
        }
        .doc-header::before {
          content: '';
          position: absolute;
          top: -40px; left: -40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .doc-header::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -20px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(6,182,212,0.08);
        }

        .platform-name {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #67e8f9;
          margin-bottom: 8px;
          opacity: 0.9;
        }
        .doc-title-ar {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .doc-title-en {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          font-weight: 400;
        }
        .header-right {
          position: absolute;
          top: 36px;
          left: 40px;
          text-align: left;
        }
        .doc-code {
          font-size: 28px;
          font-weight: 800;
          font-family: monospace;
          color: #67e8f9;
          letter-spacing: 1px;
        }
        .status-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          border: 1.5px solid;
        }
        .status-PENDING  { border-color: #fbbf24; color: #fbbf24; background: rgba(251,191,36,0.1); }
        .status-APPROVED { border-color: #34d399; color: #34d399; background: rgba(52,211,153,0.1); }
        .status-REJECTED { border-color: #f87171; color: #f87171; background: rgba(248,113,113,0.1); }
        .status-ARCHIVED { border-color: #9ca3af; color: #9ca3af; background: rgba(156,163,175,0.1); }

        /* Meta grid */
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-bottom: 2px solid #e2e8f0;
          background: #f8fafc;
        }
        .meta-cell {
          padding: 14px 20px;
          border-left: 1px solid #e2e8f0;
        }
        .meta-cell:last-child { border-left: none; }
        .meta-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .meta-value {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
        }
        .meta-value.mono { font-family: monospace; font-size: 11px; color: #0891b2; }

        /* Fields section */
        .fields-section {
          padding: 32px 40px;
        }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #94a3b8;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::after {
          content: '';
          flex: 1;
          height: 2px;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .field-item {
          padding: 14px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .field-item.full { grid-column: span 2; }
        .field-item:nth-child(odd) { padding-left: 24px; border-left: 1px solid #f1f5f9; }
        .field-label {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
        }
        .field-value {
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .field-value.empty { color: #cbd5e1; font-style: italic; }

        /* Review notes */
        .review-notes {
          margin: 0 40px 24px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-right: 4px solid #f59e0b;
          border-radius: 8px;
          padding: 14px 18px;
        }
        .review-notes-title { font-size: 11px; font-weight: 700; color: #92400e; margin-bottom: 6px; }
        .review-notes-text  { font-size: 12px; color: #78350f; line-height: 1.6; }

        /* Activity log */
        .log-section {
          background: #f8fafc;
          border-top: 2px solid #e2e8f0;
          padding: 24px 40px;
        }
        .log-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .log-item:last-child { border-bottom: none; }
        .log-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .log-action { font-size: 12px; font-weight: 700; color: #1e293b; }
        .log-meta   { font-size: 11px; color: #94a3b8; margin-top: 2px; }

        /* Signature & Footer */
        .sig-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 24px 40px;
          border-top: 2px solid #e2e8f0;
        }
        .sig-box {
          border: 1.5px dashed #cbd5e1;
          border-radius: 8px;
          padding: 14px 18px;
        }
        .sig-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
        .sig-value { font-size: 11px; font-family: monospace; color: #475569; word-break: break-all; line-height: 1.5; }

        .doc-footer {
          background: #0f172a;
          color: rgba(255,255,255,0.4);
          text-align: center;
          padding: 14px 40px;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        .doc-footer strong { color: rgba(255,255,255,0.7); }

        /* ── Print overrides ───────────────────────── */
        @media print {
          @page {
            size: A4;
            margin: 10mm 15mm;
          }
          body { background: white; }
          .page-wrapper { max-width: 100%; margin: 0; padding: 0; }
          .action-bar { display: none !important; }
          .doc-card {
            border-radius: 0;
            box-shadow: none;
            border: none;
          }
          .doc-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .doc-header  { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .meta-grid   { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .status-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .log-section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="page-wrapper">
        {/* Screen-only toolbar */}
        <div className="action-bar">
          <span>📄 {doc.serialNumber} — جاهز للطباعة</span>
          <button className="print-btn" onClick={() => window.print()}>
            🖨️ طباعة / تصدير PDF
          </button>
        </div>

        {/* A4 Document */}
        <div className="doc-card">

          {/* ── Header ── */}
          <div className="doc-header">
            <div>
              <div className="platform-name">CyberShield Academy — Document Management System</div>
              <div className="doc-title-ar">{doc.template.titleAr}</div>
              <div className="doc-title-en">{doc.template.titleEn}</div>
            </div>
            <div className="header-right">
              <div className="doc-code">{doc.template.code}</div>
              <div>
                <span className={`status-badge status-${doc.status}`}>
                  {status.ar} / {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── Meta Row ── */}
          <div className="meta-grid">
            <div className="meta-cell">
              <div className="meta-label">رقم المستند / Serial No.</div>
              <div className="meta-value mono">{doc.serialNumber}</div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">تاريخ الإنشاء / Date</div>
              <div className="meta-value">{now.toLocaleDateString('ar-EG')} — {now.toLocaleDateString('en-GB')}</div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">مقدم الطلب / Submitted By</div>
              <div className="meta-value">{doc.submitter.name}</div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">المراجع / Reviewed By</div>
              <div className="meta-value">{doc.reviewer?.name ?? '—'}</div>
            </div>
          </div>

          {/* ── Form Fields ── */}
          <div className="fields-section">
            <div className="section-title">📋 بيانات المستند / Document Data</div>
            <div className="fields-grid">
              {fields.map((field, i) => {
                const val = data[field.name];
                const isLong = val && val.length > 80;
                return (
                  <div key={field.name} className={`field-item${isLong || i % 2 === 0 ? '' : ''} ${isLong ? 'full' : ''}`}>
                    <div className="field-label">{field.labelAr} / {field.labelEn}</div>
                    <div className={`field-value ${!val ? 'empty' : ''}`}>{val || 'غير محدد'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Review Notes ── */}
          {doc.reviewNotes && (
            <div className="review-notes">
              <div className="review-notes-title">📝 ملاحظات المراجع / Reviewer Notes</div>
              <div className="review-notes-text">{doc.reviewNotes}</div>
            </div>
          )}

          {/* ── Signatures ── */}
          <div className="sig-section">
            <div className="sig-box">
              <div className="sig-label">التوقيع الرقمي / Digital Signature (SHA-256)</div>
              <div className="sig-value">{doc.signature ?? '—'}</div>
            </div>
            <div className="sig-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="sig-label">توقيع الاعتماد / Approval Signature</div>
                <div style={{ height: '32px', borderBottom: '1.5px solid #cbd5e1', marginTop: '8px' }} />
              </div>
              <div style={{ marginTop: '8px' }}>
                <div className="sig-label">الختم الرسمي / Official Stamp</div>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed #cbd5e1', margin: '4px auto' }} />
              </div>
            </div>
          </div>

          {/* ── Activity Log ── */}
          {doc.logs && doc.logs.length > 0 && (
            <div className="log-section">
              <div className="section-title">📋 سجل النشاط / Activity Log</div>
              {doc.logs.map(log => (
                <div key={log.id} className="log-item">
                  <div className="log-dot">{log.user.role === 'admin' ? '🛡️' : '👤'}</div>
                  <div>
                    <div className="log-action">
                      {ACTION_LABELS[log.action] ?? log.action} — <span style={{ fontWeight: 400 }}>{log.user.name}</span>
                    </div>
                    {log.notes && <div className="log-meta">{log.notes}</div>}
                    <div className="log-meta">{new Date(log.createdAt).toLocaleString('ar-EG')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="doc-footer">
            <strong>CyberShield Academy</strong> — Document Management System &nbsp;|&nbsp;
            Generated: {new Date().toLocaleString('en-GB')} &nbsp;|&nbsp;
            Ref: {doc.serialNumber}
          </div>

        </div>
      </div>
    </>
  );
}
