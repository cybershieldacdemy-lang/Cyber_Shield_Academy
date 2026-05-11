"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Eye, DollarSign, Star, Award, TrendingUp, Activity, PlayCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const data = [
    { name: "يناير", views: 4000, students: 2400 },
    { name: "فبراير", views: 3000, students: 1398 },
    { name: "مارس", views: 2000, students: 9800 },
    { name: "أبريل", views: 2780, students: 3908 },
    { name: "مايو", views: 1890, students: 4800 },
    { name: "يونيو", views: 2390, students: 3800 },
    { name: "يوليو", views: 3490, students: 4300 },
];

const StatCard = ({ title, value, icon: Icon, trend, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-[#111827]/60 backdrop-blur-md border border-cyber-800/50 p-6 rounded-2xl relative overflow-hidden group hover:border-cyber-500/30 transition-colors shadow-lg"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyber-500/10 to-transparent blur-2xl rounded-full pointer-events-none group-hover:from-cyber-500/20 transition-all" />
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
            <div className="p-3 bg-cyber-900/50 rounded-xl border border-cyber-800 shadow-[0_0_15px_rgba(0,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-shadow">
                <Icon className="w-6 h-6 text-cyber-500" />
            </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm relative z-10">
            <span className={`flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp className={`w-4 h-4 ${trend < 0 && 'rotate-180'}`} />
                {Math.abs(trend)}%
            </span>
            <span className="text-gray-500">مقارنة بالشهر الماضي</span>
        </div>
    </motion.div>
);

export default function InstructorDashboard() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم الرئيسية</h1>
                    <p className="text-gray-400">مرحباً بك، إليك ملخص لأداء دوراتك وطلابك.</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-cyber-600 to-cyber-500 text-[#0B0F19] px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all hover:-translate-y-1">
                    <PlayCircle className="w-5 h-5" />
                    <span>إنشاء دورة جديدة</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard title="إجمالي الطلاب" value="12,450" icon={Users} trend={12.5} delay={0.1} />
                <StatCard title="الدورات المنشورة" value="24" icon={BookOpen} trend={4.2} delay={0.2} />
                <StatCard title="إجمالي المشاهدات" value="845K" icon={Eye} trend={24.8} delay={0.3} />
                <StatCard title="متوسط التقييم" value="4.8/5" icon={Star} trend={1.2} delay={0.4} />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="xl:col-span-2 bg-[#111827]/60 backdrop-blur-md border border-cyber-800/50 p-6 rounded-2xl shadow-lg"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyber-500" />
                        نمو تفاعل الطلاب والمشاهدات
                    </h3>
                    <div className="h-[350px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#4B5563" tick={{ fill: '#9CA3AF' }} />
                                <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF' }} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                                    itemStyle={{ color: '#00E5FF' }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-[#111827]/60 backdrop-blur-md border border-cyber-800/50 p-6 rounded-2xl shadow-lg flex flex-col"
                >
                    <h3 className="text-lg font-bold text-white mb-6">أحدث النشاطات</h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {[
                            { title: "سجل طالب جديد في دورة لينكس", time: "قبل 10 دقائق", color: "bg-blue-500" },
                            { title: "تم تقييم دورتك 5 نجوم من قبل أحمد", time: "قبل ساعة", color: "bg-yellow-500" },
                            { title: "تم تسليم 15 واجب في دورة الاختراق", time: "قبل 3 ساعات", color: "bg-green-500" },
                            { title: "اكتملت معالجة فيديو الدرس الخامس", time: "قبل 5 ساعات", color: "bg-cyber-500" },
                            { title: "تم إصدار 3 شهادات جديدة", time: "قبل يوم", color: "bg-purple-500" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full ${item.color} mt-1.5 shadow-[0_0_10px_currentColor]`} />
                                    {i !== 4 && <div className="w-0.5 h-full bg-cyber-800/50 my-1 group-hover:bg-cyber-500/50 transition-colors" />}
                                </div>
                                <div className="pb-4">
                                    <p className="text-white text-sm font-medium">{item.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
