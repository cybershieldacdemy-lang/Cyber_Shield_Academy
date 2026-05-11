"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Video, Users, Star, TrendingUp, Clock, CalendarCheck, FlaskConical } from "lucide-react";

interface InstructorStats {
    labsCount: number;
    coursesCount: number;
    studentsCount: number;
    earnings: number;
    totalSessions?: number;
}

const mockActivityData = [
  { name: 'السبت', sessions: 2 },
  { name: 'الأحد', sessions: 5 },
  { name: 'الإثنين', sessions: 3 },
  { name: 'الثلاثاء', sessions: 7 },
  { name: 'الأربعاء', sessions: 4 },
  { name: 'الخميس', sessions: 8 },
  { name: 'الجمعة', sessions: 1 },
];

export default function InstructorDashboardHome() {
    const [stats, setStats] = useState<InstructorStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/instructor/stats')
            .then(res => res.json())
            .then(data => {
                // Hardcoding mock earnings based on courses/sessions logic per user request
                setStats({
                  ...data,
                  earnings: (data.studentsCount * 15) + (data.labsCount * 50),
                  totalSessions: 24, // Mock until /api/instructor/sessions aggregated
                });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="animate-pulse flex gap-4 h-32"><div className="flex-1 rounded-2xl bg-white/5"></div><div className="flex-1 rounded-2xl bg-white/5"></div></div>;

    const cards = [
        { title: "الجلسات المكتملة", value: stats?.totalSessions || 0, icon: Video, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/30" },
        { title: "الطلاب النشطين", value: stats?.studentsCount || 0, icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-500/30" },
        { title: "الأرباح التقديرية", value: `$${stats?.earnings || 0}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/30" },
        { title: "متوسط التقييم", value: "4.9/5", icon: Star, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/30" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Overeview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className={`glass-panel p-6 border-t-2 relative overflow-hidden group`} style={{ borderTopColor: c.color.split('-')[1] }}>
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${c.bg}`}></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">{c.title}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{c.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} ${c.color} border ${c.border}`}>
                                <c.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphs and Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph Area */}
                <div className="lg:col-span-2 glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-cyan-400" /> معدل إنجاز الجلسات (هذا الأسبوع)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(11, 14, 20, 0.9)', borderColor: 'rgba(0, 245, 255, 0.2)', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#00f5ff' }}
                                />
                                <Area type="monotone" dataKey="sessions" stroke="#00f5ff" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Notifications & Recent Activity Feed */}
                <div className="glass-panel p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-pink-400" /> النشاط الأخير
                    </h3>
                    <div className="flex-1 space-y-4">
                        {[
                            { title: 'حجز جلسة جديدة', desc: 'عبدالرحمن حجز جلسة فيديو غداً', time: 'منذ 10 دقائق', icon: CalendarCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
                            { title: 'تقييم طالب 5 نجوم', desc: 'سما المكتوم تركت تقييماً إيجابياً', time: 'منذ ساعتين', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                            { title: 'تسجيل مختبر جديد', desc: 'تم اعتماد مختبر اختراق الشبكات اللاسلكية', time: 'بالأمس', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-400/10' }
                        ].map((act, i) => (
                            <div key={i} className="flex gap-4 border-b border-white/5 pb-4 last:border-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.bg} ${act.color}`}>
                                    <act.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-200">{act.title}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{act.desc}</p>
                                    <span className="text-[10px] text-gray-500 mt-1 block">{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
