"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Teacher {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    country: string | null;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/teachers")
            .then(res => res.json())
            .then(data => setTeachers(data.teachers || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const colors = ['#c8962e', '#2da5c7', '#805ad5', '#d69e2e', '#e53e3e', '#38b2ac'];

    return (
        <div style={{ paddingTop: "80px" }}>
            {/* Hero */}
            <div className="page-header" style={{ paddingBottom: '20px' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                    background: 'rgba(200, 150, 46, 0.08)',
                    border: '1px solid rgba(200, 150, 46, 0.15)',
                }}>
                    <span style={{ color: '#c8962e', fontSize: '0.85rem', fontWeight: 600 }}>✦ فريق المدرّبين المتميز</span>
                </div>
                <h1>
                    <span className="gradient-text">مدرّبونا</span> المتخصصون
                </h1>
                <p>خبراء في الأمن السيبراني مستعدون لمساعدتك في رحلة التعلم</p>
            </div>

            <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
                {loading ? (
                    <div className="text-center py-20">
                        <div className="text-cyber-400 text-lg">⏳ جاري تحميل المدرّبين...</div>
                    </div>
                ) : teachers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1612' }}>لا يوجد مدرّبون حالياً</h3>
                        <p className="mb-6" style={{ color: '#7a7164' }}>كن أول من ينضم إلى فريق المدرّبين!</p>
                        <Link href="/become-teacher" className="btn-primary">
                            انضم كمدرّب الآن
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {teachers.map((teacher, i) => {
                            const color = colors[i % colors.length];
                            return (
                                <div key={teacher.id} className="glass-card p-7 text-center group hover:scale-[1.02] transition-transform">
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold"
                                        style={{
                                            background: `${color}15`,
                                            border: `2px solid ${color}30`,
                                            color: color,
                                        }}
                                    >
                                        {teacher.avatar ? (
                                            <img src={teacher.avatar} alt={teacher.name} className="w-full h-full rounded-2xl object-cover" />
                                        ) : (
                                            teacher.name.charAt(0)
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1" style={{ color: '#1a1612' }}>{teacher.name}</h3>
                                    {teacher.country && (
                                        <p className="text-xs mb-2" style={{ color }}>🌍 {teacher.country}</p>
                                    )}
                                    {teacher.bio && (
                                        <p className="text-sm leading-relaxed" style={{ color: '#7a7164' }}>
                                            {teacher.bio.length > 100 ? teacher.bio.slice(0, 100) + '...' : teacher.bio}
                                        </p>
                                    )}
                                    <div className="mt-4 flex gap-2 justify-center">
                                        <Link
                                            href={`/live`}
                                            className="text-xs px-4 py-2 rounded-lg transition-all"
                                            style={{ background: `${color}10`, color, border: `1px solid ${color}25` }}
                                        >
                                            📹 حجز جلسة مباشرة
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section className="section-container text-center" style={{ paddingTop: '0', paddingBottom: '60px' }}>
                <div className="glass-card p-10 md:p-14 relative overflow-hidden max-w-4xl mx-auto">
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'radial-gradient(rgba(200, 150, 46, 0.3) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }} />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            هل أنت خبير في <span className="gradient-text">الأمن السيبراني</span>؟
                        </h2>
                        <p className="mb-8 max-w-xl mx-auto" style={{ color: '#5c5549' }}>
                            انضم إلى فريق المدرّبين وشارك معرفتك مع المجتمع العربي
                        </p>
                        <Link href="/become-teacher" className="btn-primary text-base px-8 py-3.5">
                            👨‍🏫 قدّم الآن
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
