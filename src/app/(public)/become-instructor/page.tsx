"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

// Form and Test Steps
type Step = "FORM" | "TEST" | "SUCCESS" | "FAILED";

export default function BecomeInstructor() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("FORM");
    
    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        specialization: "",
        experience: "",
        cv_link: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Test Data
    const questions = [
        {
            q: "ما هو الغرض الرئيسي من Web Application Firewall (WAF)؟",
            options: [
                "الحماية ضد هجمات DDoS في الطبقة الثالثة",
                "تصفية ومراقبة حركة مرور HTTP للتطبيقات",
                "تشفير البيانات المخزنة",
                "إدارة الهوية والوصول"
            ],
            correct: 1
        },
        {
            q: "أي نوع من حقن SQL يعتمد على استجابات قاعدة البيانات الصحيحة والخاطئة؟",
            options: [
                "Union-based SQLi",
                "Boolean-based Blind SQLi",
                "Time-based Blind SQLi",
                "Error-based SQLi"
            ],
            correct: 1
        },
        {
            q: "ماذا يعني اختصار CORS في حماية الويب؟",
            options: [
                "Cross-Origin Resource Sharing",
                "Cross-Origin Request Security",
                "Central Object Repository System",
                "Cross-Object Resource Sharing"
            ],
            correct: 0
        },
        {
            q: "أي ترويسة اتصال تُستخدم لمنع هجمات Clickjacking؟",
            options: [
                "Content-Security-Policy",
                "Strict-Transport-Security",
                "X-Frame-Options",
                "X-XSS-Protection"
            ],
            correct: 2
        },
        {
            q: "في مجال التشفير، ما فائدة الـ Salt عند تخزين كلمات المرور؟",
            options: [
                "ضغط البيانات وتقليل مساحتها",
                "إحباط هجمات Rainbow Tables بإضافة بيانات عشوائية",
                "تسريع بناء الهاش",
                "السماح باسترجاع كلمة المرور الأصلية"
            ],
            correct: 1
        }
    ];

    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

    // Initial check for authenticated user
    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && data.user) {
                    setFormData(prev => ({
                        ...prev,
                        name: data.user.name || "",
                        email: data.user.email || ""
                    }));
                }
            })
            .catch(() => {});
    }, []);

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!formData.name || !formData.email || !formData.specialization || !formData.experience) {
            setError("يرجى ملء جميع الحقول الإجبارية");
            return;
        }
        
        setStep("TEST");
    };

    const handleTestAnswer = () => {
        if (selectedOpt === null) return;
        
        let newScore = score;
        if (selectedOpt === questions[currentQ].correct) {
            newScore++;
        }
        setScore(newScore);
        
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelectedOpt(null);
        } else {
            // Finish test: evaluation
            submitApplication(newScore);
        }
    };

    const submitApplication = async (finalScore: number) => {
        const percentage = (finalScore / questions.length) * 100;
        
        if (percentage < 70) {
            setStep("FAILED");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/teacher-applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                setStep("SUCCESS");
            } else {
                setError(data.message || "حدث خطأ أثناء الإرسال");
                setStep("FORM");
            }
        } catch {
            setError("تعذر الإتصال بالخادم، حاول مرة أخرى.");
            setStep("FORM");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 bg-[#faf6ee]">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black mb-3 gradient-text">انضم لفريق المدربين</h1>
                    <p className="text-lg text-cyber-400">شارك خبرتك في الأمن السيبراني مع آلاف المتعلمين وحقق دخلاً مستداماً</p>
                </div>

                <div className="glass-card p-8 rounded-2xl shadow-xl relative overflow-hidden" style={{ borderTop: "4px solid #c8962e" }}>
                    
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {step === "FORM" && (
                        <form onSubmit={handleFormSubmit} className="space-y-6 slide-up">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-700/10">
                                <div className="w-10 h-10 rounded-full bg-cyber-900 border border-cyber-700 flex items-center justify-center font-bold text-cyber-300">1</div>
                                <h2 className="text-xl font-bold text-cyber-100">المعلومات الشخصية والخبرات</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-cyber-200 mb-2">الاسم الكامل *</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="cyber-input w-full" placeholder="أحمد سعيد" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-cyber-200 mb-2">البريد الإلكتروني *</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="cyber-input w-full" placeholder="email@example.com" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-cyber-200 mb-2">أبرز تخصصاتك *</label>
                                <input required type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="cyber-input w-full" placeholder="مثال: Web Pentesting, Reverse Engineering" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-cyber-200 mb-2">ملخص الخبرة (سنوات، شهادات) *</label>
                                <textarea required rows={4} value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="cyber-input w-full" placeholder="خبرة 5 سنوات في كشف الثغرات وحاصل على شهادة OSCP..."></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-cyber-200 mb-2">رابط للسيرة الذاتية أو حساب LinkedIn (اختياري)</label>
                                <input type="url" value={formData.cv_link} onChange={e => setFormData({...formData, cv_link: e.target.value})} className="cyber-input w-full" placeholder="https://..." />
                            </div>

                            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-lg">
                                الانتقال للاختبار الأمني ←
                            </button>
                        </form>
                    )}

                    {step === "TEST" && (
                        <div className="slide-up">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-700/10">
                                <div className="w-10 h-10 rounded-full bg-cyber-900 border border-cyber-700 flex items-center justify-center font-bold text-[#c8962e]">2</div>
                                <h2 className="text-xl font-bold text-cyber-100">الاختبار الأمني التقييمي</h2>
                            </div>
                            <p className="text-cyber-500 mb-8 text-sm">
                                لضمان جودة المحتوى التعليمي في الأكاديمية، يجب عليك اجتياز هذا الاختبار السريع. (تحتاج إلى 80% للنجاح)
                            </p>

                            <div className="mb-4 text-sm font-bold" style={{ color: "#c8962e" }}>
                                سؤال {currentQ + 1} من {questions.length}
                            </div>
                            <h3 className="text-lg font-bold text-cyber-100 mb-6">{questions[currentQ].q}</h3>
                            
                            <div className="space-y-3 mb-8">
                                {questions[currentQ].options.map((opt, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setSelectedOpt(i)}
                                        className={`w-full text-right p-4 rounded-xl border-2 transition-all ${selectedOpt === i ? 'border-[#c8962e] bg-[#c8962e08] shadow-sm' : 'border-cyber-700/20 hover:border-cyber-300'}`}
                                    >
                                        <span className="font-medium text-cyber-200">{opt}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3">
                                {submitting ? (
                                    <div className="py-3 px-6 rounded-lg bg-gray-100 text-gray-500 font-bold animate-pulse">جاري التقييم...</div>
                                ) : (
                                    <button 
                                        disabled={selectedOpt === null} 
                                        onClick={handleTestAnswer} 
                                        className="btn-primary px-8 py-3 disabled:opacity-50"
                                    >
                                        {currentQ === questions.length - 1 ? 'إنهاء التقييم' : 'السؤال التالي'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {step === "SUCCESS" && (
                        <div className="text-center py-10 slide-up border-2 border-green-500/20 rounded-2xl bg-green-50/50">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold text-cyber-100 mb-3">لقد قمت باجتياز الاختبار بنجاح وتم استلام طلبك!</h2>
                            <p className="text-cyber-500 mb-8 max-w-md mx-auto">
                                حصلت على تقييم ممتاز. يقوم فريقنا الآن بمراجعة بياناتك وخبراتك وسنقوم بتفعيل حساب المدرّب الخاص بك قريباً جداً.
                            </p>
                            <button onClick={() => router.push('/dashboard')} className="btn-primary py-3 px-8">العودة للوحة التحكم</button>
                        </div>
                    )}

                    {step === "FAILED" && (
                        <div className="text-center py-10 slide-up border-2 border-red-500/20 rounded-2xl bg-red-50/50">
                            <div className="text-6xl mb-4">❌</div>
                            <h2 className="text-2xl font-bold text-red-600 mb-3">للأسف، لم تجتز الاختبار الأمني</h2>
                            <p className="text-red-500/80 mb-8 max-w-md mx-auto">
                                لم تصل للمعدل المطلوب للانضمام كمدرب في الوقت الحالي. نوصي بتطوير مهاراتك والمحاولة مرة أخرى مستقبلا.
                            </p>
                            <button onClick={() => setStep("FORM")} className="px-6 py-3 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-bold">إعادة المحاولة لاحقاً</button>
                        </div>
                    )}

                </div>
            </div>
            
            <style jsx>{`
                .slide-up {
                    animation: slideUp 0.4s ease-out forwards;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
