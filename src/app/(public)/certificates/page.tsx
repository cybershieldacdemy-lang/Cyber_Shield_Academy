"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Certificate {
    id: number;
    user_id: string;
    user_name: string;
    course_id: number;
    course_title: string;
    issued_at: string;
    certificate_code: string;
}

export default function CertificatesPage() {
    const [activeTab, setActiveTab] = useState<"my" | "verify">("my");
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Verification state
    const [verifyCode, setVerifyCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<{ valid: boolean; certificate?: Certificate } | null>(null);
    const [verifyError, setVerifyError] = useState("");

    // Fetch user & certificates
    useEffect(() => {
        const fetchData = async () => {
            try {
                const authRes = await fetch("/api/auth/me");
                const authData = await authRes.json();
                if (authData.authenticated) {
                    setUser(authData.user);
                    const certsRes = await fetch("/api/certificates");
                    if (certsRes.ok) {
                        const certsData = await certsRes.json();
                        setCerts(certsData.certificates || []);
                    }
                }
            } catch {
                // Not logged in — that's fine, verification still works
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyCode.trim()) return;

        setVerifying(true);
        setVerifyResult(null);
        setVerifyError("");

        try {
            const res = await fetch(`/api/certificates?code=${encodeURIComponent(verifyCode.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setVerifyResult({ valid: true, certificate: data.certificate });
            } else {
                setVerifyResult({ valid: false });
                setVerifyError("لم يتم العثور على شهادة بهذا الكود. تأكد من صحة الكود وحاول مجدداً.");
            }
        } catch {
            setVerifyError("حدث خطأ أثناء التحقق. يرجى المحاولة مجدداً.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh" }}>
            {/* Header */}
            <div className="page-header">
                <div className="text-5xl mb-4">📜</div>
                <h1>الشهادات <span className="gradient-text">والتحقق</span></h1>
                <p>عرض شهاداتك أو التحقق من صحة أي شهادة صادرة عن أكاديمية سايبر شيلد</p>
            </div>

            <div className="section-container">
                {/* Tab Switcher */}
                <div className="flex justify-center gap-2 mb-10">
                    <button
                        onClick={() => setActiveTab("my")}
                        className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: activeTab === "my" ? "linear-gradient(135deg, #c8962e, #b0831f)" : "rgba(255,255,255,0.6)",
                            border: activeTab === "my" ? "1px solid #c8962e" : "1px solid rgba(200,150,46,0.12)",
                            color: activeTab === "my" ? "white" : "#5c5549",
                            boxShadow: activeTab === "my" ? "0 4px 15px rgba(200,150,46,0.25)" : "none",
                        }}
                    >
                        🏆 شهاداتي
                    </button>
                    <button
                        onClick={() => setActiveTab("verify")}
                        className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: activeTab === "verify" ? "linear-gradient(135deg, #c8962e, #b0831f)" : "rgba(255,255,255,0.6)",
                            border: activeTab === "verify" ? "1px solid #c8962e" : "1px solid rgba(200,150,46,0.12)",
                            color: activeTab === "verify" ? "white" : "#5c5549",
                            boxShadow: activeTab === "verify" ? "0 4px 15px rgba(200,150,46,0.25)" : "none",
                        }}
                    >
                        🔍 التحقق من شهادة
                    </button>
                </div>

                {/* ═══════ MY CERTIFICATES TAB ═══════ */}
                {activeTab === "my" && (
                    <div>
                        {loading ? (
                            /* Skeleton Loader */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="glass-card p-6 animate-pulse">
                                        <div className="w-14 h-14 rounded-xl mx-auto mb-4" style={{ background: '#ece4d4' }} />
                                        <div className="h-5 w-3/4 rounded mx-auto mb-2" style={{ background: '#ece4d4' }} />
                                        <div className="h-4 w-1/2 rounded mx-auto mb-4" style={{ background: '#f5efe3' }} />
                                        <div className="h-px w-full mb-4" style={{ background: '#f5efe3' }} />
                                        <div className="h-3 w-2/3 rounded mx-auto" style={{ background: '#f5efe3' }} />
                                    </div>
                                ))}
                            </div>
                        ) : !user ? (
                            /* Not logged in */
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔒</div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1612' }}>يجب تسجيل الدخول</h3>
                                <p className="mb-6" style={{ color: '#a89f8e' }}>سجّل دخولك لعرض شهاداتك</p>
                                <Link href="/login?redirect=/certificates" className="btn-primary px-8 py-3">
                                    تسجيل الدخول
                                </Link>
                            </div>
                        ) : certs.length === 0 ? (
                            /* No certificates */
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1612' }}>لا توجد شهادات بعد</h3>
                                <p className="mb-6" style={{ color: '#a89f8e' }}>أكمل دورة تدريبية بنسبة 100% للحصول على شهادتك الأولى</p>
                                <Link href="/courses" className="btn-primary px-8 py-3">
                                    تصفح الدورات
                                </Link>
                            </div>
                        ) : (
                            /* Certificate Cards */
                            <>
                                <p className="text-center text-sm mb-6" style={{ color: '#a89f8e' }}>
                                    لديك {certs.length} شهادة{certs.length > 1 ? "" : ""}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {certs.map(cert => (
                                        <div key={cert.id} className="glass-card p-6 text-center group hover:shadow-lg transition-all duration-300" style={{ borderColor: 'rgba(200,150,46,0.15)' }}>
                                            {/* Badge */}
                                            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{
                                                background: 'linear-gradient(135deg, #c8962e, #b0831f)',
                                                boxShadow: '0 4px 15px rgba(200,150,46,0.3)',
                                            }}>
                                                🏅
                                            </div>

                                            {/* Course Title */}
                                            <h3 className="font-bold text-lg mb-1 group-hover:text-amber-700 transition-colors" style={{ color: '#1a1612' }}>
                                                {cert.course_title}
                                            </h3>
                                            <p className="text-xs mb-3" style={{ color: '#a89f8e' }}>
                                                باسم: {cert.user_name}
                                            </p>

                                            <div className="h-px w-full mb-4" style={{ background: 'rgba(200,150,46,0.12)' }} />

                                            {/* Certificate Code */}
                                            <div className="font-mono text-xs px-3 py-1.5 rounded-lg inline-block mb-3" style={{
                                                background: 'rgba(200,150,46,0.08)',
                                                color: '#c8962e',
                                                border: '1px solid rgba(200,150,46,0.15)',
                                            }}>
                                                {cert.certificate_code}
                                            </div>

                                            {/* Date */}
                                            <p className="text-xs mb-4" style={{ color: '#a89f8e' }}>
                                                صدرت بتاريخ: {new Date(cert.issued_at + 'Z').toLocaleDateString('ar-EG', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </p>

                                            {/* View Button */}
                                            <Link
                                                href={`/certificates/${cert.id}`}
                                                className="inline-block text-sm font-medium px-6 py-2.5 rounded-xl transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, #c8962e, #b0831f)',
                                                    color: 'white',
                                                    boxShadow: '0 2px 10px rgba(200,150,46,0.2)',
                                                }}
                                            >
                                                👁️ عرض الشهادة
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ═══════ VERIFY CERTIFICATE TAB ═══════ */}
                {activeTab === "verify" && (
                    <div className="max-w-xl mx-auto">
                        <div className="glass-card p-8">
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-3">🔍</div>
                                <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1612' }}>التحقق من شهادة</h2>
                                <p className="text-sm" style={{ color: '#a89f8e' }}>
                                    أدخل كود الشهادة للتأكد من صحتها ومصداقيتها
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#5c5549' }}>كود الشهادة</label>
                                    <input
                                        type="text"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                                        placeholder="مثال: CS-A1B2C3D4 أو CERT-ABCDEF12-1"
                                        className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none transition-all text-center tracking-wider"
                                        style={{
                                            background: 'rgba(255,255,255,0.8)',
                                            border: '1px solid rgba(200,150,46,0.2)',
                                            color: '#1a1612',
                                        }}
                                        dir="ltr"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={verifying || !verifyCode.trim()}
                                    className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, #c8962e, #b0831f)',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(200,150,46,0.25)',
                                    }}
                                >
                                    {verifying ? "⏳ جاري التحقق..." : "🔍 تحقق الآن"}
                                </button>
                            </form>

                            {/* Verification Result */}
                            {verifyResult && (
                                <div className="mt-6 p-5 rounded-xl" style={{
                                    background: verifyResult.valid ? 'rgba(56,178,172,0.08)' : 'rgba(229,62,62,0.08)',
                                    border: `1px solid ${verifyResult.valid ? 'rgba(56,178,172,0.2)' : 'rgba(229,62,62,0.2)'}`,
                                    animation: 'fadeSlideIn 0.3s ease-out',
                                }}>
                                    {verifyResult.valid && verifyResult.certificate ? (
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">✅</div>
                                            <h3 className="text-lg font-bold mb-1" style={{ color: '#276749' }}>شهادة صالحة ومعتمدة</h3>
                                            <div className="h-px w-full my-4" style={{ background: 'rgba(56,178,172,0.15)' }} />
                                            <div className="space-y-2 text-sm" style={{ color: '#5c5549' }}>
                                                <p><strong>👤 الاسم:</strong> {verifyResult.certificate.user_name}</p>
                                                <p><strong>📚 الدورة:</strong> {verifyResult.certificate.course_title}</p>
                                                <p><strong>📅 تاريخ الإصدار:</strong> {new Date(verifyResult.certificate.issued_at + 'Z').toLocaleDateString('ar-EG', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}</p>
                                                <p className="font-mono text-xs pt-2" style={{ color: '#a89f8e' }}>
                                                    🔑 {verifyResult.certificate.certificate_code}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/certificates/${verifyResult.certificate.id}`}
                                                className="inline-block mt-4 text-sm font-medium px-6 py-2 rounded-xl transition-all"
                                                style={{
                                                    background: 'rgba(56,178,172,0.1)',
                                                    color: '#276749',
                                                    border: '1px solid rgba(56,178,172,0.2)',
                                                }}
                                            >
                                                👁️ عرض الشهادة الكاملة
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">❌</div>
                                            <h3 className="text-lg font-bold mb-2" style={{ color: '#c53030' }}>شهادة غير موجودة</h3>
                                            <p className="text-sm" style={{ color: '#a89f8e' }}>{verifyError}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="mt-8 glass-card p-6">
                            <h3 className="font-bold text-sm mb-4" style={{ color: '#1a1612' }}>ℹ️ معلومات حول الشهادات</h3>
                            <div className="space-y-3 text-sm" style={{ color: '#5c5549' }}>
                                {[
                                    { icon: "🎓", text: "تُمنح الشهادة تلقائياً عند إكمال جميع دروس الدورة بنسبة 100%" },
                                    { icon: "🔐", text: "كل شهادة تحمل كوداً فريداً يمكن التحقق منه في أي وقت" },
                                    { icon: "🖨️", text: "يمكنك طباعة الشهادة أو تحميلها كملف PDF من صفحة عرض الشهادة" },
                                    { icon: "🔗", text: "شارك رابط شهادتك مع أصحاب العمل للتحقق من مؤهلاتك" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(200,150,46,0.04)' }}>
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
