"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
    const [planName, setPlanName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("/api/subscription/status", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.subscription) setPlanName(data.subscription.name_ar);
                })
                .catch(() => {});
        }
    }, []);

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh" }} className="flex items-center justify-center px-4">
            <div className="w-full max-w-lg text-center">
                <div className="glass-card p-12 relative overflow-hidden">
                    {/* Confetti-like dots */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, #c8962e 1px, transparent 1px), radial-gradient(circle, #38b2ac 1px, transparent 1px)',
                        backgroundSize: '30px 30px, 50px 50px',
                        backgroundPosition: '0 0, 15px 15px',
                    }} />

                    <div className="relative z-10">
                        {/* Success Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)' }}>
                            🎉
                        </div>

                        <h1 className="text-3xl font-black mb-3" style={{ color: '#1a1612' }}>
                            تم الاشتراك بنجاح!
                        </h1>

                        {planName && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{
                                background: 'rgba(200,150,46,0.1)',
                                border: '1px solid rgba(200,150,46,0.3)',
                            }}>
                                <span className="text-sm font-bold" style={{ color: '#c8962e' }}>
                                    ✦ باقة {planName}
                                </span>
                            </div>
                        )}

                        <p className="mb-8 leading-relaxed" style={{ color: '#5c5549' }}>
                            تهانينا! تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستفادة من جميع مميزات باقتك الجديدة.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/dashboard" className="btn-primary px-8 py-3.5">
                                انتقل للوحة التحكم 🚀
                            </Link>
                            <Link href="/courses" className="btn-secondary px-8 py-3.5">
                                تصفح الدورات 📚
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
