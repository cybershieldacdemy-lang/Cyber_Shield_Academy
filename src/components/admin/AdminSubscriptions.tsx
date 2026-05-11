"use client";
import { useState, useEffect } from "react";

interface SubStats {
    total: number;
    free: number;
    pro: number;
    enterprise: number;
    mrr: number;
    active: number;
    canceled: number;
}

interface SubRecord {
    id: string;
    user_name: string;
    user_email: string;
    plan_id: string;
    plan_name: string;
    status: string;
    price: number;
    current_period_end: string;
    created_at: string;
}

const statusLabels: Record<string, { text: string; class: string }> = {
    active: { text: 'نشط', class: 'bg-green-500/10 text-green-600' },
    past_due: { text: 'متأخر', class: 'bg-yellow-500/10 text-yellow-600' },
    canceled: { text: 'ملغى', class: 'bg-red-500/10 text-red-500' },
    expired: { text: 'منتهي', class: 'bg-gray-500/10 text-gray-500' },
    replaced: { text: 'مستبدل', class: 'bg-blue-500/10 text-blue-500' },
};

export default function AdminSubscriptions() {
    const [stats, setStats] = useState<SubStats>({ total: 0, free: 0, pro: 0, enterprise: 0, mrr: 0, active: 0, canceled: 0 });
    const [subs, setSubs] = useState<SubRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`/api/admin/subscriptions?filter=${filter}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.stats) setStats(data.stats);
                if (data.subscriptions) setSubs(data.subscriptions);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter]);

    const statCards = [
        { label: 'إجمالي المشتركين', value: stats.total, icon: '👥', color: '#3b82f6' },
        { label: 'الإيرادات الشهرية', value: `$${stats.mrr}`, icon: '💰', color: '#10b981' },
        { label: 'احترافي', value: stats.pro, icon: '⭐', color: '#c8962e' },
        { label: 'مؤسسي', value: stats.enterprise, icon: '🏢', color: '#805ad5' },
        { label: 'نشط', value: stats.active, icon: '✅', color: '#10b981' },
        { label: 'ملغى', value: stats.canceled, icon: '❌', color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="glass-card p-4 text-center" style={{ borderColor: `${s.color}20` }}>
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs" style={{ color: '#7a7164' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-4 flex flex-wrap gap-2">
                {[
                    { key: 'all', label: 'الكل' },
                    { key: 'active', label: 'نشط' },
                    { key: 'pro', label: 'احترافي' },
                    { key: 'enterprise', label: 'مؤسسي' },
                    { key: 'canceled', label: 'ملغى' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => { setFilter(f.key); setLoading(true); }}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{
                            background: filter === f.key ? 'rgba(200,150,46,0.15)' : 'transparent',
                            color: filter === f.key ? '#c8962e' : '#7a7164',
                            border: `1px solid ${filter === f.key ? 'rgba(200,150,46,0.3)' : 'rgba(200,150,46,0.08)'}`,
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Subscriptions Table */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#c8962e', borderTopColor: 'transparent' }} />
                    </div>
                ) : subs.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-2xl mb-2">📋</p>
                        <p style={{ color: '#7a7164' }}>لا توجد اشتراكات</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(200,150,46,0.1)' }}>
                                    <th className="text-right p-4 text-xs font-bold" style={{ color: '#7a7164' }}>المستخدم</th>
                                    <th className="text-center p-4 text-xs font-bold" style={{ color: '#7a7164' }}>الباقة</th>
                                    <th className="text-center p-4 text-xs font-bold" style={{ color: '#7a7164' }}>الحالة</th>
                                    <th className="text-center p-4 text-xs font-bold" style={{ color: '#7a7164' }}>السعر</th>
                                    <th className="text-center p-4 text-xs font-bold" style={{ color: '#7a7164' }}>ينتهي في</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subs.map(s => {
                                    const st = statusLabels[s.status] || statusLabels.active;
                                    return (
                                        <tr key={s.id} style={{ borderBottom: '1px solid rgba(200,150,46,0.06)' }}>
                                            <td className="p-4">
                                                <p className="text-sm font-bold" style={{ color: '#1a1612' }}>{s.user_name}</p>
                                                <p className="text-xs" style={{ color: '#7a7164' }}>{s.user_email}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-sm font-bold" style={{ color: s.plan_id === 'pro' ? '#c8962e' : s.plan_id === 'enterprise' ? '#805ad5' : '#38b2ac' }}>
                                                    {s.plan_name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${st.class}`}>
                                                    {st.text}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-sm font-bold" style={{ color: '#1a1612' }}>${s.price}</td>
                                            <td className="p-4 text-center text-xs" style={{ color: '#7a7164' }}>
                                                {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('ar-EG') : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
