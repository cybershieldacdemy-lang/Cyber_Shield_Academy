"use client";
import React, { useState } from "react";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = "input_target" | "input_otp" | "reset_password" | "success";

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [step, setStep] = useState<Step>("input_target");
    const [target, setTarget] = useState("");
    const [method, setMethod] = useState<"email" | "sms">("email");
    const [otp, setOtp] = useState("");
    const [token, setToken] = useState(""); // Acquired after OTP verification
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    const resetState = () => {
        setStep("input_target");
        setTarget("");
        setOtp("");
        setToken("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setMessage("");
        setMethod("email");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        
        if (!target.trim()) {
            setError("الرجاء إدخال البريد الإلكتروني أو رقم الهاتف");
            return;
        }

        // Simple validation
        if (target.includes("@")) {
            setMethod("email");
        } else {
            setMethod("sms");
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    target, 
                    method: target.includes("@") ? "email" : "sms" 
                }),
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);

            setMessage(data.message);
            if (target.includes("@")) {
                setStep("success"); // Email sent, they need to check inbox
            } else {
                setStep("input_otp"); // Need to enter OTP
            }
        } catch (err: any) {
            setError(err.message || "حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!otp.trim() || otp.length !== 6) {
            setError("الرمز غير صحيح، يجب أن يكون 6 أرقام");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target, otp }),
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);

            setToken(data.token);
            setStep("reset_password");
        } catch (err: any) {
            setError(err.message || "الرمز غير صحيح");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
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

            setMessage("تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
            setStep("success");
        } catch (err: any) {
            setError(err.message || "فشل تغيير كلمة المرور");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { background: '#1a1612', border: '1px solid rgba(200,150,46,0.4)', color: '#f5efe3' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>
            <div className="relative w-full max-w-md p-8 rounded-2xl shadow-2xl animate-fade-in" style={{ background: '#0b0e14', border: '1px solid rgba(200,150,46,0.3)' }}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-cyber-500 hover:text-white transition">✕</button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        🔐
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">استعادة كلمة المرور</h2>
                    {step === "input_target" && <p className="text-cyber-400 text-sm">أدخل بريدك الإلكتروني أو رقم الهاتف</p>}
                    {step === "input_otp" && <p className="text-cyber-400 text-sm">أدخل الرمز المرسل إلى هاتفك</p>}
                    {step === "reset_password" && <p className="text-cyber-400 text-sm">أدخل كلمة المرور الجديدة</p>}
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl text-center text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse">
                        ⚠️ {error}
                    </div>
                )}

                {message && step !== "success" && (
                    <div className="mb-6 p-3 rounded-xl text-center text-sm font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                        {message}
                    </div>
                )}

                {step === "input_target" && (
                    <form onSubmit={handleSendRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm text-cyber-300 mb-2">البريد الإلكتروني أو رقم الهاتف</label>
                            <input 
                                type="text" 
                                value={target} 
                                onChange={(e) => setTarget(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-center" 
                                style={inputStyle} 
                                placeholder="example@email.com / 05xxxxxxx" 
                                dir="ltr" 
                                required 
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-black transition-all disabled:opacity-50 flex justify-center items-center gap-2" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                            {loading ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> : "إرسال رمز الاستعادة"}
                        </button>
                    </form>
                )}

                {step === "input_otp" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm text-cyber-300 mb-2">رمز التحقق (OTP)</label>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-center text-2xl tracking-[1em]" 
                                style={inputStyle} 
                                placeholder="------" 
                                maxLength={6}
                                dir="ltr" 
                                required 
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-black transition-all disabled:opacity-50 flex justify-center items-center gap-2" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                            {loading ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> : "تحقق من الرمز"}
                        </button>
                    </form>
                )}

                {step === "reset_password" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm text-cyber-300 mb-2">كلمة المرور الجديدة</label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-center tracking-widest" 
                                style={inputStyle} 
                                placeholder="••••••••" 
                                dir="ltr" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-cyber-300 mb-2">تأكيد كلمة المرور</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-center tracking-widest" 
                                style={inputStyle} 
                                placeholder="••••••••" 
                                dir="ltr" 
                                required 
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-black transition-all disabled:opacity-50 flex justify-center items-center gap-2" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            {loading ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> : "حفظ كلمة المرور"}
                        </button>
                    </form>
                )}

                {step === "success" && (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl border border-green-500/30 animate-scale-up">
                            ✅
                        </div>
                        <p className="text-cyber-300 font-bold leading-relaxed">{message || "الرجاء التحقق من بريدك الإلكتروني لاتباع رابط استعادة كلمة المرور."}</p>
                        <button onClick={handleClose} className="w-full py-3 rounded-xl font-bold text-white transition-all bg-cyber-800 border border-cyber-700 hover:bg-cyber-700">
                            العودة لتسجيل الدخول
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
