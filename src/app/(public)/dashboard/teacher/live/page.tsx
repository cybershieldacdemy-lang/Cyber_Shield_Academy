"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherLiveDashboard() {
    const router = useRouter();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/live?teacher=true');
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions || []);
            } else {
                router.push('/login');
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const d = new Date(scheduledAt); // Convert local to UTC string
            
            const res = await fetch('/api/live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, scheduled_at: d.toISOString() })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ text: '✅ تم إنشاء الجلسة بنجاح!', type: 'success' });
                setTitle('');
                setDescription('');
                setScheduledAt('');
                fetchSessions();
            } else {
                setMessage({ text: '❌ ' + data.message, type: 'error' });
            }
        } catch {
            setMessage({ text: '❌ حدث خطأ غير متوقع', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-cyber-900 border border-cyber-700 p-6 rounded-2xl shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold text-cyber-100 mb-2">إدارة الفصول الافتراضية المباشرة 🎙️</h1>
                    <p className="text-cyber-400">قم بجدولة وتشغيل البث المباشر مع طلابك.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Create Form */}
                <div className="md:col-span-1 bg-cyber-900 border border-cyber-700 rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <h2 className="text-xl font-bold text-cyber-100 mb-6">جدولة جلسة جديدة</h2>
                    
                    {message.text && (
                        <div className={`p-4 rounded-xl text-sm font-bold mb-6 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-cyber-400 text-sm font-bold mb-2">عنوان الجلسة</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 py-3 text-cyber-100 focus:border-cyber-100 outline-none transition-colors" placeholder="مقدمة في اختراق الشبكات..." />
                        </div>
                        <div>
                            <label className="block text-cyber-400 text-sm font-bold mb-2">الوصف (اختياري)</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 py-3 text-cyber-100 focus:border-cyber-100 outline-none transition-colors" placeholder="شرح مبسط لأدوات Nmap..." />
                        </div>
                        <div>
                            <label className="block text-cyber-400 text-sm font-bold mb-2">موعد الجلسة</label>
                            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required className="w-full bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 py-3 text-cyber-100 focus:border-cyber-100 outline-none transition-colors" />
                        </div>
                        <button type="submit" disabled={submitting} className="w-full bg-cyber-100 hover:bg-white text-black font-bold py-3 rounded-xl transition-all shadow-lg mt-4 disabled:opacity-50">
                            {submitting ? 'جاري الجدولة...' : 'جدولة البث المباشر'}
                        </button>
                    </form>
                </div>

                {/* Scheduled Sessions */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold text-cyber-100 mb-6">الجلسات المجدولة</h2>
                    {loading ? (
                        <div className="text-center py-10 text-cyber-500 animate-pulse">جاري جلب الجلسات...</div>
                    ) : sessions.length === 0 ? (
                        <div className="bg-cyber-900/50 border border-cyber-700 rounded-2xl p-10 text-center text-cyber-500 border-dashed">
                            لا توجد أي جلسات مجدولة حالياً.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sessions.map(session => {
                                const isPast = new Date(session.scheduled_at + 'Z').getTime() < Date.now() - (1000 * 60 * 60 * 2); // 2 hours passed
                                return (
                                    <div key={session.id} className={`bg-cyber-900 border ${isPast ? 'border-cyber-700 opacity-60' : 'border-cyber-500/30'} rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:-translate-y-1 transition-transform shadow-lg`}>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-cyber-100 text-lg">{session.title}</h3>
                                                {!isPast && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 border border-red-500/30 rounded uppercase font-bold tracking-wider animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Live Room</span>}
                                            </div>
                                            <p className="text-sm text-cyber-400 mb-2">{session.description}</p>
                                            <div className="text-xs font-mono text-cyber-500">
                                                الموعد: {new Date(session.scheduled_at + 'Z').toLocaleString('ar-EG')}
                                            </div>
                                        </div>
                                        
                                        <Link href={`/live/${session.id}`} target="_blank" className={`whitespace-nowrap px-6 py-2 rounded-lg font-bold transition-all border ${isPast ? 'bg-cyber-800 text-cyber-400 border-cyber-600 hover:text-cyber-950' : 'bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600 hover:text-white'}`}>
                                            {isPast ? 'غرفة الأرشيف' : 'دخول القاعة الآن 🎥'}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
