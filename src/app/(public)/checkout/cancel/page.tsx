"use client";
import Link from "next/link";

export default function CheckoutCancelPage() {
    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh" }} className="flex items-center justify-center px-4">
            <div className="w-full max-w-lg text-center">
                <div className="glass-card p-12">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl"
                        style={{ background: 'rgba(229,62,62,0.08)', border: '2px solid rgba(229,62,62,0.2)' }}>
                        😕
                    </div>

                    <h1 className="text-3xl font-black mb-3" style={{ color: '#1a1612' }}>
                        تم إلغاء عملية الدفع
                    </h1>

                    <p className="mb-8 leading-relaxed" style={{ color: '#5c5549' }}>
                        لا تقلق، لم يتم خصم أي مبلغ من حسابك. يمكنك المحاولة مرة أخرى في أي وقت.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/pricing" className="btn-primary px-8 py-3.5">
                            العودة للأسعار 💳
                        </Link>
                        <Link href="/dashboard" className="btn-secondary px-8 py-3.5">
                            لوحة التحكم
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
