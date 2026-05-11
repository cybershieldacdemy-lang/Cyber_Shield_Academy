"use client";

import { useState, useRef, useEffect, use } from 'react';

const mockLogs = [
    "[10:01:23] 192.168.1.45 GET /login.php 200 OK",
    "[10:01:25] 192.168.1.45 POST /login.php 401 Unauthorized",
    "[10:01:50] 203.0.113.88 GET /index.php 200 OK",
    "[10:02:11] 203.0.113.88 GET /about.php 200 OK",
    "[10:05:00] 10.0.0.5 GET /api/users?id=1 200 OK",
    "[10:05:01] 10.0.0.5 GET /api/users?id=1%20OR%201=1 500 Internal Server Error",
    "[10:05:02] 10.0.0.5 GET /api/users?id=1%20UNION%20SELECT%20username,password%20FROM%20users 200 OK",
    "[10:06:15] 192.168.1.45 GET /dashboard.php 403 Forbidden",
    "[10:10:00] 203.0.113.88 GET /contact.php 200 OK"
];

export default function LogAnalysisSimulation({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('analyzing');
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Simulate logs streaming in over time
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < mockLogs.length) {
                setLogs(prev => [...prev, mockLogs[i]]);
                i++;
                logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else {
                setStatus('completed');
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    if (resolvedParams.id !== '1') {
        return null; // Handle red-vs-blue elsewhere or show 404
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ans = answer.toLowerCase().trim();
        
        // Correct answer check (SQL Injection from 10.0.0.5)
        if ((ans.includes('sql') || ans.includes('sqli') || ans.includes('injection')) && ans.includes('10.0.0.5')) {
            setFeedback({ success: true, text: "عمل رائع! لقد اكتشفت بدقة هجوم SQL Injection قادماً من IP: 10.0.0.5" });
            
            // Add gamification points (silently calling CTF api or progress api)
            try {
                // To reuse existing logic, we can pretend this is a CTF submission or just award directly via a generic progress API if we had one.
                // For demonstration, we'll just show the UI success.
                await fetch('/api/ctf/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId: 999, flag: 'CyberShield{sim_1_passed}' }) }).catch(()=>null);
            } catch {}

        } else if (ans.includes('sql')) {
            setFeedback({ success: false, text: "حسناً، إنه هجوم SQL حقاً ولكن من هو المهاجم (ما هو عنوان IP)؟" });
        } else if (ans.includes('10.0.0.5')) {
            setFeedback({ success: false, text: "بالفعل هذا هو الـ IP الخبيث، ولكن ما نوع الهجوم؟" });
        } else {
            setFeedback({ success: false, text: "إجابة غير دقيقة. راجع السجلات وحاول البحث عن استعلامات غريبة وعنوان الـ IP المرتبط بها." });
        }
    };

    return (
        <div className="min-h-screen bg-cyber-950 text-cyber-300 font-mono" style={{ paddingTop: '80px' }}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
                
                {/* Simulated Terminal Window */}
                <div className="flex-1 bg-cyber-950 border border-cyber-700 rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                    <div className="bg-cyber-900 border-b border-cyber-700 px-4 py-2 flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-cyber-500 text-xs text-center flex-1">root@alphacorp:/var/log/apache2/access.log</span>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed" style={{ color: '#00ff00' }}>
                        {logs.map((log, i) => (
                            <div key={i} className={`${log?.includes('500') ? 'text-red-500' : log?.includes('UNION') ? 'text-yellow-400' : ''}`}>
                                {log}
                            </div>
                        ))}
                        {status === 'analyzing' && (
                            <div className="animate-pulse mt-2 text-cyber-500">_ tailing logs...</div>
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                {/* Analysis Panel */}
                <div className="w-full md:w-[400px] flex flex-col gap-6">
                    <div className="bg-cyber-900 border border-cyber-700 rounded-xl p-6 flex-1">
                        <h2 className="text-xl font-bold text-cyber-100 mb-2">تعليمات المهمة</h2>
                        <p className="text-sm text-cyber-400 mb-6 leading-relaxed">
                            راقب السجلات الحية الواردة من خادم الويب. ابحث عن أي أنماط غير طبيعية أو طلبات مشبوهة.
                            حدد <strong>نوع الهجوم</strong> و <strong>عنوان الـ IP</strong> الخاص بالمهاجم.
                        </p>

                        <div className="bg-cyber-800/50 p-4 border border-cyber-700 rounded-lg mb-6">
                            <span className="text-xs text-cyber-500 block mb-1">Status</span>
                            {status === 'analyzing' ? (
                                <span className="text-yellow-500 font-bold animate-pulse">يتم استلام السجلات...</span>
                            ) : (
                                <span className="text-green-500 font-bold">اكتمل التقرير. ابدأ التحليل.</span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="mt-auto">
                            <label className="block text-sm font-bold text-cyber-400 mb-2">تقرير المحلل الأمني:</label>
                            <textarea 
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                className="w-full bg-cyber-950 border border-cyber-600 rounded-xl p-3 text-cyber-100 outline-none focus:border-cyber-100 transition-all font-mono text-sm mb-4"
                                rows={4}
                                placeholder="اكتب استنتاجك هنا... (مثال: هجوم XSS من 192.168.1.1)"
                            />
                            
                            {feedback && (
                                <div className={`p-4 rounded-lg text-sm font-bold mb-4 border ${feedback.success ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                    {feedback.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={status === 'analyzing' || !answer.trim()}
                                className="w-full bg-cyber-100 hover:bg-white disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all"
                            >
                                إرسال التقرير النهائي
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
