'use client';
import React, { useEffect, useState } from 'react';
import { UserCheck, UserX, AlertTriangle, Search, Trash2 } from 'lucide-react';

interface Instructor {
    id: string;
    name: string;
    email: string;
    role: string;
    account_type: string;
    google_email: string | null;
    phone: string;
    created_at: string;
}

export default function AdminInstructors() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        try {
            const res = await fetch('/api/admin/instructors');
            if (res.ok) {
                const data = await res.json();
                setInstructors(Array.isArray(data.instructors) ? data.instructors : []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleAction = async (id: string, action: 'suspend' | 'approve') => {
        const actionArabic = action === 'suspend' ? 'إيقاف' : 'إستعادة/قبول';
        if (!confirm(`هل أنت متأكد من رغبتك في ${actionArabic} هذا المدرب؟`)) return;
        
        await fetch('/api/admin/instructors', {
            method: 'PUT',
            body: JSON.stringify({ action, targetUserId: id }),
            headers: { 'Content-Type': 'application/json' }
        });
        loadData();
    };

    const AuthBadge = ({ google_email }: { google_email: string | null }) => {
        if (!google_email) return <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full border border-red-500/20">غير مربوط ב- Google</span>;
        return <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-500/20" title={google_email}>✓ Google Auth</span>;
    };

    const filtered = instructors.filter(s => 
        (s.name?.includes(search) || s.email?.includes(search))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">🧑‍🏫 إدارة قائمة المدربين</h2>
                    <p className="text-cyber-500 text-sm mt-1">التحكم بصلاحيات المدربين وتكاملهم مع Google Calendar</p>
                </div>
                <div className="flex bg-[#0b0e14] border border-cyber-800 rounded-lg p-2.5 w-72">
                    <Search size={16} className="text-cyber-500 ml-2" />
                    <input 
                        className="bg-transparent text-sm w-full outline-none text-white focus:placeholder-cyber-600"
                        placeholder="ابحث عن مدرب بناءً على الاسم أو الإيميل"
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-cyan-500 font-bold animate-pulse">جاري تحميل سجل المدربين...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-cyber-600 border border-dashed border-cyber-800 rounded-xl">لا يوجد مدربين متطابقين مع البحث</div>
                ) : filtered.map(inst => (
                    <div key={inst.id} className={`glass-panel p-5 border relative overflow-hidden transition ${inst.role === 'suspended' ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50' : 'border-cyber-800/40 hover:border-cyan-500/30 bg-cyber-900/30'}`}>
                        {inst.role === 'suspended' && (
                            <div className="absolute -left-12 top-4 bg-red-500 text-black text-[10px] font-bold py-1 w-40 text-center -rotate-45 z-10 shadow-lg">إيقاف إداري</div>
                        )}
                        
                        <div className="flex items-start justify-between mb-4 relative z-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 flex items-center justify-center font-bold text-lg">
                                    {inst.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-tight">{inst.name}</h3>
                                    <p className="text-xs text-cyber-500">{inst.email}</p>
                                </div>
                            </div>
                            <AuthBadge google_email={inst.google_email} />
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="text-cyber-500">حالة الصلاحية:</span>
                                <span className={inst.role === 'suspended' ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{inst.role === 'suspended' ? 'محظور' : 'نشط'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-cyber-500">تاريخ الانضمام:</span>
                                <span className="text-cyber-300 font-mono">{new Date(inst.created_at).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {inst.role === 'suspended' ? (
                                <button onClick={() => handleAction(inst.id, 'approve')} className="flex-1 bg-green-500/10 text-green-400 border border-green-500/30 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-500 hover:text-black transition">
                                    <UserCheck size={16} /> استعادة (Unban)
                                </button>
                            ) : (
                                <button onClick={() => handleAction(inst.id, 'suspend')} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/30 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition">
                                    <UserX size={16} /> إيقاف نهائي
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
