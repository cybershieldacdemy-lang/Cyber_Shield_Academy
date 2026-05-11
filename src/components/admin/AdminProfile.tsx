'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Copy, Check, Loader2, KeyRound } from 'lucide-react';

export default function AdminProfile() {
    const [user, setUser] = useState<any>(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [entryToken, setEntryToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch user profile on mount
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setUser(data.user);
                    setIs2FAEnabled(data.user.isTwoFactorEnabled === 1);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleStart2FA = async () => {
        setActionLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setSetupData(data);
                setEntryToken('');
            } else {
                showMessage('error', data.message || 'فشل في إنشاء إعدادات 2FA');
            }
        } catch {
            showMessage('error', 'حدث خطأ في الاتصال بالخادم');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!setupData || entryToken.length < 6) return;
        setActionLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: entryToken, secret: setupData.secret })
            });
            const data = await res.json();

            if (res.ok) {
                showMessage('success', 'تم تفعيل المصادقة الثنائية بنجاح! 🔒✅');
                setIs2FAEnabled(true);
                setSetupData(null);
            } else {
                showMessage('error', data.message || 'الرمز غير صحيح. حاول مرة أخرى.');
            }
        } catch {
            showMessage('error', 'حدث خطأ أثناء التحقق');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('هل أنت متأكد أنك تريد تعطيل المصادقة الثنائية؟ سيقلل هذا من أمان حسابك.')) return;
        
        setActionLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/auth/2fa/disable', { method: 'POST' });
            if (res.ok) {
                showMessage('success', 'تم تعطيل المصادقة الثنائية بنجاح.');
                setIs2FAEnabled(false);
                setSetupData(null);
            } else {
                showMessage('error', 'فشل في تعطيل المصادقة الثنائية.');
            }
        } catch {
            showMessage('error', 'حدث خطأ في الاتصال بالخادم');
        } finally {
            setActionLoading(false);
        }
    };

    const copySecret = () => {
        if (setupData?.secret) {
            navigator.clipboard.writeText(setupData.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-neon-blue" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-white mb-8">إعدادات الحساب والأمان</h1>

            {message && (
                <div className={`p-4 rounded border flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {message.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Profile Info Card */}
            <div className="glass-card p-8 border border-cyber-700">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    👤 المعلومات الشخصية
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-cyber-400 text-sm mb-1">الاسم</label>
                        <div className="p-3 bg-cyber-900/50 rounded text-white border border-cyber-800">{user?.name || 'غير معروف'}</div>
                    </div>
                    <div>
                        <label className="block text-cyber-400 text-sm mb-1">البريد الإلكتروني</label>
                        <div className="p-3 bg-cyber-900/50 rounded text-white border border-cyber-800" dir="ltr">{user?.email || 'غير معروف'}</div>
                    </div>
                </div>
            </div>

            {/* Security Settings Card */}
            <div className="glass-card p-8 border border-cyber-700">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-neon-blue" /> الأمان والمصادقة
                </h2>

                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-cyber-900/30 rounded-xl border border-cyber-600 gap-4">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">المصادقة الثنائية (2FA)</h3>
                        <p className="text-sm text-cyber-400 max-w-lg">أضف طبقة أمان إضافية لحسابك باستخدام تطبيق مثل Google Authenticator أو Authy.</p>
                    </div>

                    <div>
                        {is2FAEnabled ? (
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-4 py-2 rounded-lg border border-green-500/20">
                                    <ShieldCheck className="w-5 h-5" /> مفعلة بنجاح
                                </div>
                                <button 
                                    onClick={handleDisable2FA}
                                    disabled={actionLoading}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors underline"
                                >
                                    تعطيل المصادقة
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleStart2FA}
                                disabled={actionLoading || setupData !== null}
                                className="bg-neon-blue text-cyber-900 px-6 py-2 rounded-lg font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(45,165,199,0.3)] disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading && !setupData ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                                إعداد 2FA
                            </button>
                        )}
                    </div>
                </div>

                {/* 2FA Setup Flow */}
                {setupData && !is2FAEnabled && (
                    <div className="mt-8 p-8 bg-cyber-900/50 rounded-2xl border-2 border-neon-blue/30 fade-in shadow-[0_0_30px_rgba(45,165,199,0.05)] relative overflow-hidden">
                        
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue/0 via-neon-blue to-neon-blue/0 opacity-50"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Step 1: QR Code */}
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <h3 className="text-white font-bold text-lg text-center">1. امسح الكود بالتطبيق</h3>
                                <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-cyber-800">
                                    <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                                </div>
                                
                                <div className="w-full mt-4 bg-cyber-950 p-4 rounded-lg border border-cyber-800">
                                    <p className="text-xs text-cyber-400 text-center mb-2">أو أدخل المفتاح يدوياً:</p>
                                    <div className="flex items-center gap-2 bg-cyber-900 rounded p-2 border border-cyber-700">
                                        <code className="text-neon-blue text-xs font-mono break-all text-center flex-1">{setupData.secret}</code>
                                        <button 
                                            onClick={copySecret}
                                            className="p-1.5 hover:bg-cyber-700 rounded text-cyber-300 transition-colors"
                                            title="نسخ المفتاح"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Verify */}
                            <div className="flex flex-col justify-center space-y-6">
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-2">2. تحقق من الرمز</h3>
                                    <p className="text-cyber-400 text-sm">أدخل الرمز المكون من 6 أرقام الظاهر في تطبيق Authenticator لتفعيل الخدمة.</p>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        className="w-full text-center text-3xl tracking-[1em] font-mono bg-cyber-950 border-2 border-cyber-700 rounded-xl p-4 text-white outline-none focus:border-neon-blue focus:shadow-[0_0_15px_rgba(45,165,199,0.2)] transition-all"
                                        maxLength={6}
                                        value={entryToken}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setEntryToken(val);
                                            // Auto-verify if 6 digits are entered
                                            if (val.length === 6 && !actionLoading) {
                                                // We can trigger verify here, but button is fine too
                                            }
                                        }}
                                    />

                                    <button
                                        onClick={handleVerify}
                                        disabled={actionLoading || entryToken.length < 6}
                                        className="w-full bg-accent text-white font-bold py-4 rounded-xl hover:bg-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(200,150,46,0.3)] hover:shadow-[0_0_25px_rgba(200,150,46,0.5)]"
                                    >
                                        {actionLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> جاري التحقق...</>
                                        ) : (
                                            <><ShieldCheck className="w-5 h-5" /> تفعيل وحفظ</>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => setSetupData(null)}
                                        disabled={actionLoading}
                                        className="w-full py-2 text-cyber-400 hover:text-white text-sm transition-colors"
                                    >
                                        إلغاء العملية
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="glass-card p-8 border border-cyber-700 opacity-50 cursor-not-allowed relative overflow-hidden group">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    🔐 تغيير كلمة المرور
                </h2>
                <p className="text-sm text-cyber-400">هذه الميزة غير مفعلة حالياً.</p>
            </div>
        </div>
    );
}
