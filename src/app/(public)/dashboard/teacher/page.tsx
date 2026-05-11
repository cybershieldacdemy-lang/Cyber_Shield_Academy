"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TeacherStats {
    coursesCount: number;
    studentsCount: number;
    commentsCount: number;
}

export default function TeacherDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch('/api/teacher/stats')
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    router.push('/login');
                    throw new Error("غير مصرح");
                }
                return res.json();
            })
            .then(data => setStats(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div className="animate-pulse text-cyber-500 py-8">جاري تحميل البيانات...</div>;
    if (error) return <div className="text-red-400 py-8">{error}</div>;

    const quickActions = [
        { label: 'إدارة الدورات التعليمية', href: '/dashboard/teacher/courses', icon: '📚', color: '#c8962e' },
        { label: 'الاستفسارات والمناقشات', href: '/dashboard/teacher/discussions', icon: '💬', color: '#38b2ac' },
        { label: 'إدارة الطلاب ومتابعة التقدم', href: '/dashboard/teacher/students', icon: '👥', color: '#9f7aea' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-cyber-100 mb-2">نظرة عامة</h1>
                    <p className="text-cyber-400">مرحباً بك في لوحة تحكم المدرّب. إليك إحصائيات الأكاديمية السريعة.</p>
                </div>
                <Link href="/dashboard" className="text-sm font-bold bg-cyber-900 border border-cyber-700 text-cyber-300 px-4 py-2 rounded-lg hover:text-white transition-colors">
                    العودة للموقع
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(200,150,46,0.1)', color: '#c8962e' }}>
                        📚
                    </div>
                    <div>
                        <div className="text-cyber-400 text-sm mb-1">إجمالي الدورات</div>
                        <div className="text-2xl font-bold text-cyber-100">{stats?.coursesCount}</div>
                    </div>
                </div>

                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(56,178,172,0.1)', color: '#38b2ac' }}>
                        🎓
                    </div>
                    <div>
                        <div className="text-cyber-400 text-sm mb-1">الطلاب المسجلين</div>
                        <div className="text-2xl font-bold text-cyber-100">{stats?.studentsCount}</div>
                    </div>
                </div>

                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(159,122,234,0.1)', color: '#9f7aea' }}>
                        💬
                    </div>
                    <div>
                        <div className="text-cyber-400 text-sm mb-1">إجمالي النقاشات</div>
                        <div className="text-2xl font-bold text-cyber-100">{stats?.commentsCount}</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-cyber-100 mb-6">إجراءات سريعة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map(action => (
                    <Link key={action.label} href={action.href} className="group block">
                        <div className="glass-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: `${action.color}30` }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform group-hover:scale-110" style={{ background: `${action.color}15`, color: action.color }}>
                                {action.icon}
                            </div>
                            <h3 className="font-bold text-cyber-100 group-hover:text-white transition-colors">
                                {action.label}
                            </h3>
                            <div className="mt-4 text-xs font-bold flex items-center gap-2 transition-all" style={{ color: action.color }}>
                                <span>البدء الآن</span>
                                <span>←</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
