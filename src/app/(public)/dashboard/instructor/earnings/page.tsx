"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Download } from "lucide-react";

const mockEarningsData = [
  { name: 'يناير', earning: 400 },
  { name: 'فبراير', earning: 300 },
  { name: 'مارس', earning: 750 },
  { name: 'أبريل', earning: 200 },
  { name: 'مايو', earning: 600 },
];

export default function InstructorEarningsPage() {
    const [stats, setStats] = useState({ totalReceived: 0, pending: 0, thisMonth: 0, sessionsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch sessions stats to calculate dynamic mocked earnings
        fetch('/api/instructor/sessions').then(res => res.json()).then(data => {
            const completedLen = data.completed?.length || 0;
            const activeLen = data.active?.length || 0;
            const mockRate = 18.5; // Average earnings per session
            setStats({
                totalReceived: Math.round(completedLen * mockRate),
                pending: Math.round(activeLen * mockRate) + 42,
                thisMonth: Math.round((completedLen / 2) * mockRate),
                sessionsCount: completedLen
            });
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-cyan-400 animate-pulse text-center mt-20">جاري تجميع البيانات المالية...</div>;

    const cards = [
        { title: "رصيد متاح للسحب", value: `$${stats.totalReceived}`, icon: DollarSign, trend: "+12%", up: true },
        { title: "أرباح هذا الشهر", value: `$${stats.thisMonth}`, icon: ArrowUpRight, trend: "+4%", up: true },
        { title: "دفعات معلقة (في الانتظار)", value: `$${stats.pending}`, icon: Clock, trend: "-2%", up: false },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">الأرباح والمدفوعات</h2>
                    <p className="text-sm text-gray-400 mt-1">تتبع أرباحك وتفاصيل التحويلات البنكية.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition">
                    <CreditCard size={18} /> طلب سحب الرصيد
                </button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className="glass-panel p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center">
                                <c.icon size={20} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 ${c.up ? 'text-green-400' : 'text-red-400'}`}>
                                {c.trend} من الشهر الماضي
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{c.title}</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{c.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart Area */}
                <div className="lg:col-span-2 glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-6">معدل الأرباح هذا العام</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(11, 14, 20, 0.9)', borderColor: 'rgba(0, 245, 255, 0.2)', borderRadius: '8px', color: '#fff' }}
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                />
                                <Bar dataKey="earning" fill="#00f5ff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ledger / Log */}
                <div className="glass-panel p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">سجل التحويلات</h3>
                        <Download size={18} className="text-gray-400 cursor-pointer hover:text-white" />
                    </div>
                    <div className="flex-1 space-y-4">
                        {[
                            { text: 'تحويل بنكي صادر', date: '12 مايو 2026', amount: '-$400.00', status: 'مكتمل' },
                            { text: 'رسوم جلسة مع الطالب عبدالرحمن', date: '10 مايو 2026', amount: '+$18.50', status: 'مضاف' },
                            { text: 'رسوم جلسة فيديو استشارية', date: '08 مايو 2026', amount: '+$18.50', status: 'مضاف' },
                        ].map((log, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-200">{log.text}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{log.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold font-mono ${log.amount.startsWith('+') ? 'text-green-400' : 'text-white'}`}>{log.amount}</p>
                                    <p className="text-[10px] text-gray-500">{log.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Clock(props: any) {
    return <svg viewBox="0 0 24 24" width={props.size} height={props.size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={props.className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
}
