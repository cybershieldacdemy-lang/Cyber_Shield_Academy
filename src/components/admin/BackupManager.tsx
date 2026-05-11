'use client';

import React, { useState, useEffect } from 'react';

interface Backup {
    filename: string;
    size: number;
    date: string;
}

export default function BackupManager() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/backups');
            const data = await res.json();
            setBackups(Array.isArray(data) ? data : []);
        } catch {
            console.error('Failed to fetch backups');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreating(true);
        try {
            const res = await fetch('/api/admin/backups', { method: 'POST' });
            if (res.ok) {
                await fetchBackups();
                alert('Backup created successfully! 💾');
            } else {
                alert('Failed to create backup.');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = (filename: string) => {
        window.location.href = `/api/admin/backups/${filename}`;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-950/30 p-6 rounded-xl border border-blue-900/50">
                <div>
                    <h3 className="text-2xl font-bold text-blue-400">💾 إدارة النسخ الاحتياطي (Backup & Recovery)</h3>
                    <p className="text-blue-300/80 text-sm mt-1">
                        إدارة نسخ قاعدة البيانات، إنشاء نقاط استعادة، وتنزيل النسخ للحفظ الآمن.
                    </p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={creating}
                    className={`px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2 ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {creating ? (
                        <>
                            <span className="animate-spin">🔄</span> جاري النسخ...
                        </>
                    ) : (
                        <>
                            <span>➕</span> إنشاء نسخة جديدة
                        </>
                    )}
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-cyber-900/50 text-cyber-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">اسم الملف</th>
                            <th className="p-4">تاريخ الإنشاء</th>
                            <th className="p-4">الحجم</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-800">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-8 text-cyber-500">جاري التحميل...</td></tr>
                        ) : backups.map((backup) => (
                            <tr key={backup.filename} className="hover:bg-cyber-800/30 transition-colors">
                                <td className="p-4 text-white font-mono text-sm">{backup.filename}</td>
                                <td className="p-4 text-cyber-300">{new Date(backup.date).toLocaleString()}</td>
                                <td className="p-4 text-cyber-400 font-mono">{formatSize(backup.size)}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDownload(backup.filename)}
                                        className="text-neon-blue hover:text-white transition-colors flex items-center gap-1 text-sm font-bold border border-neon-blue/30 px-3 py-1 rounded hover:bg-neon-blue/20"
                                    >
                                        ⬇️ تحميل
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && backups.length === 0 && (
                    <div className="text-center p-12 text-cyber-500 bg-cyber-900/10">
                        لا توجد نسخ احتياطية حالياً. قم بإنشاء أول نسخة الآن!
                    </div>
                )}
            </div>

            <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                    <strong className="block mb-1 text-yellow-500">ملاحظة هامة حول الاستعادة (Restore):</strong>
                    لاستعادة النظام من نسخة احتياطية، يرجى الاتصال بمدير النظام أو استخدام أدوات سطر الأوامر لاستبدال ملف قاعدة البيانات يدوياً بعد إيقاف الخدمة.
                    الاستعادة الآلية غير مفعلة حالياً لضمان سلامة البيانات.
                </div>
            </div>
        </div>
    );
}
