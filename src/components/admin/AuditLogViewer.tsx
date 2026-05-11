'use client';

import React, { useState, useEffect } from 'react';

interface AuditLog {
    id: string;
    action: string;
    userName: string;
    userEmail: string;
    ipAddress: string;
    details: string;
    severity: string;
    createdAt: string;
}

export default function AuditLogViewer() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filter]);

    async function fetchLogs() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: '20',
                offset: (page * 20).toString(),
            });
            if (filter) params.set('action', filter);

            const res = await fetch(`/api/admin/audit-logs?${params}`);
            const data = await res.json();
            setLogs(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    }

    const severityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-teal-600 bg-teal-500/10 border-teal-500/20';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">سجلات التدقيق والمراقبة</h3>
                <select
                    className="bg-cyber-900 border border-cyber-700 rounded-lg px-3 py-1 text-cyber-300"
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="">كل العمليات</option>
                    <option value="LOGIN">تسجيل دخول</option>
                    <option value="LOGIN_FAILED">فشل دخول</option>
                    <option value="ADMIN_ACTION">إجراء إداري</option>
                    <option value="SUSPICIOUS_ACTIVITY">نشاط مشبوه</option>
                </select>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-cyber-900/50 text-cyber-400 text-sm">
                        <tr>
                            <th className="p-3">الوقت</th>
                            <th className="p-3">المستخدم</th>
                            <th className="p-3">الحدث</th>
                            <th className="p-3">التفاصيل</th>
                            <th className="p-3">IP</th>
                            <th className="p-3">الخطورة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-800">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center p-8 text-cyber-500">جاري التحميل...</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id as any} className="hover:bg-cyber-800/30 transition-colors text-sm">
                                <td className="p-3 text-cyber-500" dir="ltr">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="p-3 text-cyber-300">
                                    <div>{log.userName || 'Unknown'}</div>
                                    <div className="text-xs text-cyber-500">{log.userEmail}</div>
                                </td>
                                <td className="p-3 text-white font-medium">{log.action}</td>
                                <td className="p-3 text-cyber-400 max-w-xs truncate" title={log.details}>{log.details}</td>
                                <td className="p-3 text-cyber-500 font-mono text-xs">{log.ipAddress}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs border ${severityColor(log.severity)}`}>
                                        {log.severity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center gap-2 mt-4">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded bg-cyber-800 disabled:opacity-50 text-cyber-300"
                >
                    السابق
                </button>
                <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded bg-cyber-800 text-cyber-300"
                >
                    التالي
                </button>
            </div>
        </div>
    );
}
