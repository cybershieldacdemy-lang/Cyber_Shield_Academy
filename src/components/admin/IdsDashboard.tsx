'use client';

import React, { useState, useEffect } from 'react';

interface IdsAlert {
    id: string;
    type: 'BRUTE_FORCE' | 'INJECTION_ATTEMPT' | 'FIREWALL_PROBING' | 'PERMISSION_VIOLATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    sourceIp: string;
    count: number;
    lastSeen: string;
    details: string;
}

export default function IdsDashboard() {
    const [alerts, setAlerts] = useState<IdsAlert[]>([]);
    const [threatLevel, setThreatLevel] = useState('LOW');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIdsData();
        // Auto-refresh every 30 seconds for specific "War Room" feel
        const interval = setInterval(fetchIdsData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchIdsData = async () => {
        try {
            const res = await fetch('/api/admin/ids/alerts');
            const data = await res.json();
            setAlerts(data.alerts || []);
            setThreatLevel(data.threatLevel || 'LOW');
        } catch {
            console.error('Failed to fetch IDS data');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockIp = async (ip: string, reason: string) => {
        if (!confirm(`هل تريد حظر العنوان ${ip} فوراً؟`)) return;

        try {
            const res = await fetch('/api/admin/firewall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip,
                    action: 'BLOCK',
                    reason: `IDS Auto-Block: ${reason}`
                })
            });

            if (res.ok) {
                alert(`تم حظر ${ip} بنجاح! 🛡️`);
                fetchIdsData(); // Refresh to potentially show it's handled (though IDS still sees logs)
            } else {
                alert('فشل الحظر');
            }
        } catch {
            alert('خطأ في الاتصال');
        }
    };

    const getSeverityColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-600 bg-red-600/10 border-red-600';
            case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400';
            default: return 'text-green-400 bg-green-400/10 border-green-400';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Threat Level Header */}
            <div className={`glass-card p-8 flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-500 ${threatLevel === 'CRITICAL' ? 'border-red-600 shadow-red-900/50 bg-red-950/20' :
                    threatLevel === 'HIGH' ? 'border-orange-500 shadow-orange-900/50 bg-orange-950/20' :
                        'border-green-500 shadow-green-900/50 bg-green-950/20'
                }`}>
                <h2 className="text-cyber-400 text-lg uppercase tracking-widest mb-2">System Threat Level</h2>
                <div className={`text-6xl font-black tracking-tighter ${threatLevel === 'CRITICAL' ? 'text-red-500 animate-pulse' :
                        threatLevel === 'HIGH' ? 'text-orange-500' :
                            'text-green-400'
                    }`}>
                    {threatLevel}
                </div>
                {threatLevel === 'CRITICAL' && <div className="mt-4 text-red-400 font-bold animate-bounce">⚠️ هجوم نشط مكتشف! اتخذ إجراء فوراً</div>}
            </div>

            {/* Alerts Feed */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 bg-cyber-900/50 border-b border-cyber-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>📡</span> كشف التسلل (Live Detection Feed)
                    </h3>
                    <span className="text-xs text-cyber-500 animate-pulse">● Live Monitoring</span>
                </div>

                <div className="divide-y divide-cyber-800">
                    {loading ? (
                        <div className="p-8 text-center text-cyber-500">جاري تحليل السجلات...</div>
                    ) : alerts.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h4 className="text-white font-bold mb-2">النظام آمن</h4>
                            <p className="text-cyber-500">لم يتم اكتشاف أي نشاط مشبوه في الآونة الأخيرة.</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className="p-6 hover:bg-cyber-800/20 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(alert.severity)}`}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-neon-blue font-bold tracking-wide">{alert.type.replace('_', ' ')}</span>
                                        <span className="text-cyber-500 text-xs">{new Date(alert.lastSeen).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-white font-medium mb-1">{alert.details}</p>
                                    <p className="text-cyber-400 text-sm font-mono">Source IP: <span className="text-white">{alert.sourceIp}</span> (Hits: {alert.count})</p>
                                </div>

                                <button
                                    onClick={() => handleBlockIp(alert.sourceIp, alert.type)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg shadow-red-900/50 transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    ⛔ حظر الـ IP
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
