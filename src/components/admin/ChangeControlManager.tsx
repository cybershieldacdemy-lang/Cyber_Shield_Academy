'use client';

import React, { useState, useEffect } from 'react';

export default function ChangeControlManager() {
    const [changes, setChanges] = useState<any[]>([]);

    async function fetchChanges() {
        try {
            const res = await fetch('/api/admin/changes');
            const data = await res.json();
            setChanges(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch changes:', error);
            setChanges([]);
        }
    }

    useEffect(() => {
        fetchChanges();
    }, []);

    async function handleDecision(id: string, decision: 'APPROVED' | 'REJECTED') {
        if (!confirm(`هل أنت متأكد من قرارك: ${decision}؟`)) return;

        await fetch(`/api/admin/changes/${id}/decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision, reason: 'Admin Action via Dashboard' })
        });
        fetchChanges();
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">🛂 التحكم في التغييرات (Change Control)</h3>

            <div className="grid gap-4">
                {changes.map((change) => (
                    <div key={change.id} className="glass-card p-4 border border-cyber-700 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${change.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                        change.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                    {change.status}
                                </span>
                                <span className="text-cyber-500 text-xs">{new Date(change.createdAt).toLocaleString()}</span>
                            </div>
                            <h4 className="text-white font-bold text-lg">{change.action} <span className="text-cyber-400">on {change.entity}</span></h4>
                            <p className="text-cyber-400 text-sm mt-1">Requested by: {change.adminName}</p>

                            {change.reason && (
                                <div className="mt-2 text-xs bg-cyber-900 p-2 rounded text-cyber-300">
                                    السبب: {change.reason}
                                </div>
                            )}
                        </div>

                        {change.status === 'PENDING' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDecision(change.id, 'APPROVED')}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors"
                                >
                                    موافقة ✅
                                </button>
                                <button
                                    onClick={() => handleDecision(change.id, 'REJECTED')}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
                                >
                                    رفض ❌
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {changes.length === 0 && (
                    <div className="text-center p-8 text-cyber-500 glass-card">
                        لا يوجد طلبات تغيير معلقة حالياً.
                    </div>
                )}
            </div>
        </div>
    );
}
