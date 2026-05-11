"use client";
import { useEffect, useState } from "react";
import { Video, Calendar, History, CheckCircle2, XCircle, Users } from "lucide-react";

interface Session {
    id: string; title: string; session_type: string; status: string;
    scheduled_at: string; student_name: string;
    student_email: string; student_avatar: string;
    instructor_notes?: string; student_rating?: number;
    meet_link?: string;
}

export default function InstructorSessionsPage() {
    const [sessions, setSessions] = useState<{ upcoming: Session[], active: Session[], completed: Session[] }>({ upcoming: [], active: [], completed: [] });
    const [activeTab, setActiveTab] = useState<"upcoming" | "active" | "completed">("upcoming");
    const [loading, setLoading] = useState(true);

    const loadSessions = async () => {
        try {
            const res = await fetch('/api/instructor/sessions');
            if (res.ok) setSessions(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSessions(); }, []);

    if (loading) return <div className="text-cyan-400 animate-pulse text-center mt-20">جاري تحميل بيانات الجلسات...</div>;

    const tabs = [
        { id: 'upcoming', label: 'الجلسات المجدولة', icon: Calendar, count: sessions.upcoming.length },
        { id: 'active', label: 'الجارية الآن', icon: Video, count: sessions.active.length, alert: true },
        { id: 'completed', label: 'السجل والتقييم', icon: History, count: sessions.completed.length }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">إدارة الجلسات</h2>
                    <p className="text-sm text-gray-400 mt-1">تابع مواعيدك وأدر غرفة Google Meet لطلابك.</p>
                </div>
                
                <div className="flex bg-cyber-900 p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto custom-scrollbar">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-white/10 text-cyan-400 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                        >
                            <t.icon size={16} />
                            {t.label}
                            {t.count > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${t.alert && t.id==='active' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-800 text-gray-300'}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Engine */}
            <div className="glass-panel p-6 min-h-[400px]">
                {activeTab === 'upcoming' && <UpcomingTab sessions={sessions.upcoming} reload={loadSessions} />}
                {activeTab === 'active' && <ActiveTab sessions={sessions.active} />}
                {activeTab === 'completed' && <HistoryTab sessions={sessions.completed} reload={loadSessions} />}
            </div>
        </div>
    );
}

function UpcomingTab({ sessions, reload }: { sessions: Session[], reload: () => void }) {
    if (sessions.length === 0) return <div className="text-center text-gray-500 py-10">لا توجد جلسات قادمة.</div>;

    const markActive = async (id: string, meetLink?: string) => {
        if(!confirm("هل أنت متأكد من تفعيل الجلسة للبدء؟")) return;
        await fetch(`/api/sessions/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'active' }), headers: { 'Content-Type': 'application/json' }});
        reload();
        if(meetLink) window.open(meetLink, '_blank');
    };

    return (
        <div className="space-y-4">
            {sessions.map(s => {
                const date = new Date(s.scheduled_at);
                const canJoin = new Date().getTime() >= (date.getTime() - (15 * 60 * 1000));

                return (
                    <div key={s.id} className="p-5 border-l-4 border-cyan-500 bg-white/5 hover:bg-white/10 transition rounded-xl flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 flex gap-4 w-full">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl">
                                {s.student_avatar ? <img src={s.student_avatar} className="rounded-full w-full h-full object-cover" /> : s.student_name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{s.title}</h3>
                                <p className="text-gray-400 text-sm">الطالب: {s.student_name}</p>
                            </div>
                        </div>

                        <div className="flex-1 text-center w-full">
                           <div className="text-xs text-cyan-500 mb-1">الموعد المحدد</div>
                           <div className="text-gray-200 font-mono text-sm">{date.toLocaleDateString('ar-EG')} - {date.toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</div>
                           <CountdownTimer targetDate={s.scheduled_at} />
                        </div>

                        <div className="flex-1 flex justify-end gap-2 w-full">
                            {canJoin ? (
                                <button onClick={() => markActive(s.id, s.meet_link)} className="px-6 py-2 bg-cyan-500 text-black font-bold text-sm rounded-lg hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.4)] transition flex items-center gap-2">
                                   <Video size={16} /> تفعيل الجلسة
                                </button>
                            ) : (
                                <div className="px-6 py-2 bg-gray-800 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed">
                                    متاح قبل الموعد بـ 15 دقيقة
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

function ActiveTab({ sessions }: { sessions: Session[] }) {
    if (sessions.length === 0) return (
        <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                <Video size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">لا توجد جلسات جارية الآن</h3>
            <p className="text-gray-500 text-sm">قم بتفعيل إحدى جلساتك المجدولة عندما يحين وقتها.</p>
        </div>
    );

    return (
        <div className="grid gap-4">
            {sessions.map(s => (
                <div key={s.id} className="p-6 border border-red-500/30 bg-red-500/5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                                {s.student_avatar ? <img src={s.student_avatar} className="rounded-full w-full h-full object-cover" /> : <Users size={24} className="text-red-400" />}
                            </div>
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border border-[#0b0e14] rounded-full animate-pulse"></span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE NOW</span>
                                <h3 className="font-bold text-white tracking-wide">{s.title}</h3>
                            </div>
                            <p className="text-sm text-gray-400">الطالب: <span className="text-gray-200">{s.student_name}</span></p>
                        </div>
                    </div>
                    {s.meet_link ? (
                        <a href={s.meet_link} target="_blank" className="w-full md:w-auto text-center px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition shadow-[0_0_20px_rgba(255,0,0,0.4)] flex items-center justify-center gap-2">
                           <Video size={18} /> الانضمام عبر جوجل ميت
                        </a>
                    ) : (
                        <span className="px-6 py-2 bg-gray-800 text-gray-500 rounded-lg text-sm">الرابط غير متاح</span>
                    )}
                </div>
            ))}
        </div>
    );
}

function HistoryTab({ sessions, reload }: { sessions: Session[], reload: () => void }) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const [rating, setRating] = useState(0);

    const submitFeedback = async (id: string) => {
        await fetch(`/api/instructor/sessions/${id}/notes`, {
            method: 'PUT',
            body: JSON.stringify({ instructor_notes: notes, student_rating: rating }),
            headers: { 'Content-Type': 'application/json' }
        });
        setExpanded(null);
        reload();
    };

    if (sessions.length === 0) return <div className="text-center text-gray-500 py-10">سجل الجلسات فارغ.</div>;

    return (
        <div className="space-y-3">
            {sessions.map(s => (
                <div key={s.id} className="border border-white/5 bg-cyber-900 rounded-xl overflow-hidden transition-all">
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => { setExpanded(expanded === s.id ? null : s.id); setNotes(s.instructor_notes||""); setRating(s.student_rating||0); }}>
                        <div className="flex gap-4 items-center">
                            {s.status === 'completed' ? <CheckCircle2 className="text-green-400" /> : <XCircle className="text-red-400" />}
                            <div>
                                <h4 className="font-bold text-gray-200">{s.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">الطالب: {s.student_name} • {new Date(s.scheduled_at).toLocaleDateString('ar-EG')}</p>
                            </div>
                        </div>
                        <span className="text-cyan-500 text-sm font-bold">{expanded === s.id ? 'إخفاء' : 'التقييم'}</span>
                    </div>

                    {expanded === s.id && s.status === 'completed' && (
                        <div className="p-5 border-t border-white/5 bg-black/20">
                            <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">📝 ترك ملاحظات للطالب</h5>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500" rows={3} placeholder="كيف كان أداء الطالب في الجلسة؟..."></textarea>
                            
                            <div className="flex justify-between items-center mt-3">
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(st => (
                                        <button key={st} onClick={() => setRating(st)} className={`text-2xl ${rating >= st ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400/50'}`}>★</button>
                                    ))}
                                </div>
                                <button onClick={() => submitFeedback(s.id)} className="px-5 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-bold hover:bg-cyan-500 hover:text-black transition">
                                    حفظ وتوثيق
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const distance = new Date(targetDate).getTime() - new Date().getTime();
            if (distance < 0) {
                setTimeLeft("جاهزة للبدء الآن");
                clearInterval(interval);
                return;
            }
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let str = "";
            if (d > 0) str += `${d} يوم و `;
            setTimeLeft(str + `${h}س : ${m}د`);
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className={`text-[11px] font-bold mt-1.5 ${timeLeft.includes('جاهزة') ? 'text-green-400 animate-pulse' : 'text-gray-500'}`}>
            ⌛ {timeLeft || "حساب..."}
        </div>
    );
}
