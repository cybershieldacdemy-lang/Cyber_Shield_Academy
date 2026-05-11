"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    experience_level?: string;
}

export default function StudentDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState<{ stats: any, enrolledCourses: any[], certificates: any[], badges?: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        Promise.all([
            fetch("/api/auth/me").then(r => r.json()),
            fetch("/api/sessions").then(r => r.json()),
            fetch("/api/dashboard/student").then(r => r.ok ? r.json() : null),
        ])
            .then(([authData, sessData, dashData]) => {
                if (authData.authenticated) {
                    setUser(authData.user);
                } else {
                    router.push("/login?redirect=/dashboard/student");
                }
                setSessions(sessData.sessions || []);
                if (dashData && dashData.authenticated) {
                    setDashboardData(dashData);
                }
            })
            .catch(() => router.push("/login"))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div style={{ paddingTop: "80px" }}>
                <div className="section-container">
                    {/* Header Skeleton */}
                    <div className="flex items-center gap-4 mb-8 animate-pulse">
                        <div className="w-16 h-16 rounded-2xl" style={{ background: '#ece4d4' }} />
                        <div>
                            <div className="h-6 w-48 rounded mb-2" style={{ background: '#ece4d4' }} />
                            <div className="h-4 w-32 rounded" style={{ background: '#f5efe3' }} />
                        </div>
                    </div>
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="glass-card p-5 text-center animate-pulse">
                                <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{ background: '#ece4d4' }} />
                                <div className="h-6 w-12 rounded mx-auto mb-1" style={{ background: '#ece4d4' }} />
                                <div className="h-3 w-20 rounded mx-auto" style={{ background: '#f5efe3' }} />
                            </div>
                        ))}
                    </div>
                    {/* Courses Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[1,2].map(i => (
                            <div key={i} className="glass-card p-6 animate-pulse">
                                <div className="h-5 w-32 rounded mb-5" style={{ background: '#ece4d4' }} />
                                {[1,2,3].map(j => (
                                    <div key={j} className="p-4 rounded-xl mb-3" style={{ background: '#faf6ed' }}>
                                        <div className="h-4 w-3/4 rounded mb-2" style={{ background: '#ece4d4' }} />
                                        <div className="h-3 w-1/2 rounded" style={{ background: '#f5efe3' }} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'active');

    return (
        <div style={{ paddingTop: "80px" }}>
            <div className="section-container">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{
                            background: 'linear-gradient(135deg, #c8962e, #b0831f)',
                        }}>
                            🎓
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-cyber-100">مرحباً، <span className="gradient-text">{user.name}</span></h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: 'rgba(200,150,46,0.15)', color: '#c8962e', border: '1px solid rgba(200,150,46,0.3)' }}>
                                    🎓 طالب
                                </span>
                                <Link href="/leaderboard" className="text-xs px-2.5 py-1 rounded-full font-bold hover:opacity-80 transition-opacity" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
                                    ⭐️ {dashboardData?.stats?.points || 0} نقطة
                                </Link>
                                <div className="flex -space-x-1 -space-x-reverse mx-2">
                                    {dashboardData?.badges?.slice(0, 5).map((b: any, i: number) => (
                                        <div key={b.id || i} title={b.name_ar} className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm shadow-md z-[1]">
                                            {b.icon}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard" className="btn-secondary !py-2 !px-4 !text-sm">← لوحة التحكم العامة</Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { icon: "⭐️", label: "النقاط", value: dashboardData?.stats?.points || "0", color: "#FFD700" },
                        { icon: "📚", label: "الدورات المسجلة", value: dashboardData?.stats?.enrolled || "0", color: "#c8962e" },
                        { icon: "✅", label: "الدورات المكتملة", value: dashboardData?.stats?.completed || "0", color: "#38b2ac" },
                        { icon: "🏆", label: "الشهادات", value: dashboardData?.stats?.certificates || "0", color: "#805ad5" },
                        { icon: "📹", label: "الجلسات المجدولة", value: upcomingSessions.length.toString(), color: "#2da5c7" }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-5 text-center">
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-cyber-400 text-xs mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-8">
                        {/* Upcoming Sessions */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-cyber-100 mb-5">📹 الجلسات القادمة</h2>
                        {upcomingSessions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm mb-3" style={{ color: '#a89f8e' }}>لا توجد جلسات مجدولة حالياً</p>
                                <Link href="/teachers" className="text-sm underline" style={{ color: '#c8962e' }}>
                                    تصفح المدرّبين واحجز جلسة
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingSessions.slice(0, 5).map(session => (
                                    <div key={session.id} className="p-4 rounded-xl flex items-center justify-between" style={{
                                        background: 'rgba(200,150,46,0.04)',
                                        border: '1px solid rgba(200,150,46,0.1)',
                                    }}>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: '#1a1612' }}>{session.title}</p>
                                            <p className="text-xs" style={{ color: '#a89f8e' }}>
                                                👨‍🏫 {session.teacher_name || 'مدرّب'} • {session.session_type === 'video' ? '📹' : '🎙️'}
                                            </p>
                                        </div>
                                        <Link href={`/live/${session.id}`} className="text-xs px-3 py-1.5 rounded-lg" style={{
                                            background: session.status === 'active' ? 'rgba(37,211,102,0.15)' : 'rgba(200,150,46,0.1)',
                                            color: session.status === 'active' ? '#128c7e' : '#c8962e',
                                        }}>
                                            {session.status === 'active' ? '🔗 انضم' : '👁️ عرض'}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Certificates */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-cyber-100 mb-5">🏆 شهاداتي</h2>
                        {!dashboardData?.certificates || dashboardData.certificates.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm mb-3" style={{ color: '#a89f8e' }}>لم تحصل على أي شهادة بعد</p>
                                <p className="text-xs" style={{ color: '#718096' }}>أكمل دورة بنسبة 100% للحصول على شهادتك</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dashboardData.certificates.map((cert: any) => (
                                    <div key={cert.id} className="p-4 rounded-xl flex flex-col gap-3" style={{
                                        background: 'rgba(200,150,46,0.04)',
                                        border: '1px solid rgba(200,150,46,0.1)',
                                    }}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-cyber-100 text-sm mb-1">{cert.course_title}</h3>
                                                <p className="text-xs text-cyber-400 font-mono">
                                                    {cert.certificate_code}
                                                </p>
                                            </div>
                                            <Link href={`/certificates/${cert.id}`} className="flex-shrink-0 text-xs px-4 py-2 rounded-lg font-medium transition-colors" style={{
                                                background: 'linear-gradient(135deg, #c8962e, #b0831f)',
                                                color: 'white'
                                            }}>
                                                👁️ عرض الشهادة
                                            </Link>
                                        </div>
                                        <div className="text-xs text-cyber-500">
                                            تاريخ الإصدار: {new Date(cert.issued_at + 'Z').toLocaleDateString('ar-EG')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                    {/* Enrolled Courses */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-cyber-100 mb-5">📚 دوراتي</h2>
                        {!dashboardData?.enrolledCourses || dashboardData.enrolledCourses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm mb-3" style={{ color: '#a89f8e' }}>لم تسجل في أي دورة بعد</p>
                                <Link href="/courses" className="text-sm underline" style={{ color: '#c8962e' }}>
                                    تصفح الدورات المتاحة
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dashboardData.enrolledCourses.map((course: any) => (
                                    <div key={course.id} className="p-4 rounded-xl flex flex-col gap-3" style={{
                                        background: 'rgba(200,150,46,0.04)',
                                        border: '1px solid rgba(200,150,46,0.1)',
                                    }}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-cyber-100 text-sm mb-1">{course.title_ar}</h3>
                                                <p className="text-xs text-cyber-400">
                                                    تم الإنجاز: {course.progress}%
                                                </p>
                                            </div>
                                            <Link href={`/courses/${course.id}`} className="flex-shrink-0 text-xs px-4 py-2 rounded-lg font-medium transition-colors" style={{
                                                background: course.completed ? 'rgba(56,178,172,0.15)' : 'linear-gradient(135deg, #c8962e, #b0831f)',
                                                color: course.completed ? '#38b2ac' : 'white'
                                            }}>
                                                {course.completed ? 'مراجعة الدورة' : 'متابعة التعلم'}
                                            </Link>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="w-full bg-cyber-900 rounded-full h-2 mt-1 relative overflow-hidden">
                                            <div className="h-2 rounded-full transition-all duration-1000" style={{
                                                width: `${course.progress}%`,
                                                background: course.completed ? '#38b2ac' : 'linear-gradient(90deg, #c8962e, #e8c068)'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
