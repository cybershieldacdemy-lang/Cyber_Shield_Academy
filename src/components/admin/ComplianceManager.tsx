'use client';

import React, { useState, useEffect } from 'react';

interface ComplianceControl {
    id: string;
    standard: string;
    domain: string;
    code: string;
    description: string;
    status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
    notes?: string;
    updatedAt?: string;
}

export default function ComplianceManager() {
    const [controls, setControls] = useState<ComplianceControl[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, { total: number, compliant: number }>>({});

    useEffect(() => {
        fetchCompliance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCompliance = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/compliance');
            const data = await res.json();
            if (Array.isArray(data)) {
                setControls(data);
                calculateStats(data);
            }
        } catch {
            console.error('Failed to fetch compliance data');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: ComplianceControl[]) => {
        const newStats: Record<string, { total: number, compliant: number }> = {};

        data.forEach(c => {
            if (!newStats[c.standard]) newStats[c.standard] = { total: 0, compliant: 0 };
            newStats[c.standard].total++;
            if (c.status === 'COMPLIANT') newStats[c.standard].compliant++;
        });

        setStats(newStats);
    };

    const handleUpdate = async (control: ComplianceControl, newStatus: string, newNotes: string) => {
        try {
            const res = await fetch('/api/admin/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    standardId: control.standard,
                    controlId: control.code,
                    status: newStatus,
                    notes: newNotes
                })
            });

            if (res.ok) {
                // Optimistic update
                const updated = controls.map(c =>
                    c.id === control.id ? { ...c, status: newStatus as any, notes: newNotes } : c
                );
                setControls(updated);
                calculateStats(updated);
            }
        } catch {
            alert('Failed to update status');
        }
    };

    const _getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return 'bg-green-500 text-black';
            case 'PARTIAL': return 'bg-yellow-500 text-black';
            case 'NOT_APPLICABLE': return 'bg-gray-500 text-white';
            default: return 'bg-red-500 text-white';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(stats).map(([standard, stat]) => {
                    const percentage = Math.round((stat.compliant / stat.total) * 100) || 0;
                    return (
                        <div key={standard} className="glass-card p-6 flex items-center justify-between border-l-4 border-l-neon-blue">
                            <div>
                                <h3 className="text-xl font-bold text-white">{standard}</h3>
                                <p className="text-cyber-400 text-sm mt-1">{stat.compliant} / {stat.total} Controls Compliant</p>
                            </div>
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" className="stroke-cyber-800" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="40" cy="40" r="36"
                                        className="stroke-neon-blue transition-all duration-1000 ease-out"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${percentage * 2.26} 226`}
                                    />
                                </svg>
                                <span className="absolute text-lg font-bold text-white">{percentage}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls List */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 bg-cyber-900/50 border-b border-cyber-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">📋 قائمة الضوابط (Controls Checklist)</h3>
                    <button onClick={fetchCompliance} className="text-sm text-cyber-400 hover:text-white">🔄 تحديث</button>
                </div>

                <div className="divide-y divide-cyber-800">
                    {controls.map((control) => (
                        <ControlItem key={control.id} control={control} onUpdate={handleUpdate} />
                    ))}
                    {loading && <div className="p-8 text-center text-cyber-500">جاري تحميل المعايير...</div>}
                </div>
            </div>
        </div>
    );
}

function ControlItem({ control, onUpdate }: { control: ComplianceControl, onUpdate: (c: any, s: string, n: string) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [notes, setNotes] = useState(control.notes || '');

    return (
        <div className="group hover:bg-cyber-800/20 transition-colors">
            <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyber-700 text-cyber-300">{control.standard}</span>
                        <span className="text-neon-blue font-mono font-bold">{control.code}</span>
                    </div>
                    <p className="text-white font-medium">{control.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${control.status === 'COMPLIANT' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                            control.status === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                control.status === 'NOT_APPLICABLE' ? 'bg-gray-500/20 text-gray-400' :
                                    'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                        {control.status.replace('_', ' ')}
                    </span>
                    <span className="text-cyber-500 text-xl transform transition-transform group-hover:text-white">
                        {expanded ? '🔼' : '🔽'}
                    </span>
                </div>
            </div>

            {expanded && (
                <div className="p-4 bg-cyber-900/30 border-t border-cyber-800 ml-4 border-r-2 border-r-neon-blue rounded-bl-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-cyber-400 mb-2">الحالة (Assessment Status)</label>
                            <div className="flex flex-wrap gap-2">
                                {['COMPLIANT', 'PARTIAL', 'NON_COMPLIANT', 'NOT_APPLICABLE'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => onUpdate(control, s, notes)}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${control.status === s
                                                ? 'bg-neon-blue text-black shadow-lg shadow-neon-blue/20'
                                                : 'bg-cyber-800 text-cyber-400 hover:bg-cyber-700'
                                            }`}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-cyber-400 mb-2">ملاحظات / أدلة (Evidence)</label>
                            <textarea
                                className="w-full bg-cyber-950 border border-cyber-700 rounded p-2 text-white text-sm focus:border-neon-blue outline-none"
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={() => onUpdate(control, control.status, notes)}
                                placeholder="أضف ملاحظات أو روابط أدلة..."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
