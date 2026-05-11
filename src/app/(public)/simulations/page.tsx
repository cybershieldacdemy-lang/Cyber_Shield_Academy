"use client";

import Link from 'next/link';

const scenarios = [
    {
        id: '1',
        title: 'السيناريو 1: اختراق خادم الويب',
        description: 'تم الإبلاغ عن اختراق محتمل في خادم الويب الأساسي لشركة AlphaCorp. قم بتحليل سجلات الوصول (Access Logs) لاكتشاف نوع الهجوم ومصدره.',
        difficulty: 'متوسط',
        type: 'Log Analysis',
        reward: 150
    },
    {
        id: 'red-vs-blue',
        title: 'محاكاة: الفريق الأحمر ضد الأزرق',
        description: 'بيئة تدريبية تفاعلية. اختر نوع الهجوم (الفريق الأحمر) وشاهد كيف يستجيب نظام الحماية ويولد السجلات (الفريق الأزرق).',
        difficulty: 'مبتدئ التدريب',
        type: 'Sandbox Engine',
        reward: 50
    }
];

export default function SimulationsHubPage() {
    return (
        <div className="min-h-screen bg-cyber-950" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cyber-100 font-mono tracking-widest uppercase">Simulations Hub</h1>
                    <p className="text-cyber-400 text-lg">تدرب على بيئات افتراضية حية ومحاكاة الاختراقات الحقيقية.</p>
                </div>

                <div className="space-y-6">
                    {scenarios.map(scenario => (
                        <div key={scenario.id} className="bg-cyber-900 border border-cyber-700 rounded-2xl p-6 hover:border-cyber-100/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h2 className="text-2xl font-bold text-cyber-100">{scenario.title}</h2>
                                    <span className="text-xs px-2 py-1 rounded-md bg-cyber-500/10 text-cyber-500 border border-cyber-500/20 font-mono tracking-wider">{scenario.type}</span>
                                </div>
                                <p className="text-cyber-400 text-base leading-relaxed">{scenario.description}</p>
                            </div>
                            
                            <div className="bg-cyber-800/50 border border-cyber-700 rounded-xl p-4 min-w-[200px] flex flex-col items-center justify-center">
                                <span className={`text-sm font-bold mb-2 ${scenario.difficulty === 'متوسط' ? 'text-orange-500' : 'text-blue-500'}`}>{scenario.difficulty}</span>
                                <span className="text-cyber-100 font-mono font-bold text-xl mb-4">+{scenario.reward} Points</span>
                                <Link href={`/simulations/${scenario.id}`} className="w-full text-center bg-white text-black font-bold py-2 rounded border border-white hover:bg-transparent hover:text-cyber-950 transition-all">
                                    بدء المحاكاة
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
