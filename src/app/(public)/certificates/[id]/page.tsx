"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Certificate {
    id: string;
    user_id: string;
    user_name: string;
    course_id: number;
    course_title: string;
    issued_at: string;
    certificate_code: string;
}

export default function CertificatePage() {
    const params = useParams();
    const [cert, setCert] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/certificates/${params.id}`)
            .then(res => {
                if (!res.ok) throw new Error("Certificate not found");
                return res.json();
            })
            .then(data => setCert(data))
            .catch(() => setError("الشهادة غير موجودة أو معطوبة"))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-full max-w-2xl mx-auto p-8 animate-pulse">
                    <div className="glass-card p-10 text-center">
                        <div className="w-20 h-20 rounded-full mx-auto mb-4" style={{ background: '#ece4d4' }} />
                        <div className="h-6 w-48 rounded mx-auto mb-3" style={{ background: '#ece4d4' }} />
                        <div className="h-4 w-64 rounded mx-auto mb-6" style={{ background: '#f5efe3' }} />
                        <div className="h-px w-3/4 mx-auto mb-6" style={{ background: '#ece4d4' }} />
                        <div className="h-4 w-40 rounded mx-auto mb-2" style={{ background: '#f5efe3' }} />
                        <div className="h-3 w-32 rounded mx-auto" style={{ background: '#f5efe3' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !cert) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center px-4">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-2xl font-bold text-cyber-100 mb-2">الشهادة غير موجودة</h2>
                <p className="text-cyber-400 mb-6">{error}</p>
                <Link href="/" className="btn-primary px-6 py-3">العودة للرئيسية</Link>
            </div>
        );
    }

    const formattedDate = new Date(cert.issued_at + 'Z').toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center relative bg-cyber-950 px-4">
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #certificate-container, #certificate-container * {
                        visibility: visible;
                    }
                    #certificate-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        padding: 0;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />

            {/* Actions */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-6 no-print">
                <Link href="/dashboard/student" className="text-cyber-400 hover:text-cyber-950 transition-colors">
                    ← العودة للوحة التحكم
                </Link>
                <div className="flex gap-4">
                    <button onClick={handlePrint} className="btn-primary py-2 px-6 shadow-lg shadow-accent/20">
                        🖨️ طباعة / تحميل PDF
                    </button>
                    <button onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("تم نسخ الرابط!");
                    }} className="glass-card py-2 px-6 text-cyber-300 hover:text-white transition-colors">
                        🔗 نسخ الرابط
                    </button>
                </div>
            </div>

            {/* Certificate Container */}
            <div id="certificate-container" className="w-full max-w-5xl bg-white shadow-2xl relative overflow-hidden" style={{ aspectRatio: '1.414 / 1', minHeight: '600px' }}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}></div>

                {/* Borders */}
                <div className="absolute inset-4 border-2 border-[#c8962e]"></div>
                <div className="absolute inset-5 border border-[#c8962e] opacity-50"></div>
                <div className="absolute inset-0 border-[16px] border-cyber-100"></div>

                {/* Corner Decorations */}
                <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#c8962e]"></div>
                <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#c8962e]"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#c8962e]"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#c8962e]"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-16">
                    {/* Header */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-20 h-20 mb-4 rounded-xl flex items-center justify-center text-4xl shadow-lg" style={{ background: 'linear-gradient(135deg, #1a1612, #2d2620)', border: '1px solid #c8962e' }}>
                            🛡️
                        </div>
                        <h1 className="text-4xl font-bold uppercase tracking-widest text-cyber-100">CyberShield Academy</h1>
                        <div className="w-32 h-1 bg-[#c8962e] mt-4"></div>
                    </div>

                    <h2 className="text-5xl font-serif text-[#c8962e] mb-10" style={{ letterSpacing: '2px' }}>شهادة إتمام دورة</h2>

                    <p className="text-xl text-gray-600 mb-4">تشهد أكاديمية سايبر شيلد بأن المتدرب</p>
                    <h3 className="text-4xl font-bold text-cyber-100 mb-6 border-b-2 border-dashed border-gray-300 pb-2 px-12 inline-block">
                        {cert.user_name}
                    </h3>

                    <p className="text-xl text-gray-600 mb-4">قد أتم بنجاح متطلبات الدورة التدريبية</p>
                    <h4 className="text-3xl font-bold text-[#c8962e] mb-16">
                        {cert.course_title}
                    </h4>

                    {/* Footer */}
                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end">
                        <div className="text-right">
                            <p className="text-gray-500 font-bold mb-1">المدير العام</p>
                            <div className="w-48 h-12 flex items-center justify-end">
                                <span className="font-serif text-2xl text-cyber-100" style={{ transform: 'rotate(-5deg)' }}>CyberShield</span>
                            </div>
                            <div className="w-48 border-t border-gray-400 mt-2"></div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="mb-2">
                                {/* Seal/Badge */}
                                <div className="w-24 h-24 rounded-full border-4 border-[#c8962e] flex items-center justify-center relative shadow-lg bg-[#fafafa]">
                                    <div className="absolute inset-1 rounded-full border border-dashed border-[#c8962e]"></div>
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-cyber-100">OFFICIAL</div>
                                        <div className="text-2xl">🏅</div>
                                        <div className="text-xs font-bold text-cyber-100">CERTIFIED</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-left" dir="ltr">
                            <div className="mb-2">
                                <span className="text-gray-500 text-sm font-bold block mb-1">Date Format: {formattedDate}</span>
                                <span className="text-gray-500 text-sm font-bold block">ID: {cert.certificate_code}</span>
                            </div>
                            <div className="w-48 border-t border-gray-400 mt-2"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-cyber-500 text-sm text-center max-w-2xl no-print">
                يمكن التحقق من صحة هذه الشهادة من خلال مسح رمز QR أو إدخال كود الشهادة في صفحة التحقق من الشهادات.
            </div>
        </div>
    );
}
