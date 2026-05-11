'use client';

import React, { useState, useEffect } from 'react';

interface Asset {
    id: string;
    name: string;
    assetType: string;
    classification: string;
    owner: string;
    location: string;
    updatedAt: string;
}
import { SmartDataView } from '@/components/ui/SmartDataView';

export default function AssetRegistry() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        assetType: 'Hardware',
        classification: 'Internal',
        owner: '',
        location: ''
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/assets');
            if (!res.ok) throw new Error('فشل جلب البيانات');
            const data = await res.json();
            setAssets(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch assets', err);
            setError(err.message || 'حدث خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingAsset ? 'PUT' : 'POST';
        const url = editingAsset ? `/api/admin/assets/${editingAsset.id}` : '/api/admin/assets';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                fetchAssets();
                resetForm();
            } else {
                alert('Failed to save asset');
            }
        } catch (error) {
            console.error('Error saving asset', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;

        try {
            await fetch(`/api/admin/assets/${id}`, { method: 'DELETE' });
            fetchAssets();
        } catch (error) {
            console.error('Error deleting asset', error);
        }
    };

    const openEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            assetType: asset.assetType,
            classification: asset.classification,
            owner: asset.owner,
            location: asset.location || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingAsset(null);
        setFormData({
            name: '',
            assetType: 'Hardware',
            classification: 'Internal',
            owner: '',
            location: ''
        });
    };

    const classificationColor = (cls: string) => {
        switch (cls) {
            case 'Restricted': return 'bg-red-950 text-red-500 border-red-900';
            case 'Confidential': return 'bg-orange-950 text-orange-500 border-orange-900';
            case 'Internal': return 'bg-blue-950 text-blue-500 border-blue-900';
            default: return 'bg-green-950 text-green-500 border-green-900';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-cyber-100">📦 سجل الأصول (Information Asset Registry)</h3>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-4 py-2 bg-neon-blue hover:bg-blue-600 text-black font-bold rounded-lg transition-colors"
                >
                    + إضافة أصل جديد
                </button>
            </div>

            <SmartDataView
                loading={loading}
                error={error}
                isEmpty={assets.length === 0}
                emptyType="no-data"
                emptyConfig={{
                    title: "لا توجد أصول مسجلة",
                    desc: "يبدو أن سجل الأصول فارغ. قم بإضافة أصول المعلومات والأجهزة والبرمجيات الخاصة بك للبدء في تتبعها وحمايتها.",
                    action: (
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="px-6 py-2 bg-neon-blue text-black font-bold rounded hover:bg-blue-600 transition-colors mt-4"
                        >
                            إضافة أصل جديد
                        </button>
                    )
                }}
                onRetry={fetchAssets}
            >
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-cyber-900/50 text-cyber-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">اسم الأصل</th>
                                <th className="p-4">النوع</th>
                                <th className="p-4">التصنيف</th>
                                <th className="p-4">المالك</th>
                                <th className="p-4">الموقع</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-800">
                            {assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-cyber-800/30 transition-colors">
                                    <td className="p-4 text-cyber-100 font-medium">{asset.name}</td>
                                    <td className="p-4 text-cyber-300">{asset.assetType}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs border ${classificationColor(asset.classification)}`}>
                                            {asset.classification}
                                        </span>
                                    </td>
                                    <td className="p-4 text-cyber-400">{asset.owner}</td>
                                    <td className="p-4 text-cyber-500 text-sm">{asset.location || '-'}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => openEdit(asset)} className="text-blue-400 hover:text-blue-300">✏️</button>
                                        <button onClick={() => handleDelete(asset.id)} className="text-red-400 hover:text-red-300">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SmartDataView>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-lg p-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-cyber-100 mb-4">{editingAsset ? 'تعديل أصل' : 'إضافة أصل جديد'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-cyber-400 mb-1">اسم الأصل</label>
                                <input
                                    required
                                    className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 focus:border-neon-blue outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-cyber-400 mb-1">النوع</label>
                                    <select
                                        className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 outline-none"
                                        value={formData.assetType}
                                        onChange={e => setFormData({ ...formData, assetType: e.target.value })}
                                    >
                                        <option value="Hardware">Hardware 🖥️</option>
                                        <option value="Software">Software 💾</option>
                                        <option value="Data">Data 📂</option>
                                        <option value="Service">Service ☁️</option>
                                        <option value="People">People 👥</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-cyber-400 mb-1">Dتصنيف السرية</label>
                                    <select
                                        className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 outline-none"
                                        value={formData.classification}
                                        onChange={e => setFormData({ ...formData, classification: e.target.value })}
                                    >
                                        <option value="Public">Public (عام) 🟢</option>
                                        <option value="Internal">Internal (داخلي) 🔵</option>
                                        <option value="Confidential">Confidential (سري) 🟠</option>
                                        <option value="Restricted">Restricted (سري للغاية) 🔴</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-cyber-400 mb-1">المالك (Owner)</label>
                                <input
                                    required
                                    placeholder="Person or Department"
                                    className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 focus:border-neon-blue outline-none"
                                    value={formData.owner}
                                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-cyber-400 mb-1">الموقع (Location)</label>
                                <input
                                    placeholder="e.g. Server Room A, Cloud AWS"
                                    className="w-full bg-cyber-900 border border-cyber-700 rounded p-2 text-cyber-100 focus:border-neon-blue outline-none"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-cyber-400 hover:text-cyber-950"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-neon-blue text-black font-bold rounded hover:bg-blue-500"
                                >
                                    حفظ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
