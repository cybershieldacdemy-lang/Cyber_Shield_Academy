'use client';

import React, { useState, useEffect } from 'react';

interface Incident {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    type: string;
    actionsTaken: string;
    reportedBy: string;
    createdAt: string;
}

const PLAYBOOKS = {
    'Phishing': `1. Identify the compromised account.
2. Reset password and revoke active sessions.
3. Check for unauthorized forwarding rules.
4. Scan efficient email logs for similar messages.
5. Notify affected users.`,
    'Malware': `1. Isolate the infected machine from the network.
2. Capture RAM/Disk image for forensics.
3. Run anti-malware scan.
4. Identify the entry vector (email, USB, web).
5. Reimage the machine if necessary.`,
    'DDoS': `1. Identify attack traffic pattern.
2. Enable mitigate mode on WAF/Firewall.
3. Rate limit entry points.
4. Contact ISP if upstream blocking is needed.
5. Monitor bandwidth usage.`,
    'Data Leak': `1. Identify leaked data scope.
2. Stop the leak source immediately.
3. Assess legal/regulatory impact (GDPR/NDMO).
4. Prepare notification for affected parties.
5. Conduct post-incident review.`
};

export default function IncidentDashboard() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'High',
        status: 'OPEN',
        type: 'Phishing',
        actionsTaken: ''
    });

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/incidents');
            const data = await res.json();
            setIncidents(Array.isArray(data) ? data : []);
        } catch {
            console.error('Failed to fetch incidents');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingIncident ? 'PUT' : 'POST';
        const url = editingIncident ? `/api/admin/incidents/${editingIncident.id}` : '/api/admin/incidents';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                fetchIncidents();
                resetForm();
            } else {
                alert('Failed to save incident');
            }
        } catch (error) {
            console.error('Error saving incident', error);
        }
    };

    const loadPlaybook = (type: string) => {
        const playbook = PLAYBOOKS[type as keyof typeof PLAYBOOKS] || '';
        setFormData(prev => ({ ...prev, type, actionsTaken: playbook }));
    };

    const resetForm = () => {
        setEditingIncident(null);
        setFormData({
            title: '',
            description: '',
            severity: 'High',
            status: 'OPEN',
            type: 'Phishing',
            actionsTaken: ''
        });
    };

    const openEdit = (incident: Incident) => {
        setEditingIncident(incident);
        setFormData({
            title: incident.title,
            description: incident.description,
            severity: incident.severity,
            status: incident.status,
            type: incident.type,
            actionsTaken: incident.actionsTaken || ''
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-red-950/30 p-4 rounded-xl border border-red-900/50">
                <div>
                    <h3 className="text-xl font-bold text-red-500">🚨 غرفة عمليات الحوادث (Incident War Room)</h3>
                    <p className="text-red-400 text-sm">إدارة الاستجابة الفورية للتهديدات الأمنية</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-900/50 animate-pulse"
                >
                    + إبلاغ عن حادث جديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incidents.map((incident) => (
                    <div key={incident.id} className="glass-card p-5 border-l-4 border-l-red-500 relative hover:bg-cyber-800/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${incident.status === 'OPEN' ? 'bg-red-500 text-white animate-pulse' :
                                incident.status === 'IN_PROGRESS' ? 'bg-yellow-500 text-black' :
                                    'bg-green-500 text-black'
                                }`}>
                                {incident.status}
                            </span>
                            <span className="text-xs text-cyber-500">{new Date(incident.createdAt).toLocaleDateString()}</span>
                        </div>

                        <h4 className="text-cyber-100 font-bold mb-1 text-lg">{incident.title}</h4>
                        <div className="text-xs text-cyber-400 mb-3 block">{incident.type} | Priority: {incident.severity}</div>

                        <p className="text-cyber-300 text-sm mb-4 line-clamp-3 bg-cyber-900/50 p-2 rounded border border-cyber-800">
                            {incident.description}
                        </p>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-cyber-800">
                            <span className="text-xs text-cyber-500">Reported by: {incident.reportedBy || 'System'}</span>
                            <button
                                onClick={() => openEdit(incident)}
                                className="px-3 py-1 bg-cyber-700 hover:bg-cyber-600 text-cyber-100 text-xs rounded"
                            >
                                إدارة الاستجابة 🛡️
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && incidents.length === 0 && (
                    <div className="col-span-full text-center p-12 glass-card text-cyber-500">
                        ✅ النظام آمن. لا توجد حوادث نشطة حالياً.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="glass-card w-full max-w-2xl p-6 border border-red-900/50 shadow-2xl shadow-red-900/20 my-8">
                        <h3 className="text-2xl font-bold text-cyber-100 mb-6 border-b border-cyber-700 pb-2">
                            {editingIncident ? 'إدارة الحادث' : 'تسجيل حادث جديد'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-cyber-400 mb-1">عنوان الحادث</label>
                                    <input
                                        required
                                        className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 focus:border-red-500 outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-cyber-400 mb-1">نوع الحادث (Playbook)</label>
                                    <select
                                        className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 outline-none focus:border-red-500"
                                        value={formData.type}
                                        onChange={e => loadPlaybook(e.target.value)}
                                    >
                                        <option value="Phishing">Phishing 🎣</option>
                                        <option value="Malware">Malware 🦠</option>
                                        <option value="DDoS">DDoS 🌊</option>
                                        <option value="Data Leak">Data Leak 🔓</option>
                                        <option value="Other">Other ❓</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-cyber-400 mb-1">الخطورة</label>
                                    <select
                                        className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 outline-none"
                                        value={formData.severity}
                                        onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                    >
                                        <option value="Critical">Critical 🔴</option>
                                        <option value="High">High 🟠</option>
                                        <option value="Medium">Medium 🟡</option>
                                        <option value="Low">Low 🟢</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-cyber-400 mb-1">الحالة</label>
                                    <select
                                        className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 outline-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="OPEN">OPEN (مفتوح)</option>
                                        <option value="IN_PROGRESS">IN PROGRESS (جاري العمل)</option>
                                        <option value="RESOLVED">RESOLVED (تم الحل)</option>
                                        <option value="CLOSED">CLOSED (مغلق)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-cyber-400 mb-1">وصف الحادث</label>
                                <textarea
                                    className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 h-24 focus:border-red-500 outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm text-cyber-400">الإجراءات المتخذة (Actions Taken)</label>
                                    <span className="text-xs text-accent">Playbook Loaded based on Type</span>
                                </div>
                                <textarea
                                    className="w-full bg-cyber-800/50 border border-cyber-700 rounded p-4 text-green-400 font-mono text-sm h-48 focus:border-accent outline-none"
                                    value={formData.actionsTaken}
                                    onChange={e => setFormData({ ...formData, actionsTaken: e.target.value })}
                                    placeholder="Steps taken to contain and eradicate the threat..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6 border-t border-cyber-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-cyber-400 hover:text-cyber-950"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-500 shadow-lg shadow-red-900/50"
                                >
                                    حفظ وتحديث السجل
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
