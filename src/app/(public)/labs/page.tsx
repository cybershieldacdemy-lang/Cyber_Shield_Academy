import React from 'react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

import { prisma as db } from '@/lib/db';
import { Terminal, Shield, Cpu, Lock, Flame } from 'lucide-react';

export const metadata = {
    title: 'المختبرات العملية | أكاديمية الدرع السيبراني',
    description: 'تدرب في بيئات افتراضية حقيقية'
};

export default async function LabsPage() {
    const labs = await db.lab.findMany({
        where: { isPublished: 1 },
        include: {
            _count: {
                select: { challenges: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'text-green-400 border-green-400/20 bg-green-400/10';
            case 'medium': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
            case 'hard': return 'text-red-400 border-red-400/20 bg-red-400/10';
            case 'insane': return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
            default: return 'text-cyber-400 border-cyber-400/20 bg-cyber-400/10';
        }
    };

    return (
        <div className="min-h-screen bg-[#06080a] py-20 px-4">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-4 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center gap-4">
                        <Terminal className="text-accent" size={40} />
                        المختبرات العملية (Cyber Range)
                    </h1>
                    <p className="text-cyber-400 text-lg max-w-2xl mx-auto">
                        بيئات افتراضية حقيقية للتدريب على الاختراق والدفاع. اختر الآلة، اتصل بالشبكة، وابدأ بجمع الأعلام (Flags).
                    </p>
                </div>

                {/* Labs Grid */}
                {labs.length === 0 ? (
                    <div className="text-center py-20 bg-cyber-900/20 rounded-2xl border border-cyber-800/50">
                        <Flame className="mx-auto text-cyber-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-white mb-2">لا توجد مختبرات متاحة حالياً</h2>
                        <p className="text-cyber-500">جاري تجهيز الآلات الافتراضية، يرجى العودة لاحقاً.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {labs.map((lab) => (
                            <Link key={lab.id} href={`/labs/${lab.id}`} className="block group">
                                <div className="bg-[#0b0e14]/80 backdrop-blur-md p-6 rounded-2xl border border-cyber-800/50 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(0,255,0,0.1)] transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                                    
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors"></div>
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-cyber-900 flex items-center justify-center border border-cyber-800 text-accent group-hover:scale-110 transition-transform">
                                            {lab.category === 'Web' ? <Globe size={24} /> : 
                                             lab.category === 'Crypto' ? <Lock size={24} /> : 
                                             <Cpu size={24} />}
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getDifficultyColor(lab.difficulty)} uppercase tracking-wider`}>
                                            {lab.difficulty}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">{lab.title}</h3>
                                    <p className="text-cyber-400 text-sm mb-6 line-clamp-2 relative z-10">{lab.description}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-cyber-800/50 flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-2 text-xs text-cyber-500">
                                            <Shield size={14} />
                                            <span>{lab._count.challenges} أعلام (Flags)</span>
                                        </div>
                                        <div className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                                            {lab.category}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Dummy icon for globe
const Globe = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
);
