"use client";
import { useEffect, useState } from "react";

interface Application {
    id: number;
    name: string;
    email: string;
    specialization: string;
    experience: string;
    cv_link: string;
    status: string;
    created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "قيد المراجعة", color: "#c8962e", bg: "rgba(200,150,46,0.08)" },
    approved: { label: "مقبول", color: "#38b2ac", bg: "rgba(56,178,172,0.08)" },
    rejected: { label: "مرفوض", color: "#e53e3e", bg: "rgba(229,62,62,0.08)" },
};

const specLabels: Record<string, string> = {
    "network-security": "أمن الشبكات",
    "app-security": "أمن التطبيقات",
    "info-security": "أمن المعلومات",
    "system-security": "أمن الأنظمة",
    "cloud-security": "الأمن السحابي",
    "penetration-testing": "اختبار الاختراق",
    "incident-response": "الاستجابة للحوادث",
    "malware-analysis": "تحليل البرمجيات الخبيثة",
    "digital-forensics": "التحقيق الرقمي",
    "cryptography": "التشفير",
    "soc-analyst": "محلل SOC",
    "other": "أخرى",
};

export default function AdminTeacherApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const loadApplications = () => {
        fetch("/api/teacher-applications")
            .then(res => res.json())
            .then(data => setApplications(data.applications || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadApplications(); }, []);

    const handleAction = async (id: number, status: string) => {
        const res = await fetch(`/api/teacher-applications/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        const data = await res.json();
        alert(data.message);
        loadApplications();
    };

    const filtered = filter === "all"
        ? applications
        : applications.filter(a => a.status === filter);

    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#1a1612' }}>👨‍🏫 طلبات التدريس</h1>
                    <p className="text-sm mt-1" style={{ color: '#7a7164' }}>إدارة طلبات المدرّبين الجدد</p>
                </div>
                <div className="text-sm px-4 py-2 rounded-xl" style={{
                    background: 'rgba(200,150,46,0.08)',
                    border: '1px solid rgba(200,150,46,0.15)',
                    color: '#c8962e'
                }}>
                    {counts.pending} طلب قيد المراجعة
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {[
                    { key: "all", label: "الكل", count: counts.all },
                    { key: "pending", label: "قيد المراجعة", count: counts.pending },
                    { key: "approved", label: "مقبول", count: counts.approved },
                    { key: "rejected", label: "مرفوض", count: counts.rejected },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className="px-4 py-2 rounded-lg text-sm transition-all"
                        style={{
                            background: filter === f.key ? 'rgba(200,150,46,0.12)' : 'rgba(255,255,255,0.5)',
                            border: `1px solid ${filter === f.key ? 'rgba(200,150,46,0.3)' : 'rgba(200,150,46,0.1)'}`,
                            color: filter === f.key ? '#c8962e' : '#5c5549',
                            fontWeight: filter === f.key ? 700 : 400,
                        }}
                    >
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20 text-cyber-400">⏳ جاري التحميل...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">📋</div>
                    <p style={{ color: '#7a7164' }}>لا توجد طلبات {filter !== 'all' ? statusConfig[filter]?.label : ''}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(app => {
                        const sc = statusConfig[app.status] || statusConfig.pending;
                        const isExpanded = expandedId === app.id;

                        return (
                            <div key={app.id} className="rounded-xl overflow-hidden" style={{
                                background: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(200,150,46,0.1)',
                            }}>
                                <div
                                    className="flex items-center justify-between p-5 cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{
                                            background: `${sc.color}15`,
                                            color: sc.color,
                                        }}>
                                            {app.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm" style={{ color: '#1a1612' }}>{app.name}</h3>
                                            <p className="text-xs" style={{ color: '#a89f8e' }}>
                                                {specLabels[app.specialization] || app.specialization} • {new Date(app.created_at).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{
                                            background: sc.bg,
                                            color: sc.color,
                                            border: `1px solid ${sc.color}25`,
                                        }}>
                                            {sc.label}
                                        </span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a89f8e" strokeWidth="2"
                                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-5 pb-5 pt-2" style={{ borderTop: '1px solid rgba(200,150,46,0.08)' }}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs mb-1" style={{ color: '#a89f8e' }}>البريد الإلكتروني</p>
                                                <p className="text-sm" style={{ color: '#3d3730' }} dir="ltr">{app.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs mb-1" style={{ color: '#a89f8e' }}>التخصص</p>
                                                <p className="text-sm" style={{ color: '#3d3730' }}>{specLabels[app.specialization] || app.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-xs mb-1" style={{ color: '#a89f8e' }}>الخبرة والمؤهلات</p>
                                            <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ color: '#3d3730', background: 'rgba(200,150,46,0.04)' }}>
                                                {app.experience}
                                            </p>
                                        </div>
                                        {app.cv_link && (
                                            <div className="mb-4">
                                                <p className="text-xs mb-1" style={{ color: '#a89f8e' }}>رابط CV / LinkedIn</p>
                                                <a href={app.cv_link} target="_blank" rel="noopener noreferrer"
                                                    className="text-sm underline" style={{ color: '#2da5c7' }} dir="ltr">
                                                    {app.cv_link}
                                                </a>
                                            </div>
                                        )}

                                        {app.status === 'pending' && (
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => handleAction(app.id, 'approved')}
                                                    className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                                                    style={{ background: 'rgba(56,178,172,0.1)', color: '#2c7a7b', border: '1px solid rgba(56,178,172,0.25)' }}
                                                >
                                                    ✅ قبول
                                                </button>
                                                <button
                                                    onClick={() => handleAction(app.id, 'rejected')}
                                                    className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                                                    style={{ background: 'rgba(229,62,62,0.1)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.25)' }}
                                                >
                                                    ❌ رفض
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
