"use client";
import { useEffect, useState } from "react";
import { Clock, UserCircle, Shield, Trash2, Plus, CalendarClock } from "lucide-react";

interface Availability {
    id: string; day_of_week: number; start_time: string; end_time: string;
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function InstructorSettingsPage() {
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [form, setForm] = useState({ day_of_week: "0", start_time: "", end_time: "" });
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const res = await fetch('/api/instructor/availability');
            if (res.ok) {
                const data = await res.json();
                setAvailabilities(data.slots || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const addTime = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        await fetch('/api/instructor/availability', {
            method: 'POST',
            body: JSON.stringify({ day_of_week: parseInt(form.day_of_week), start_time: form.start_time, end_time: form.end_time }),
            headers: { 'Content-Type': 'application/json' }
        });
        setAdding(false);
        setForm({ day_of_week: "0", start_time: "", end_time: "" });
        loadData();
    };

    const deleteTime = async (id: string) => {
        await fetch('/api/instructor/availability', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        });
        loadData();
    };

    if (loading) return <div className="text-cyan-400 animate-pulse text-center mt-20">جاري تحميل الإعدادات...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">الإعدادات والجدولة</h2>
                <p className="text-sm text-gray-400 mt-1">تكوين الملف الشخصي وضبط فترات التوفر للطلاب.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Profile Settings Segment */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <UserCircle size={20} className="text-cyan-400" /> الملف الشخصي
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center text-cyan-400">
                                    👤
                                </div>
                                <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition rounded-lg text-sm font-bold text-white">تغيير الصورة</button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">الاسم الكامل</label>
                                <input type="text" defaultValue="عبدالرحمن المطيري" className="w-full bg-[#0b0e14] border border-white/10 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">التخصص</label>
                                <input type="text" defaultValue="أمن الشبكات" className="w-full bg-[#0b0e14] border border-white/10 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" />
                            </div>
                            <button className="px-6 py-2 bg-cyan-500 text-black font-bold text-sm rounded-lg hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.4)] transition">حفظ التغييرات</button>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <Shield size={20} className="text-pink-400" /> الأمان وكلمة المرور
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">كلمة المرور الحالية</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-[#0b0e14] border border-white/10 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-pink-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">كلمة المرور الجديدة</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-[#0b0e14] border border-white/10 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-pink-500" />
                            </div>
                            <button className="px-6 py-2 border border-pink-500/50 text-pink-400 font-bold text-sm rounded-lg hover:bg-pink-500/10 transition">تغيير كلمة المرور</button>
                        </div>
                    </div>

                    <GoogleCalendarSync />
                </div>

                {/* Availability Matrix Segment */}
                <div className="glass-panel p-6 h-fit">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CalendarClock size={20} className="text-cyan-400" /> جدول أوقات الدوام
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">يمنع النظام حجز أي موعد يتعارض مع هذه الأوقات.</p>
                        </div>
                    </div>

                    <form onSubmit={addTime} className="p-4 bg-white/5 border border-white/5 rounded-xl mb-6">
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">يوم الأسبوع</label>
                                <select value={form.day_of_week} onChange={e => setForm({...form, day_of_week: e.target.value})} className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500" required>
                                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-1">من الساعة</label>
                                    <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-1">إلى الساعة</label>
                                    <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500" required />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={adding} className="w-full flex justify-center items-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg font-bold text-sm transition">
                            <Plus size={16} /> {adding ? 'جاري الحفظ...' : 'إضافة إلى الجدول'}
                        </button>
                    </form>

                    <div className="space-y-3">
                        {availabilities.length === 0 ? (
                            <div className="text-center py-6 border border-dashed border-white/10 rounded-lg text-gray-500 text-sm">
                                لم تقم بإضافة أي أوقات متاحة للحجز حتى الآن.
                            </div>
                        ) : (
                            availabilities.map(av => (
                                <div key={av.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-cyan-500/30 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center font-bold text-xs border border-cyan-500/20">
                                            {DAYS[av.day_of_week]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-200">فترة عمل أسبوعية</div>
                                            <div className="text-[11px] font-mono text-gray-500 mt-0.5">من {av.start_time} إلى {av.end_time}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteTime(av.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition" title="حذف الوقت">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function GoogleCalendarSync() {
    const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We can just fetch me to see if google is linked natively
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && data.user.google_email) {
                    setConnectedEmail(data.user.google_email);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <div className="glass-panel p-6 border-l-4" style={{ borderLeftColor: connectedEmail ? '#25d366' : '#c8962e' }}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                📅 تكامل تقويم جوجل (Google Meet)
            </h3>
            <p className="text-sm text-gray-400 mb-6">
                مطلوب للسماح للنظام بإنشاء روابط فيديو تلقائياً على تقويمك الخاص.
            </p>

            {connectedEmail ? (
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-lg">
                            ✓
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-400">متصل بنجاح</p>
                            <p className="text-xs text-green-500/70">{connectedEmail}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="inline-flex w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mb-4 items-center justify-center border-2 border-blue-500/20">
                        🔗
                    </div>
                    <p className="text-sm text-gray-300 mb-4">يجب ربط الحساب للبدء في استقبال الحجوزات</p>
                    <a 
                        href="/api/auth/google/connect"
                        className="w-full inline-flex justify-center items-center gap-3 py-3 px-6 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-colors shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        الربط مع Google Calendar
                    </a>
                </div>
            )}
        </div>
    );
}
