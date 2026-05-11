"use client";

import { useState, useEffect } from 'react';

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then(data => {
                if (data.leaderboard) setLeaders(data.leaderboard);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-cyber-950" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyber-100 via-yellow-400 to-amber-600">لوحة الشرف والمنافسة</h1>
                    <p className="text-cyber-400 text-lg">أفضل الطلاب تفوقاً في أكاديمية درع السيبرانية</p>
                </div>

                <div className="relative">
                    {/* Podium for top 3 (Desktop only) */}
                    {leaders.length >= 3 && !loading && (
                        <div className="hidden md:flex justify-center items-end gap-6 mb-12 h-64">
                            {/* Rank 2 */}
                            <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <div className="relative w-20 h-20 rounded-full border-4 border-gray-400 overflow-hidden mb-3 bg-cyber-800">
                                    {leaders[1].avatar ? <img src={leaders[1].avatar} className="w-full h-full object-cover" alt="" /> : <span className="w-full h-full flex items-center justify-center text-3xl font-bold text-cyber-400">{leaders[1].name.charAt(0)}</span>}
                                    <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white z-10">2</div>
                                </div>
                                <div className="text-white font-bold text-lg">{leaders[1].name}</div>
                                <div className="text-cyber-100 font-mono font-bold">{leaders[1].points} pts</div>
                                <div className="w-24 h-24 bg-gradient-to-t from-[rgba(156,163,175,0.2)] to-transparent mt-2 rounded-t-lg border-t border-gray-400/50"></div>
                            </div>

                            {/* Rank 1 */}
                            <div className="flex flex-col items-center animate-fade-in-up">
                                <div className="relative w-28 h-28 rounded-full border-4 border-[#FFD700] overflow-hidden mb-3 bg-cyber-800 shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                                    {leaders[0].avatar ? <img src={leaders[0].avatar} className="w-full h-full object-cover" alt="" /> : <span className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#FFD700]">{leaders[0].name.charAt(0)}</span>}
                                    <div className="absolute -bottom-3 right-1/2 translate-x-1/2 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-sm font-bold text-cyber-100 z-10 shadow-lg">1</div>
                                </div>
                                <div className="text-white font-bold text-xl">{leaders[0].name}</div>
                                <div className="text-[#FFD700] font-mono font-bold text-lg shadow-sm">{leaders[0].points} pts</div>
                                <div className="w-32 h-32 bg-gradient-to-t from-[rgba(255,215,0,0.2)] to-transparent mt-2 rounded-t-lg border-t-2 border-[#FFD700]"></div>
                            </div>

                            {/* Rank 3 */}
                            <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <div className="relative w-20 h-20 rounded-full border-4 border-[#CD7F32] overflow-hidden mb-3 bg-cyber-800">
                                    {leaders[2].avatar ? <img src={leaders[2].avatar} className="w-full h-full object-cover" alt="" /> : <span className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#CD7F32]">{leaders[2].name.charAt(0)}</span>}
                                    <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-6 h-6 bg-[#CD7F32] rounded-full flex items-center justify-center text-xs font-bold text-white z-10">3</div>
                                </div>
                                <div className="text-white font-bold text-lg">{leaders[2].name}</div>
                                <div className="text-cyber-100 font-mono font-bold">{leaders[2].points} pts</div>
                                <div className="w-24 h-16 bg-gradient-to-t from-[rgba(205,127,50,0.2)] to-transparent mt-2 rounded-t-lg border-t border-[#CD7F32]/50"></div>
                            </div>
                        </div>
                    )}

                    {/* List View */}
                    <div className="bg-cyber-900 border border-cyber-800 rounded-3xl p-2 sm:p-6 shadow-2xl relative z-20">
                        {loading ? (
                            <div className="py-20 text-center text-cyber-500 animate-pulse text-lg font-mono">جاري حساب النقاط...</div>
                        ) : leaders.length === 0 ? (
                            <div className="py-20 text-center text-cyber-500">لا يوجد بيانات حتى الآن! كن أول من يجمع النقاط.</div>
                        ) : (
                            <div className="space-y-3">
                                {leaders.map((user, index) => (
                                    <div key={user.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-cyber-800/80 border ${index < 3 ? 'border-cyber-100/30 bg-cyber-900/10' : 'border-cyber-800 bg-cyber-800/30'}`}>
                                        <div className="w-8 font-mono text-xl font-bold text-cyber-500 text-center">
                                            {index + 1}
                                        </div>
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-cyber-700 flex-shrink-0">
                                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl text-cyber-100 font-bold">{user.name.charAt(0)}</div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-cyber-100 flex items-center gap-2">
                                                {user.name} 
                                                {index === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 hidden sm:inline-block">متصدر الأكاديمية</span>}
                                            </div>
                                            <div className="text-sm text-cyber-500 flex items-center gap-2 mt-1">
                                                <span className="text-cyber-500 text-xs px-2 py-0.5 rounded-md bg-cyber-500/10 border border-cyber-500/20">{user.experience_level === 'advanced' ? 'متقدم' : user.experience_level === 'intermediate' ? 'متوسط' : 'مبتدئ'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1 -space-x-reverse ml-4 hidden sm:flex">
                                                {user.badges?.slice(0, 3).map((b: any, i: number) => (
                                                    <div key={i} title={b.name} className="w-8 h-8 rounded-full bg-cyber-800 border border-cyber-700 flex items-center justify-center text-sm shadow-md z-[1]">
                                                        {b.icon}
                                                    </div>
                                                ))}
                                                {(user.badges?.length || 0) > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-cyber-800 border border-cyber-700 flex items-center justify-center text-xs text-cyber-400 font-bold shadow-md z-[0]">
                                                        +{user.badges.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-100 to-yellow-500">{user.points}</div>
                                                <div className="text-[10px] text-cyber-500 uppercase tracking-widest font-mono">Points</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center text-cyber-500 text-sm">
                    اربح النقاط والشارات من خلال إكمال الدروس والاختبارات للحصول على مراكز متقدمة.
                </div>
            </div>
        </div>
    );
}

