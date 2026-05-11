"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Session {
    id: string;
    title: string;
    description: string;
    teacher_name: string;
    student_name: string | null;
    session_type: string;
    status: string;
    scheduled_at: string;
    room_id: string;
    meet_link?: string;
}

interface Instructor {
    id: string;
    name: string;
    specialization?: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
    scheduled: { label: "مجدولة", color: "#c8962e", icon: "📅" },
    active: { label: "جارية الآن", color: "#25d366", icon: "🔴" },
    completed: { label: "مكتملة", color: "#38b2ac", icon: "✅" },
    cancelled: { label: "ملغاة", color: "#e53e3e", icon: "❌" },
};

export default function LiveSessionsPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingType, setBookingType] = useState<"video" | "voice" | "chat">("video");
    const [bookingForm, setBookingForm] = useState({
        instructorId: "",
        date: "",
        time: "",
        title: "",
    });
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        // Fetch sessions
        fetch("/api/sessions")
            .then(res => res.json())
            .then(data => setSessions(data.sessions || []))
            .catch(() => { })
            .finally(() => setLoading(false));

        // Fetch instructors for booking dropdown
        fetch("/api/instructors")
            .then(res => res.json())
            .then(data => {
                if (data.users) setInstructors(data.users);
            })
            .catch(() => {});
            
    }, []);

    const activeSessions = sessions.filter(s => s.status === 'active');
    const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
    const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

    const handleOpenBooking = (type: "video" | "voice" | "chat") => {
        setBookingType(type);
        setIsBookingModalOpen(true);
        setBookingError("");
    };

    const handleBookSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingError("");

        if (!bookingForm.instructorId || !bookingForm.date || !bookingForm.time || !bookingForm.title) {
            setBookingError("جميع الحقول مطلوبة");
            return;
        }

        setIsBooking(true);
        try {
            const dateTime = new Date(`${bookingForm.date}T${bookingForm.time}:00`).toISOString();
            
            const res = await fetch("/api/sessions/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacher_id: bookingForm.instructorId,
                    title: bookingForm.title,
                    session_type: bookingType,
                    scheduled_at: dateTime
                }),
            });

            const data = await res.json();
            if (res.ok) {
                // Success! Add to list or redirect directly
                alert("تم حجز الجلسة بنجاح!");
                setIsBookingModalOpen(false);
                // Refresh sessions
                const refreshRes = await fetch("/api/sessions");
                const refreshData = await refreshRes.json();
                setSessions(refreshData.sessions || []);
            } else {
                setBookingError(data.message || "فشل تسجيل الجلسة، حاول مرة أخرى.");
            }
        } catch (err) {
            setBookingError("حدث خطأ غير متوقع.");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div style={{ paddingTop: "80px" }} className="min-h-screen pb-12">
            {/* Hero */}
            <div className="page-header" style={{ paddingBottom: '20px' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                    background: 'rgba(200, 150, 46, 0.08)',
                    border: '1px solid rgba(200, 150, 46, 0.15)',
                }}>
                    <span style={{ color: '#c8962e', fontSize: '0.85rem', fontWeight: 600 }}>✦ تعلم مباشرة مع الخبراء</span>
                </div>
                <h1>
                    الجلسات <span className="gradient-text">المباشرة</span>
                </h1>
                <p>احجز جلسة خاصة مع مدرّبك المفضل عبر فيديو، صوت، أو دردشة مباشرة!</p>
            </div>

            {/* Features & Booking Triggers */}
            <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    <div className="glass-card p-7 text-center group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between" style={{ borderTop: "3px solid #2da5c7" }}>
                        <div>
                            <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">📹</div>
                            <h3 className="font-bold text-base mb-2 text-cyber-100">مكالمات فيديو</h3>
                            <p className="text-sm text-cyber-400 mb-6">تواصل وجهاً لوجه مع المدرّبين لمناقشات أعمق</p>
                        </div>
                        <button 
                            onClick={() => handleOpenBooking("video")} 
                            aria-label="احجز مكالمة فيديو"
                            className="w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#2da5c715] text-[#2da5c7] border border-[#2da5c730] hover:bg-[#2da5c7] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#2da5c7] focus:ring-offset-2 focus:ring-offset-cyber-100 transition-all"
                        >
                            احجز فيديو الآن
                        </button>
                    </div>

                    <div className="glass-card p-7 text-center group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between" style={{ borderTop: "3px solid #805ad5" }}>
                        <div>
                            <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">🎙️</div>
                            <h3 className="font-bold text-base mb-2 text-cyber-100">مكالمات صوتية</h3>
                            <p className="text-sm text-cyber-400 mb-6">جلسات صوتية مركّزة وفعّالة للشروحات السريعة</p>
                        </div>
                        <button 
                            onClick={() => handleOpenBooking("voice")} 
                            aria-label="احجز مكالمة صوتية"
                            className="w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#805ad515] text-[#805ad5] border border-[#805ad530] hover:bg-[#805ad5] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#805ad5] focus:ring-offset-2 focus:ring-offset-cyber-100 transition-all"
                        >
                            احجز اتصال صوتي
                        </button>
                    </div>

                    <div className="glass-card p-7 text-center group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between" style={{ borderTop: "3px solid #c8962e" }}>
                        <div>
                            <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">💬</div>
                            <h3 className="font-bold text-base mb-2 text-cyber-100">دردشة منتورينج</h3>
                            <p className="text-sm text-cyber-400 mb-6">محادثة نصية مباشرة لحل المشاكل التقنية وتوجيه المسار</p>
                        </div>
                        <button 
                            onClick={() => handleOpenBooking("chat")} 
                            aria-label="ابدأ دردشة نصية"
                            className="w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#c8962e15] text-[#c8962e] border border-[#c8962e30] hover:bg-[#c8962e] hover:text-cyber-950 focus:outline-none focus:ring-2 focus:ring-[#c8962e] focus:ring-offset-2 focus:ring-offset-cyber-100 transition-all"
                        >
                            ابدأ دردشة
                        </button>
                    </div>
                </div>
            </section>

            {/* Sessions List */}
            <section className="section-container">
                <div className="max-w-5xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20 animate-pulse text-cyber-400">⏳ جاري تحميل الجلسات...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-20 glass-card rounded-2xl mx-4">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold mb-2 text-cyber-100">لا توجد لديك جلسات نشطة</h3>
                            <p className="mb-6 text-cyber-400">اختر أحد أنواع التوجيه بالأعلى لحجز جلستك الأولى مع خبرائنا.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Active Sessions */}
                            {activeSessions.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4 text-cyber-100">🔴 جلسات جاهزة للدخول</h2>
                                    <div className="grid gap-4">
                                        {activeSessions.map(session => (
                                            <SessionCard key={session.id} session={session} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Scheduled Sessions */}
                            {scheduledSessions.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4 text-cyber-100">📅 جلساتك المجدولة</h2>
                                    <div className="grid gap-4">
                                        {scheduledSessions.map(session => (
                                            <SessionCard key={session.id} session={session} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Past Sessions */}
                            {pastSessions.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4 text-cyber-400">📋 السجل السابق</h2>
                                    <div className="grid gap-4 opacity-75">
                                        {pastSessions.map(session => (
                                            <SessionCard key={session.id} session={session} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 slide-up">
                    <div className="bg-cyber-100 border border-cyber-700/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-4 left-4 text-cyber-400 hover:text-white">✕</button>
                        
                        <h2 className="text-2xl font-bold text-cyber-100 mb-1">
                            {bookingType === 'video' ? '📹 حجز مكالمة فيديو' : bookingType === 'voice' ? '🎙️ حجز مكالمة صوتية' : '💬 حجز دردشة توجيهية'}
                        </h2>
                        <p className="text-cyber-500 text-sm mb-6">يرجى ملء تفاصيل الجلسة. ستصل رسالة تنبيهية للمدرّب فوراً.</p>

                        {bookingError && <div className="p-3 mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">{bookingError}</div>}

                        <form onSubmit={handleBookSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-cyber-300 mb-2">اختر المدرّب</label>
                                <select 
                                    required 
                                    className="cyber-input w-full"
                                    value={bookingForm.instructorId}
                                    onChange={(e) => setBookingForm({...bookingForm, instructorId: e.target.value})}
                                >
                                    <option value="" disabled>-- قائمة المدرّبين المتاحين --</option>
                                    {instructors.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name} {inst.specialization ? `(${inst.specialization})` : ''}</option>
                                    ))}
                                    {/* Fallback if list is empty */}
                                    {instructors.length === 0 && <option value="mock-instructor-1">د. أحمد السعيد (Web Security)</option>}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-cyber-300 mb-2">موضوع الجلسة</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="مثال: مساعدة في مختبر الشبكات"
                                    className="cyber-input w-full"
                                    value={bookingForm.title}
                                    onChange={(e) => setBookingForm({...bookingForm, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-cyber-300 mb-2">تاريخ الجلسة</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="cyber-input w-full"
                                        min={new Date().toISOString().split('T')[0]} // today
                                        value={bookingForm.date}
                                        onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-cyber-300 mb-2">التوقيت</label>
                                    <input 
                                        type="time" 
                                        required 
                                        className="cyber-input w-full"
                                        value={bookingForm.time}
                                        onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isBooking}
                                aria-label="تأكيد الحجز"
                                className="w-full mt-6 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#c8962e] text-cyber-100 border border-transparent hover:bg-yellow-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c8962e] focus:ring-offset-2 focus:ring-offset-cyber-100 transition-all"
                            >
                                {isBooking ? 'جاري الحجز والتأكيد...' : 'تأكيد وحفظ الجلسة'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function SessionCard({ session }: { session: Session }) {
    const statusInfo = statusLabels[session.status] || statusLabels.scheduled;
    const date = session.scheduled_at ? new Date(session.scheduled_at) : null;
    
    // Check constraint: Can only join if within 10 minutes from exactly now
    const nowStamp = new Date().getTime();
    const scheduledStamp = date ? date.getTime() : 0;
    const tenMinsInMs = 10 * 60 * 1000;
    
    // Can join if now is after (scheduledStamp - 10mins) AND session is not marked completed/cancelled
    const canJoin = (nowStamp >= (scheduledStamp - tenMinsInMs)) && (session.status === 'scheduled' || session.status === 'active');

    return (
        <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4" style={{ borderLeftColor: statusInfo.color }}>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-cyber-100">{session.title}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{
                        background: `${statusInfo.color}15`,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}30`,
                    }}>
                        {statusInfo.icon} {statusInfo.label}
                    </span>
                </div>
                {session.description && (
                    <p className="text-sm mb-3 text-cyber-400">{session.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs mt-2" style={{ color: '#a89f8e' }}>
                    <span title="Teacher">👨‍🏫 المدرّب: {session.teacher_name || 'غير محدد'}</span>
                    <span title="Type">📍 النوع: {session.session_type === 'video' ? '📹 فيديو' : session.session_type === 'voice' ? '🎙️ صوت' : '💬 دردشة'}</span>
                    {date && <span dir="ltr">📅 {date.toLocaleDateString('ar-EG')} - {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
                {session.status === 'scheduled' && !canJoin && (
                    <div className="text-xs text-yellow-500 mt-2 bg-yellow-500/10 px-3 py-1 rounded w-fit">
                        ⏳ سيتم تفعيل رابط Google Meet قبل 10 دقائق من موعد الجلسة.
                    </div>
                )}
            </div>
            <div className="mt-4 md:mt-0 w-full md:w-auto shrink-0 flex">
                {(session.status === 'active' || session.status === 'scheduled') ? (
                    canJoin ? (
                        session.meet_link ? (
                            <a
                                href={session.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="الانضمام لجلسة Meet"
                                className="w-full md:w-auto py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-[0_4px_14px_0_rgba(26,115,232,0.39)] hover:shadow-[0_6px_20px_rgba(26,115,232,0.23)] hover:bg-[#1557b0] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-2 focus:ring-offset-white"
                                style={{ background: 'linear-gradient(135deg, #1A73E8, #4285F4)', color: 'white' }}
                            >
                                <span className="text-xl leading-none">🎥</span> الانضمام لجلسة Meet
                            </a>
                        ) : (
                            <span 
                                aria-label="رابط Meet قيد التوليد"
                                className="w-full md:w-auto py-3 px-6 rounded-xl font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200 flex items-center justify-center gap-2 cursor-wait"
                            >
                                <span className="text-xl leading-none animate-pulse">🔗</span> رابط Meet قيد التوليد...
                            </span>
                        )
                    ) : (
                        <button
                            disabled
                            aria-label="الغرفة مغلقة. سيتم فتحها قبل موعد الجلسة بـ 10 دقائق."
                            className="w-full md:w-auto py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 opacity-60 cursor-not-allowed transition-all"
                            style={{ background: '#333', color: 'gray' }}
                        >
                            <span className="text-lg leading-none">🔒</span> مغلق مؤقتاً
                        </button>
                    )
                ) : null}
            </div>
        </div>
    );
}

