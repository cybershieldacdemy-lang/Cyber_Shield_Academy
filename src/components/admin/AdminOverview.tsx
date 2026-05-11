'use client';
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Video, BookOpen, Activity, ShieldCheck, Flame, Target } from 'lucide-react';

// Mock data for the advanced charts
const monthlyData = [
    { name: 'يناير', users: 400, sessions: 240, incidents: 20 },
    { name: 'فبراير', users: 300, sessions: 139, incidents: 15 },
    { name: 'مارس', users: 200, sessions: 980, incidents: 40 },
    { name: 'أبريل', users: 278, sessions: 390, incidents: 10 },
    { name: 'مايو', users: 189, sessions: 480, incidents: 5 },
    { name: 'يونيو', users: 239, sessions: 380, incidents: 12 },
    { name: 'يوليو', users: 349, sessions: 430, incidents: 8 },
];

export default function AdminOverview() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>({
        overview: { totalSessionsToday: 0, activeSessionsNow: 0, totalBookings: 0, totalInstructors: 0 },
        distribution: []
    });

    useEffect(() => {
        fetch('/api/admin/metrics')
            .then(r => r.json())
            .then(data => {
                if (data.overview) {
                    setMetrics(data);
                }
            })
            .catch(console.error)
            .finally(() => {
                // Add a small artificial delay to show off the cool skeletons
                setTimeout(() => setLoading(false), 800);
            });
    }, []);

    const SkeletonCard = () => (
        <div className="bg-cyber-900/20 p-6 rounded-2xl border border-cyber-800/30 relative overflow-hidden h-[160px]">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <div className="w-12 h-12 rounded-xl bg-cyber-800/50 mb-4"></div>
            <div className="w-24 h-4 bg-cyber-800/50 rounded mb-2"></div>
            <div className="w-16 h-8 bg-cyber-800/50 rounded mt-4"></div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        النظرة العامة <Activity className="text-accent" />
                    </h1>
                    <p className="text-cyber-400">مرحباً بك في مركز القيادة، إليك ملخص أداء المنصة اليوم.</p>
                </div>
                <div className="flex items-center gap-2 bg-cyber-900/50 px-4 py-2 rounded-xl border border-cyber-800/50">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-mono text-green-400">Live Updates Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    [
                        { title: 'جلسات اليوم', value: metrics.overview.totalSessionsToday, icon: Video, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', glow: 'bg-green-500', trend: '+12%' },
                        { title: 'جلسات مستمرة الآن', value: metrics.overview.activeSessionsNow, icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'bg-red-500', trend: 'Live' },
                        { title: 'إجمالي الحجوزات', value: metrics.overview.totalBookings, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'bg-blue-500', trend: '+5.4%' },
                        { title: 'المدربين المعتمدين', value: metrics.overview.totalInstructors, icon: ShieldCheck, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', glow: 'bg-accent', trend: '+2' },
                    ].map((stat, i) => (
                        <div key={i} className={`bg-[#0b0e14]/80 backdrop-blur-md p-6 rounded-2xl border ${stat.border} relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300`}>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded-md ${stat.bg} ${stat.color}`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <h3 className="text-cyber-400 text-sm font-medium mb-1 relative z-10">{stat.title}</h3>
                            <p className="text-4xl font-black text-white tracking-widest relative z-10">{stat.value}</p>

                            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${stat.glow}`}></div>
                        </div>
                    ))
                )}
            </div>

            {/* Advanced Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Activity Chart */}
                <div className="lg:col-span-2 bg-[#0b0e14]/80 backdrop-blur-md p-6 rounded-2xl border border-cyber-800/50 shadow-xl relative overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-400" size={20} />
                        معدل نمو المنصة (شهرياً)
                    </h3>
                    <div className="w-full h-[300px]">
                        {loading ? (
                            <div className="w-full h-full bg-cyber-900/20 animate-pulse rounded-xl"></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="name" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0b0e14', borderColor: '#1f2937', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="users" name="المستخدمين الجدد" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    <Area type="monotone" dataKey="sessions" name="الجلسات المكتملة" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Distribution Pie Chart */}
                <div className="bg-[#0b0e14]/80 backdrop-blur-md p-6 rounded-2xl border border-cyber-800/50 shadow-xl relative overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Target className="text-purple-400" size={20} />
                        توزيع أنواع الحجوزات
                    </h3>
                    <div className="flex-1 w-full relative z-10 min-h-[300px]">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-48 h-48 rounded-full border-8 border-cyber-800/30 border-t-purple-500/50 animate-spin"></div>
                            </div>
                        ) : metrics.distribution.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-cyber-500">
                                <div className="text-4xl mb-2 opacity-50">📊</div>
                                <span className="font-mono text-sm">NO_DATA_AVAILABLE</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={metrics.distribution} 
                                        dataKey="value" 
                                        nameKey="session_type" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={70}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        stroke="rgba(0,0,0,0.2)"
                                        strokeWidth={2}
                                    >
                                        {metrics.distribution.map((entry: any, index: number) => {
                                            const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                                            return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                                        })}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0b0e14', borderColor: '#1f2937', color: '#fff', borderRadius: '12px', padding: '10px' }} 
                                        itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                                    />
                                    <Legend verticalAlign="bottom" height={40} wrapperStyle={{ color: '#9ca3af', fontSize: '12px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
