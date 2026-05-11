"use client";
import { useState } from "react";

const posts = [
    { id: 1, title: "كيف تحمي نفسك من هجمات التصيد الاحتيالي", titleEn: "How to Protect Yourself from Phishing Attacks", category: "توعية", date: "2024-12-15", readTime: "5 دقائق", excerpt: "تعرف على أساليب التصيد الاحتيالي الحديثة وكيفية التعرف عليها وحماية بياناتك الشخصية من السرقة.", content: "التصيد الاحتيالي هو أحد أكثر الهجمات الإلكترونية شيوعاً، حيث يحاول المهاجمون خداع الضحايا عبر رسائل بريد إلكتروني أو مواقع مزيفة تبدو حقيقية. تشمل أساليب الحماية: التحقق من عنوان URL دائماً قبل إدخال بياناتك، عدم النقر على الروابط المشبوهة في رسائل البريد، تفعيل المصادقة الثنائية (2FA) على جميع حساباتك، واستخدام مدير كلمات مرور قوي. تذكر أن البنوك والشركات الرسمية لا تطلب أبداً معلوماتك الحساسة عبر البريد الإلكتروني." },
    { id: 2, title: "دليل المبتدئين لنظام Kali Linux", titleEn: "Beginner's Guide to Kali Linux", category: "أدوات", date: "2024-12-10", readTime: "8 دقائق", excerpt: "تعلم كيفية تثبيت واستخدام Kali Linux وأهم الأدوات المتاحة لاختبار الاختراق.", content: "Kali Linux هو توزيعة لينكس مصممة لاختبار الاختراق والأمن السيبراني. تحتوي على أكثر من 600 أداة مثل Nmap لمسح الشبكات، Wireshark لتحليل الحزم، Metasploit لاختبار الثغرات، وBurp Suite لاختبار تطبيقات الويب. للبدء: حمّل الصورة من kali.org، ثبّتها على VirtualBox أو كنظام أساسي، وابدأ بتعلم سطر الأوامر الأساسي ثم انتقل لتعلم الأدوات واحدة تلو الأخرى." },
    { id: 3, title: "ما هو مثلث CIA في أمن المعلومات؟", titleEn: "What is the CIA Triad?", category: "مفاهيم", date: "2024-12-05", readTime: "4 دقائق", excerpt: "شرح مفصل لمثلث السرية والسلامة والتوافر وكيف يشكل أساس أمن المعلومات.", content: "مثلث CIA يتكون من ثلاثة أركان: السرية (Confidentiality) — ضمان وصول المعلومات للمصرح لهم فقط عبر التشفير والتحكم في الوصول. السلامة (Integrity) — حماية البيانات من التعديل غير المصرح به عبر التوقيعات الرقمية والتجزئة. التوافر (Availability) — ضمان إمكانية الوصول للأنظمة والبيانات عند الحاجة عبر النسخ الاحتياطي وموازنة الأحمال. كل قرار أمني يجب أن يراعي هذه الأركان الثلاثة." },
    { id: 4, title: "أفضل 10 ممارسات لكلمات المرور القوية", titleEn: "Top 10 Password Best Practices", category: "توعية", date: "2024-11-28", readTime: "3 دقائق", excerpt: "نصائح عملية لإنشاء كلمات مرور قوية وإدارتها بشكل آمن.", content: "1. استخدم 12 حرفاً على الأقل. 2. امزج بين الأحرف الكبيرة والصغيرة والأرقام والرموز. 3. لا تستخدم كلمات القاموس أو المعلومات الشخصية. 4. استخدم كلمة مرور فريدة لكل حساب. 5. استخدم مدير كلمات مرور مثل Bitwarden أو 1Password. 6. فعّل المصادقة الثنائية دائماً. 7. غيّر كلمات المرور المسربة فوراً. 8. تحقق من التسريبات على haveibeenpwned.com. 9. استخدم عبارات مرور بدلاً من كلمات مفردة. 10. لا تشارك كلمات مرورك أبداً." },
    { id: 5, title: "شرح ثغرات OWASP Top 10", titleEn: "OWASP Top 10 Explained", category: "ثغرات", date: "2024-11-20", readTime: "10 دقائق", excerpt: "شرح تفصيلي لأخطر عشر ثغرات أمنية في تطبيقات الويب حسب منظمة OWASP.", content: "OWASP Top 10 هي قائمة بأخطر الثغرات الأمنية في تطبيقات الويب: A01 — التحكم المكسور في الوصول (Broken Access Control)، A02 — أخطاء التشفير (Cryptographic Failures)، A03 — الحقن (Injection) مثل SQL Injection وXSS، A04 — التصميم غير الآمن (Insecure Design)، A05 — أخطاء إعداد الأمان (Security Misconfiguration)، A06 — المكونات الضعيفة (Vulnerable Components)، A07 — أخطاء التحقق من الهوية (Authentication Failures)، A08 — أخطاء سلامة البيانات (Data Integrity Failures)، A09 — قصور المراقبة (Logging Failures)، A10 — تزوير الطلبات (SSRF)." },
    { id: 6, title: "مقدمة في التحليل الجنائي الرقمي", titleEn: "Introduction to Digital Forensics", category: "تخصصات", date: "2024-11-15", readTime: "7 دقائق", excerpt: "تعرف على أساسيات التحليل الجنائي الرقمي وكيفية التحقيق في الحوادث الأمنية.", content: "التحليل الجنائي الرقمي هو عملية جمع وفحص وتحليل الأدلة الرقمية من أجهزة الكمبيوتر والشبكات والأجهزة المحمولة. تشمل المراحل: الحفاظ على الأدلة (باستخدام أدوات مثل FTK Imager)، التحليل (باستخدام Autopsy أو EnCase)، الإبلاغ (إعداد تقارير فنية وقانونية). يُستخدم في التحقيق في الاختراقات، تتبع النشاطات الخبيثة، واستعادة البيانات المحذوفة. من المهارات الأساسية: فهم أنظمة الملفات، تحليل الذاكرة، وتحليل سجلات الشبكة." },
];

const cats = ["الكل", "توعية", "أدوات", "مفاهيم", "ثغرات", "تخصصات"];
const catIcons: Record<string, string> = { "الكل": "📰", "توعية": "🛡️", "أدوات": "🔧", "مفاهيم": "💡", "ثغرات": "🐛", "تخصصات": "🎯" };

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState("الكل");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const filteredPosts = activeCategory === "الكل" ? posts : posts.filter(p => p.category === activeCategory);

    return (
        <div style={{ paddingTop: "80px" }}>
            <div className="page-header">
                <div className="text-5xl mb-4">📰</div>
                <h1>المقالات <span className="gradient-text">والتوعية</span></h1>
                <p>مقالات تعليمية وتوعوية حول الأمن السيبراني وأحدث التقنيات والممارسات الأمنية</p>
            </div>
            <div className="section-container">
                {/* Working Category Filters */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {cats.map((c) => (
                        <button
                            key={c}
                            onClick={() => { setActiveCategory(c); setExpandedId(null); }}
                            className="px-4 py-2 rounded-xl text-sm transition-all font-medium"
                            style={{
                                background: activeCategory === c ? 'linear-gradient(135deg, #c8962e, #b0831f)' : 'rgba(255,255,255,0.6)',
                                border: activeCategory === c ? '1px solid #c8962e' : '1px solid rgba(200,150,46,0.12)',
                                color: activeCategory === c ? 'white' : '#5c5549',
                                boxShadow: activeCategory === c ? '0 4px 15px rgba(200,150,46,0.25)' : 'none',
                            }}
                        >
                            {catIcons[c]} {c}
                        </button>
                    ))}
                </div>

                {/* Post count */}
                <p className="text-center text-sm mb-6" style={{ color: '#a89f8e' }}>
                    عرض {filteredPosts.length} مقال{filteredPosts.length > 1 ? "ة" : ""}
                </p>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <article key={post.id} className="glass-card p-6 group flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="badge badge-beginner">{post.category}</span>
                                <span className="text-xs" style={{ color: '#a89f8e' }}>{post.date}</span>
                                <span className="text-xs" style={{ color: '#a89f8e' }}>• {post.readTime}</span>
                            </div>
                            <h3 className="font-bold mb-2 group-hover:text-amber-700 transition-colors" style={{ color: '#1a1612' }}>{post.title}</h3>
                            <p className="text-xs font-mono mb-3" style={{ color: '#a89f8e' }} dir="ltr">{post.titleEn}</p>
                            <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: '#5c5549' }}>{post.excerpt}</p>
                            
                            {/* Expandable Full Content */}
                            {expandedId === post.id && (
                                <div className="mb-4 p-4 rounded-xl text-sm leading-relaxed" style={{
                                    background: 'rgba(200,150,46,0.04)',
                                    border: '1px solid rgba(200,150,46,0.1)',
                                    color: '#3d3729',
                                    animation: 'fadeSlideIn 0.3s ease-out',
                                }}>
                                    {post.content}
                                </div>
                            )}

                            <button
                                onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                                className="text-sm font-semibold hover:underline transition-colors self-start"
                                style={{ color: '#c8962e' }}
                            >
                                {expandedId === post.id ? "إغلاق ✕" : "اقرأ المزيد ←"}
                            </button>
                        </article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">📭</div>
                        <p style={{ color: '#a89f8e' }}>لا توجد مقالات في هذا التصنيف حالياً</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; max-height: 0; transform: translateY(-8px); }
                    to { opacity: 1; max-height: 500px; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
