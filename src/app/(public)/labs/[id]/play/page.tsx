'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Terminal, Flag, Clock, CheckCircle2, Shield, AlertTriangle, Play, Square } from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamically import the Terminal component so it only runs on the client
const LabTerminal = dynamic(() => import('@/components/labs/LabTerminal'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-[#06080a] border border-cyber-800/50 rounded-xl flex items-center justify-center flex-col gap-4">
            <div className="w-12 h-12 border-4 border-t-accent border-cyber-800 rounded-full animate-spin"></div>
            <span className="text-cyber-500 font-mono text-sm tracking-widest">INITIALIZING TERMINAL...</span>
        </div>
    )
});

export default function LabPlayEnvironment({ params }: { params: Promise<{ id: string }> }) {
    const { id: labId } = use(params);
    const router = useRouter();
    const [lab, setLab] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    
    // Flag inputs
    const [flags, setFlags] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);

    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

    const fetchLabData = async () => {
        try {
            const res = await fetch(`/api/labs/${labId}`);
            if (!res.ok) {
                toast.error('لم يتم العثور على المختبر');
                router.push('/labs');
                return;
            }
            const data = await res.json();
            setLab(data.lab);
            setProgress(data.progress);
            setSession(data.activeSession);
        } catch (error) {
            console.error('Error fetching lab:', error);
            toast.error('حدث خطأ أثناء جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabData();
    }, [labId]);

    useEffect(() => {
        if (session?.expiresAt) {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const expiry = new Date(session.expiresAt).getTime();
                const distance = expiry - now;

                if (distance < 0) {
                    clearInterval(interval);
                    setTimeLeft('EXPIRED');
                    setSession(null); // Force refresh
                } else {
                    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const startMachine = async () => {
        setStarting(true);
        const loadingToast = toast.loading('جاري تشغيل الآلة الافتراضية...');
        try {
            const res = await fetch(`/api/labs/${labId}/start`, { method: 'POST' });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to start machine');
            
            toast.success('تم تشغيل الآلة بنجاح!', { id: loadingToast });
            setSession(data);
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setStarting(false);
        }
    };

    const stopMachine = async () => {
        const loadingToast = toast.loading('جاري إيقاف الآلة...');
        try {
            const res = await fetch(`/api/labs/${labId}/stop`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to stop machine');
            toast.success('تم إيقاف الآلة', { id: loadingToast });
            setSession(null);
            setTimeLeft('--:--:--');
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    const submitFlag = async (challengeId: string) => {
        const flag = flags[challengeId];
        if (!flag) return toast.error('يرجى إدخال العلم أولاً');

        setSubmitting(challengeId);
        try {
            const res = await fetch(`/api/labs/verify-flag`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labId: labId, challengeId, flag })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'خطأ في السيرفر');

            if (data.success) {
                if (data.alreadySubmitted) {
                    toast('لقد قمت بحل هذا التحدي مسبقاً', { icon: 'ℹ️' });
                } else {
                    toast.success(`عمل رائع! تم إضافة ${data.points} نقطة`, { icon: '🏆' });
                    setProgress(data.progress);
                }
                // Clear input
                setFlags(prev => ({ ...prev, [challengeId]: '' }));
            } else {
                toast.error(data.error || 'العلم غير صحيح، حاول مرة أخرى!');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(null);
        }
    };

    const isChallengeCompleted = (challengeId: string) => {
        if (!progress || !progress.challenges) return false;
        try {
            const completed = JSON.parse(progress.challenges);
            return completed.includes(challengeId);
        } catch (e) {
            return false;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-accent border-cyber-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!lab) return null;

    return (
        <div className="h-screen bg-[#06080a] flex flex-col overflow-hidden pt-16">
            
            {/* Top Control Bar */}
            <div className="h-14 bg-[#0b0e14] border-b border-cyber-800/50 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-white font-bold flex items-center gap-2">
                        <Shield className="text-accent" size={18} />
                        {lab.title}
                    </h1>
                    <div className="h-4 w-px bg-cyber-800"></div>
                    <span className="text-xs text-cyber-400 font-mono">ID: {lab.id.slice(-6)}</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timer */}
                    <div className="flex items-center gap-2 text-cyber-300 font-mono text-sm bg-cyber-900/50 px-3 py-1 rounded-lg border border-cyber-800">
                        <Clock size={14} className={session ? "text-accent animate-pulse" : "text-cyber-500"} />
                        {timeLeft}
                    </div>

                    {/* Machine Controls */}
                    {session ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                {session.ipAddress}
                            </div>
                            <button onClick={stopMachine} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                <Square size={12} fill="currentColor" />
                                إيقاف
                            </button>
                        </div>
                    ) : (
                        <button onClick={startMachine} disabled={starting} className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                            {starting ? <div className="w-4 h-4 border-2 border-t-accent border-transparent rounded-full animate-spin"></div> : <Play size={14} fill="currentColor" />}
                            تشغيل الآلة
                        </button>
                    )}
                </div>
            </div>

            {/* Split Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left Panel: Challenges & Info */}
                <div className="w-full md:w-1/3 border-l border-cyber-800/50 bg-[#080b0f] overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                    
                    {/* Status Card */}
                    {!session && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-400">
                            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                            <p className="text-sm leading-relaxed">
                                الآلة متوقفة حالياً. قم بالضغط على "تشغيل الآلة" للبدء والحصول على عنوان الـ IP الخاص بك لتبدأ الاختراق.
                            </p>
                        </div>
                    )}

                    {/* Challenges List */}
                    <div className="space-y-4">
                        <h2 className="text-white font-bold flex items-center gap-2 text-lg">
                            <Flag className="text-accent" />
                            تحديات المختبر
                        </h2>
                        
                        {lab.challenges.map((challenge: any, index: number) => {
                            const completed = isChallengeCompleted(challenge.id);
                            
                            return (
                                <div key={challenge.id} className={`p-5 rounded-xl border transition-all duration-300 ${completed ? 'bg-green-500/5 border-green-500/30' : 'bg-[#0b0e14] border-cyber-800/50 hover:border-cyber-700'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className={`font-bold text-sm ${completed ? 'text-green-400' : 'text-white'}`}>
                                            {index + 1}. {challenge.title}
                                        </h3>
                                        <div className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                                            {challenge.points} pts
                                        </div>
                                    </div>
                                    
                                    <p className="text-cyber-400 text-xs mb-4">{challenge.description}</p>
                                    
                                    {completed ? (
                                        <div className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 p-2 rounded-lg justify-center border border-green-500/20">
                                            <CheckCircle2 size={16} />
                                            تم الاختراق بنجاح
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="FLAG{...}" 
                                                className="flex-1 bg-cyber-900 border border-cyber-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent font-mono"
                                                value={flags[challenge.id] || ''}
                                                onChange={(e) => setFlags({...flags, [challenge.id]: e.target.value})}
                                                disabled={!session || submitting === challenge.id}
                                            />
                                            <button 
                                                onClick={() => submitFlag(challenge.id)}
                                                disabled={!session || submitting === challenge.id}
                                                className="bg-accent hover:bg-accent/90 text-white px-4 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                                            >
                                                {submitting === challenge.id ? (
                                                    <div className="w-4 h-4 border-2 border-t-white border-transparent rounded-full animate-spin"></div>
                                                ) : 'إرسال'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Terminal Environment */}
                <div className="flex-1 bg-[#040608] p-4 flex flex-col">
                    {session ? (
                        <LabTerminal ipAddress={session.ipAddress} />
                    ) : (
                        <div className="flex-1 border-2 border-dashed border-cyber-800/50 rounded-xl flex items-center justify-center flex-col gap-4 bg-cyber-900/10">
                            <Terminal size={48} className="text-cyber-700" />
                            <p className="text-cyber-500 font-mono">OFFLINE_MODE</p>
                            <p className="text-cyber-600 text-sm">قم بتشغيل الآلة للاتصال بالبيئة الافتراضية</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
