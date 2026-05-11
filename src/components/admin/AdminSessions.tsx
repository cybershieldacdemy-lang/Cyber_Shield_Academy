'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, Video, XCircle, AlertTriangle, Search } from 'lucide-react';

interface AdminSession {
    id: string;
    title: string;
    session_type: string;
    status: string;
    scheduled_at: string;
    meet_link: string;
    instructor_name: string;
    instructor_email: string;
    student_name: string;
    student_email: string;
}

export default function AdminSessions() {
    const [sessions, setSessions] = useState<AdminSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        try {
            const res = await fetch('/api/admin/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(Array.isArray(data.sessions) ? data.sessions : []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const cancelSession = async (id: string) => {
        if (!confirm('هل أنت متأكد من إلغاء هذه الجلسة كمسؤول؟')) return;
        await fetch('/api/admin/sessions', {
            method: 'PUT',
            body: JSON.stringify({ action: 'cancel', session_id: id }),
            headers: { 'Content-Type': 'application/json' }
        });
        loadData();
    };

    const regenerateMeet = async (id: string) => {
        if (!confirm('الاستمرار سيقوم بإنشاء رابط Google Meet جديد وتدمير القديم..')) return;
        const res = await fetch('/api/admin/sessions/regenerate-meet', {
            method: 'POST',
            body: JSON.stringify({ session_id: id }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            alert('تم إنشاء الرابط بنجاح');
            loadData();
        } else {
            const err = await res.json();
            alert('خطأ: ' + (err.message || 'مشكلة أثناء الإنشاء'));
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const specs: any = {
            'scheduled': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'مجدولة' },
            'active': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'مستمرة (LIVE)' },
            'completed': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'مكتملة' },
            'cancelled': { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'ملغاة' },
        };
        const config = specs[status] || { color: 'bg-gray-500/20 text-gray-400', label: status };
        return <span className={`px-2 py-1 text-xs font-bold rounded-lg border ${config.color}`}>{config.label}</span>;
    };

    const filtered = sessions.filter(s => 
        (s.title?.includes(search) || s.instructor_name?.includes(search) || s.student_name?.includes(search))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">🎥 مراقبة وإدارة الجلسات</h2>
                    <p className="text-cyber-500 text-sm mt-1">عرض جميع الحجوزات ونقاط الوصول لـ Meet</p>
                </div>
                <div className="flex bg-[#0b0e14] border border-cyber-800 rounded-lg p-2.5 w-72">
                    <Search size={16} className="text-cyber-500 ml-2" />
                    <input 
                        className="bg-transparent text-sm w-full outline-none text-white focus:placeholder-cyber-600"
                        placeholder="ابحث عن طالب أو مدرب..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-panel overflow-hidden border border-cyber-800/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-[#0b0e14] text-cyber-500 border-b border-cyber-800/50 font-bold">
                            <tr>
                                <th className="p-4">العنوان والتاريخ</th>
                                <th className="p-4">المدرب</th>
                                <th className="p-4">الطالب</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">إجراءات تحكم (Admin)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-800/20">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-cyan-500 animate-pulse">جاري سحب الجلسات...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-cyber-600">لا توجد جلسات مسجلة</td></tr>
                            ) : filtered.map(sys => (
                                <tr key={sys.id} className="hover:bg-cyber-900/40 transition">
                                    <td className="p-4">
                                        <div className="text-white font-bold mb-1">{sys.title}</div>
                                        <div className="text-xs text-cyber-500 font-mono" dir="ltr">{new Date(sys.scheduled_at).toLocaleString('en-GB')}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white text-sm">{sys.instructor_name || 'غير محدد'}</div>
                                        <div className="text-xs text-cyber-500">{sys.instructor_email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white text-sm">{sys.student_name || 'طالب محذوف؟'}</div>
                                        <div className="text-xs text-cyber-500">{sys.student_email}</div>
                                    </td>
                                    <td className="p-4"><StatusBadge status={sys.status} /></td>
                                    <td className="p-4 flex gap-2 justify-center items-center h-full">
                                        {(sys.status === 'scheduled' || sys.status === 'active') && (
                                            <>
                                                {sys.meet_link ? (
                                                    <a href={sys.meet_link} target="_blank" title="دخول كمراقب" className="bg-green-500/10 hover:bg-green-500/20 text-green-400 p-2 rounded-lg border border-green-500/30 transition">
                                                        <Video size={16} />
                                                    </a>
                                                ) : null}
                                                
                                                <button onClick={() => regenerateMeet(sys.id)} title="إعادة توليد رابط Meet" className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 p-2 rounded-lg border border-orange-500/30 transition">
                                                    <RefreshCw size={16} />
                                                </button>

                                                <button onClick={() => cancelSession(sys.id)} title="إلغاء الجلسة" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg border border-red-500/30 transition">
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                        {sys.status !== 'scheduled' && sys.status !== 'active' && (
                                            <span className="text-xs text-cyber-600 block my-auto items-center pt-2">لا يوجد إجراءات متاحة</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
