'use client';

import React, { useState, useEffect } from 'react';

interface FirewallRule {
    id: string;
    ip: string;
    action: 'BLOCK' | 'ALLOW';
    reason: string;
    createdBy: string;
    createdAt: string;
}

export default function FirewallManager() {
    const [rules, setRules] = useState<FirewallRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRule, setNewRule] = useState({ ip: '', action: 'BLOCK', reason: '' });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/admin/firewall');
            const data = await res.json();
            setRules(Array.isArray(data) ? data : []);
        } catch {
            console.error('Failed to fetch rules');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/firewall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRule)
            });

            if (res.ok) {
                setNewRule({ ip: '', action: 'BLOCK', reason: '' });
                fetchRules();
            } else {
                alert('فشل إضافة القاعدة');
            }
        } catch (error) {
            console.error('Error adding rule:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return;
        try {
            await fetch(`/api/admin/firewall/${id}`, { method: 'DELETE' });
            fetchRules();
        } catch {
            alert('Failed to delete rule');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Add Rule Form */}
            <div className="glass-card p-6 border border-cyber-700">
                <h3 className="text-xl font-bold text-white mb-4">🛡️ إضافة قاعدة جدار ناري (Firewall Rule)</h3>
                <form onSubmit={handleAddRule} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm text-cyber-400 mb-1">IP Address</label>
                        <input
                            required
                            placeholder="e.g. 192.168.1.1"
                            className="w-full bg-cyber-900 border border-cyber-600 rounded p-2 text-white focus:border-red-500 outline-none font-mono"
                            value={newRule.ip}
                            onChange={(e) => setNewRule({ ...newRule, ip: e.target.value })}
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-sm text-cyber-400 mb-1">الإجراء</label>
                        <select
                            className={`w-full border rounded p-2 outline-none font-bold ${newRule.action === 'BLOCK' ? 'bg-red-500/20 text-red-500 border-red-500' : 'bg-green-500/20 text-green-500 border-green-500'
                                }`}
                            value={newRule.action}
                            onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                        >
                            <option value="BLOCK">⛔ حظر</option>
                            <option value="ALLOW">✅ سماح</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm text-cyber-400 mb-1">السبب (اختياري)</label>
                        <input
                            placeholder="e.g. Suspicious activity"
                            className="w-full bg-cyber-900 border border-cyber-600 rounded p-2 text-white focus:border-cyber-400 outline-none"
                            value={newRule.reason}
                            onChange={(e) => setNewRule({ ...newRule, reason: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 bg-cyber-100 text-cyber-900 font-bold rounded hover:bg-white transition-colors h-[42px]"
                    >
                        إضافة
                    </button>
                </form>
            </div>

            {/* Rules List */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-cyber-900/50 text-cyber-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Created By</th>
                            <th className="p-4">Date</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-800">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-cyber-500">جاري تحميل القواعد...</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-cyber-500">لا توجد قواعد نشطة.</td></tr>
                        ) : (
                            rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-cyber-800/20">
                                    <td className="p-4 font-mono text-white">{rule.ip}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${rule.action === 'BLOCK' ? 'bg-red-500 text-black' : 'bg-green-500 text-black'
                                            }`}>
                                            {rule.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-cyber-300">{rule.reason}</td>
                                    <td className="p-4 text-cyber-400 text-sm">{rule.createdBy || 'System'}</td>
                                    <td className="p-4 text-cyber-500 text-sm">{new Date(rule.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="text-cyber-500 hover:text-red-400 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
