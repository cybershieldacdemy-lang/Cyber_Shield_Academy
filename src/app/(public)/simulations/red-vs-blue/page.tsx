"use client";

import { useState, useRef } from 'react';

const ATTACK_VECTORS = [
    { id: 'ddos', name: 'هجوم حجب الخدمة (DDoS)', desc: 'إغراق الخادم بآلاف الطلبات الوهمية لإسقاطه.', severity: 'High' },
    { id: 'sqli', name: 'حقن قواعد البيانات (SQLi)', desc: 'إدخال أوامر SQL خبيثة عبر حقول تسجيل الدخول.', severity: 'Medium' },
    { id: 'bruteforce', name: 'التخمين العنيف (Brute Force)', desc: 'تجربة آلاف الكلمات لاختراق حساب المدير.', severity: 'Low' },
    { id: 'ransomware', name: 'برمجية فدية (Ransomware)', desc: 'محاولة تشفير ملفات الخادم والمطالبة بفدية.', severity: 'Critical' }
];

const DEFENSE_REACTIONS: Record<string, string[]> = {
    ddos: [
        "[ALERT] High traffic anomaly detected on Port 80/443",
        "[INFO] Analyzing traffic patterns...",
        "[ACTION] Activating Cloudflare Under Attack Mode",
        "[INFO] Rate limiting applied to ASN 3345",
        "[ACTION] Blackholing anomalous UDP traffic",
        "[SUCCESS] Traffic normalized. Service restored."
    ],
    sqli: [
        "[ALERT] Suspicious SQL syntax detected in POST /login",
        "[INFO] Payload: ' OR 1=1 --",
        "[ACTION] Web Application Firewall (WAF) triggered",
        "[ACTION] Blocking IP 192.168.0.50",
        "[SUCCESS] Database query aborted. No data leaked."
    ],
    bruteforce: [
        "[INFO] 5 failed login attempts from IP 10.0.0.12",
        "[ALERT] 50 failed login attempts in 10 seconds",
        "[ACTION] Triggering Fail2Ban jail 'sshd'",
        "[ACTION] IP 10.0.0.12 banned for 24 hours",
        "[SUCCESS] Account secured."
    ],
    ransomware: [
        "[ALERT] Unusual file modification frequency detected (C:/Data/)",
        "[INFO] File extension anomaly: .locked",
        "[CRITICAL] Suspected Ransomware execution inside process 4492",
        "[ACTION] Endpoint Detection & Response (EDR) terminating process",
        "[ACTION] Isolating host from network to prevent lateral movement",
        "[SUCCESS] Threat contained. Rolling back encrypted files from shadow copies."
    ]
};

export default function RedVsBlueSimulation() {
    const [attackActive, setAttackActive] = useState(false);
    const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const launchAttack = (id: string) => {
        if (attackActive) return;
        setAttackActive(true);
        setSelectedAttack(id);
        setLogs([`[SYSTEM] Initiating Red Team Vector: ${id.toUpperCase()}...`]);

        const reactions = DEFENSE_REACTIONS[id];
        let i = 0;
        
        const interval = setInterval(() => {
            if (i < reactions.length) {
                setLogs(prev => [...prev, reactions[i]]);
                i++;
                logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else {
                setAttackActive(false);
                clearInterval(interval);
            }
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-cyber-950 flex flex-col md:flex-row" style={{ paddingTop: '80px' }}>
            
            {/* Red Team Panel (Left) */}
            <div className="w-full md:w-1/2 bg-red-950/20 border-r border-red-900/30 p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-red-900/50 flex items-center justify-center border-2 border-red-500">
                        <span className="text-3xl">🥷</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-red-500 tracking-widest uppercase">الفريق الأحمر (المهاجم)</h2>
                        <p className="text-red-300/60 text-sm mt-1">اختر أداة الهجوم لإطلاقها على الخادم الهدف.</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    {ATTACK_VECTORS.map(attack => (
                        <div key={attack.id} className="bg-cyber-800/40 border border-red-900/50 rounded-xl p-5 hover:border-red-500 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-cyber-100 text-lg">{attack.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded border font-bold uppercase ${
                                    attack.severity === 'Low' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                                    attack.severity === 'Medium' ? 'text-orange-400 border-orange-400/30 bg-orange-400/10' :
                                    attack.severity === 'High' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                                    'text-purple-400 border-purple-400/30 bg-purple-400/10 blink'
                                }`}>{attack.severity}</span>
                            </div>
                            <p className="text-red-200/50 text-sm mb-4">{attack.desc}</p>
                            <button 
                                onClick={() => launchAttack(attack.id)}
                                disabled={attackActive}
                                className={`w-full py-3 rounded-lg font-bold transition-all ${
                                    attackActive && selectedAttack === attack.id 
                                        ? 'bg-red-600 text-cyber-100 animate-pulse cursor-not-allowed'
                                        : attackActive
                                            ? 'bg-cyber-800 text-cyber-500 cursor-not-allowed border border-cyber-600'
                                            : 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                }`}
                            >
                                {attackActive && selectedAttack === attack.id ? 'جاري الهجوم...' : 'إطلاق الهجوم 🚀'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blue Team Panel (Right) */}
            <div className="w-full md:w-1/2 bg-blue-950/10 p-8 flex flex-col h-[calc(100vh-80px)] md:h-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center border-2 border-blue-500">
                        <span className="text-3xl">🛡️</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-blue-500 tracking-widest uppercase">الفريق الأزرق (المدافع)</h2>
                        <p className="text-blue-300/60 text-sm mt-1">سجلات نظام الدفاع والأمان (SOC / SIEM Logs).</p>
                    </div>
                </div>

                <div className="flex-1 bg-cyber-950 border border-blue-900/50 rounded-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                    <div className="bg-cyber-900 border-b border-blue-900/50 px-4 py-3 flex items-center justify-between">
                        <span className="text-blue-400/60 text-xs font-mono">defenders-siem-console ~ /var/log/security</span>
                        {attackActive && <span className="text-xs text-red-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Under Attack</span>}
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto font-mono text-sm leading-8" style={{ color: '#60a5fa' }}>
                        {logs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-blue-500/30 flex-col gap-4">
                                <span className="text-5xl">📡</span>
                                <p>في انتظار أنشطة غير طبيعية...</p>
                            </div>
                        ) : (
                            logs.filter(Boolean).map((log, i) => (
                                <div key={i} className={`mb-1 ${
                                    log?.includes('[ALERT]') || log?.includes('[CRITICAL]') ? 'text-red-400 font-bold' : 
                                    log?.includes('[ACTION]') ? 'text-orange-400' :
                                    log?.includes('[SUCCESS]') ? 'text-green-400 font-bold' : 
                                    'text-blue-300'
                                }`}>
                                    <span className="opacity-50 mr-2">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                                    {log}
                                </div>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>

        </div>
    );
}
