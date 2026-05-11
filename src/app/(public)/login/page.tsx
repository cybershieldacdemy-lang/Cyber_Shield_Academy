"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            
            // Check if response is actually JSON before parsing
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.error("Non-JSON response from server. Status:", res.status, "Body:", await res.text());
                throw new Error("الخادم يواجه مشكلة حالياً (500). يرجى المحاولة لاحقاً.");
            }

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/dashboard");
                router.refresh();
            } else {
                if (res.status === 401) {
                    setError(data.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
                } else if (res.status === 429) {
                    setError(data.message || "تم تجاوز عدد المحاولات، يرجى المحاولة بعد قليل");
                } else {
                    setError(data.message || "حدث خطأ غير متوقع");
                }
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || "فشل الاتصال بالإنترنت أو الخادم غير متاح");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { background: '#ffffff', border: '1px solid rgba(200,150,46,0.3)', color: '#1a1612' };

    return (
        <>
            <div style={{ paddingTop: "80px", minHeight: '100vh' }} className="flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h1 className="text-3xl font-bold mb-2">أهلاً بعودتك!</h1>
                    <p className="text-cyber-400">سجل دخولك للوصول إلى <span className="gradient-text">أكاديمية الدرع السيبراني</span></p>
                </div>
                <div className="glass-card p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl text-center text-sm" style={{ background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', color: '#e53e3e' }}>
                            ❌ {error}
                        </div>
                    )}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm text-cyber-300 mb-2">البريد الإلكتروني</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl text-cyber-100 placeholder-cyber-500 outline-none focus:ring-2 focus:ring-accent/30 transition-all" style={inputStyle} placeholder="example@email.com" dir="ltr" required />
                        </div>
                        <div>
                            <label className="block text-sm text-cyber-300 mb-2">كلمة المرور</label>
                            <div className="relative">
                                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl text-cyber-100 placeholder-cyber-500 outline-none focus:ring-2 focus:ring-accent/30 transition-all" style={inputStyle} placeholder="••••••••" dir="ltr" required />
                                <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-500 text-sm">
                                    {show ? "🙈" : "👁️"}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button type="button" onClick={() => setForgotModalOpen(true)} className="text-sm text-cyber-400 hover:text-cyan-400 transition">
                                    نسيت كلمة المرور؟
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-4 disabled:opacity-50">
                            {loading ? "⏳ جاري الدخول..." : "🔐 تسجيل الدخول"}
                        </button>
                    </form>
                    <p className="text-center text-cyber-400 text-sm mt-6">
                        ليس لديك حساب؟ <Link href="/register" className="text-accent hover:underline font-bold">أنشئ حساباً جديداً</Link>
                    </p>
                </div>
            </div>
            </div>
            
            <ForgotPasswordModal 
                isOpen={forgotModalOpen} 
                onClose={() => setForgotModalOpen(false)} 
            />
        </>
    );
}
