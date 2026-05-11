"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center p-8 glass-card border border-red-500/30">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-white mb-2">رابط غير صالح</h2>
                <p className="text-cyber-400 mb-6">رابط استعادة كلمة المرور مفقود أو غير صحيح.</p>
                <Link href="/login" className="btn-primary inline-block">العودة لتسجيل الدخول</Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("كلمة المرور يجب أن تتكون من 8 أحرف على الأقل");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("كلمتا المرور غير متطابقتين");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء إعادة ضبط كلمة المرور");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(200,150,46,0.15)' };

    if (success) {
        return (
            <div className="text-center p-8 glass-card border border-green-500/30 animate-fade-in">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-white mb-2">تم بنجاح!</h2>
                <p className="text-cyber-400 mb-8">تم تغيير كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
                <Link href="/login" className="btn-primary w-full inline-block text-center py-4">تسجيل الدخول الآن</Link>
            </div>
        );
    }

    return (
        <div className="glass-card p-8 animate-fade-in">
            <div className="text-center mb-6">
                <div className="text-5xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-white">كلمة مرور جديدة</h2>
                <p className="text-cyber-400 text-sm mt-2">يرجى إدخال كلمة المرور الجديدة أدناه.</p>
            </div>

            {error && (
                <div className="mb-6 p-3 rounded-xl text-center text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm text-cyber-300 mb-2">كلمة المرور الجديدة</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl text-cyber-900 placeholder-cyber-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-center tracking-widest" 
                        style={inputStyle} 
                        placeholder="••••••••" 
                        dir="ltr" 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm text-cyber-300 mb-2">تأكيد كلمة المرور الجديدة</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl text-cyber-900 placeholder-cyber-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-center tracking-widest" 
                        style={inputStyle} 
                        placeholder="••••••••" 
                        dir="ltr" 
                        required 
                    />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-black transition-all disabled:opacity-50 flex justify-center items-center gap-2" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    {loading ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> : "حفظ التغييرات"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{ paddingTop: "80px", minHeight: '100vh' }} className="flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Suspense fallback={<div className="text-center text-cyan-400 animate-pulse font-bold">جاري التحميل...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
