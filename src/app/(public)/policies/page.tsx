"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PoliciesContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("terms");

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && ["terms", "privacy", "security", "ip", "compliance"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const tabs = [
        { id: "terms", label: "شروط الخدمة", icon: "📜" },
        { id: "privacy", label: "سياسة الخصوصية", icon: "🔒" },
        { id: "security", label: "سياسة الأمان", icon: "🛡️" },
        { id: "ip", label: "حقوق الملكية", icon: "©️" },
        { id: "compliance", label: "معايير الامتثال", icon: "✅" },
    ];

    const content = {
        terms: (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-cyber-100 mb-4">شروط الخدمة واتفاقية الاستخدام</h2>
                <div className="policy-section">
                    <h3>1. مقدمة</h3>
                    <p>مرحباً بكم في أكاديمية الدرع السيبراني (Cyber Shield Academy). باستخدامكم لهذا الموقع، فإنكم توافقون على الالتزام بهذه الشروط والأحكام. إذا كنتم لا توافقون على أي جزء من هذه الشروط، فلا يحق لكم استخدام الموقع.</p>
                </div>
                <div className="policy-section">
                    <h3>2. حساب المستخدم</h3>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li>يجب أن تكون المعلومات المقدمة أثناء التسجيل دقيقة ومحدثة.</li>
                        <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور وحسابك.</li>
                        <li>يمنع مشاركة الحساب مع أشخاص آخرين.</li>
                        <li>نحتفظ بالحق في تعليق أو إنهاء حسابك إذا تم اكتشاف أي نشاط مشبوه أو انتهاك للشروط.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>3. حماية المحتوى والقرصنة الرقمية</h3>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                        <p className="text-red-400 text-sm font-bold">🚫 تحذير صارم: نحن نطبق سياسة &quot;صفر تسامح&quot; مع القرصنة الرقمية.</p>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li><strong>حماية الحقوق:</strong> جميع الدورات والمقاطع المرئية والنصية محمية بتقنيات تتبع رقمية (Digital Fingerprinting).</li>
                        <li><strong>الممارسات المحظورة:</strong> يمنع منعاً باتاً تسجيل الشاشة، أو تحميل المحتوى (طرق غير مشروعة)، أو إعادة بيع الحسابات.</li>
                        <li><strong>العواقب:</strong> في حال ثبوت الانتهاك، سيتم حظر الحساب فوراً دون استرداد للمبالغ، وسيتم اتخاذ كافة الإجراءات القانونية اللازمة والملاحقة القضائية بموجب نظام مكافحة الجرائم المعلوماتية وحماية حقوق المؤلف.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>4. استخدام المحتوى</h3>
                    <p>جميع المواد التعليمية والدورات والمقالات هي للاستخدام الشخصي والتعليمي فقط. يمنع نسخ أو توزيع أو بيع أي جزء من المحتوى دون إذن كتابي مسبق.</p>
                </div>
                <div className="policy-section">
                    <h3>5. السلوك المسموح به</h3>
                    <p>تتعهدون بعدم استخدام الموقع لأي أغراض غير قانونية أو ضارة، بما في ذلك:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300 mt-2">
                        <li>نشر برمجيات خبيثة أو فيروسات.</li>
                        <li>محاولة استغلال ثغرات أمنية في الموقع (إلا في حال وجود برنامج مكافآت ثغرات رسمي).</li>
                        <li>التحرش أو الإساءة للمستخدمين الآخرين.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>6. الخصوصية وحماية البيانات</h3>
                    <p>أنت تدرك وتوافق على أن استخدامك للموقع يخضع أيضًا لـ <a href="?tab=privacy" className="text-accent hover:underline">سياسة الخصوصية</a> الخاصة بنا، والتي توضح كيفية جمعنا واستخدامنا وتخزيننا لبياناتك الشخصية.</p>
                </div>
            </div>
        ),
        privacy: (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-cyber-100 mb-4">سياسة الخصوصية وحماية البيانات</h2>
                <div className="policy-section">
                    <h3>1. البيانات التي نجمعها</h3>
                    <p>نحن نجمع البيانات الضرورية لتقديم خدماتنا، وتشمل:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li>المعلومات الشخصية (الاسم، البريد الإلكتروني، الهاتف، الدولة).</li>
                        <li>بيانات الدخول (تاريخ ووقت الدخول، عنوان IP).</li>
                        <li>التقدم الدراسي (الدورات المكتملة، الشهادات، الدرجات).</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>2. كيف نستخدم بياناتك</h3>
                    <p>تستخدم البيانات للأغراض التالية:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li>تحسين تجربتك التعليمية وتخصيص المحتوى.</li>
                        <li>إرسال تحديثات حول الدورات والشهادات.</li>
                        <li>تحليل أداء الموقع وتحسين الأمان.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>3. مشاركة البيانات</h3>
                    <p>نحن لا نبيع بياناتك لأطراف ثالثة. قد نشارك البيانات فقط في الحالات التالية:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li>مع مقدمي الخدمات الموثوقين الذين يساعدوننا في تشغيل الموقع (مثل استضافة الخوادم).</li>
                        <li>الامتثال للقوانين واللوائح المعمول بها.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>4. تخزين وحفظ البيانات</h3>
                    <p>نلتزم بحفظ بياناتك بشكل آمن وفقاً للمعايير التالية:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li><strong>موقع التخزين:</strong> يتم تخزين كافة البيانات على خوادم آمنة ومحمية ومشفرة.</li>
                        <li><strong>مدة الاحتفاظ:</strong> نحتفظ ببياناتك طالما كان حسابك نشطاً. يتم الاحتفاظ بسجلات التدقيق (Audit Logs) لمدة لا تقل عن سنة لأغراض أمنية وتنظيمية.</li>
                        <li><strong>التخلص من البيانات:</strong> عند حذف الحساب، أو انتهاء الحاجة للبيانات، يتم إتلافها أو إخفاء هويتها بشكل آمن ولا يمكن استرجاعه.</li>
                    </ul>
                </div>
            </div>
        ),
        security: (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-cyber-100 mb-4">سياسة الأمان وحماية المعلومات</h2>
                <div className="alert-box bg-red-500/10 border-red-500/30 p-4 rounded-xl mb-6">
                    <h4 className="flex items-center gap-2 text-red-500 font-bold mb-2">🚫 تحذير أمني</h4>
                    <p className="text-sm text-cyber-300">أي محاولة لاختراق الموقع أو استخدام أدوات فحص الثغرات بدون إذن كتابي ستؤدي إلى الحظر الفوري للمعرف الرقمي (IP) والحساب، والملاحقة القانونية.</p>
                </div>
                <div className="policy-section">
                    <h3>1. التدابير الأمنية</h3>
                    <p>نحن نطبق أعلى معايير الأمان لحماية بياناتك، بما في ذلك:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li>تشفير البيانات الحساسة (مثل كلمات المرور وأجوبة الأمان) باستخدام خوارزميات AES-256.</li>
                        <li>استخدام بروتوكول HTTPS لتشفير الاتصالات.</li>
                        <li>التحقق الثنائي (2FA) ومراقبة محاولات الدخول المشبوهة.</li>
                        <li>سجل تدقيق (Audit Logs) لجميع العمليات الحساسة.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>2. الإبلاغ عن الثغرات</h3>
                    <p>إذا اكتشفت ثغرة أمنية، يرجى الإبلاغ عنها عبر القنوات الرسمية. نحن نلتزم بمكافأة الباحثين الأخلاقيين وفق سياستنا للإفصاح المسؤول.</p>
                </div>
            </div>
        ),
        ip: (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-cyber-100 mb-4">حقوق الملكية الفكرية</h2>
                <div className="policy-section">
                    <h3>1. ملكية المحتوى</h3>
                    <p>جميع المحتويات الموجودة على أكاديمية الدرع السيبراني (نصوص، صور، فيديوهات، شعارات، أكواد برمجية) هي ملكية حصرية للأكاديمية ومحمية بموجب قوانين حقوق الطبع والنشر والعلامات التجارية.</p>
                </div>
                <div className="policy-section">
                    <h3>2. التراخيص الممنوحة</h3>
                    <p>نمنحك ترخيصاً محدوداً وغير حصري للوصول إلى المحتوى واستخدامه للأغراض التعليمية الشخصية فقط. لا يحق لك:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li>إعادة نشر المحتوى على منصات أخرى.</li>
                        <li>استخدام المحتوى لأغراض تجارية.</li>
                        <li>تعديل المحتوى أو اشتقاق أعمال منه.</li>
                        <li>محاولة الهندسة العكسية (Reverse Engineering) لأي جزء من المنصة أو البرمجيات المستخدمة.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>3. العلامات التجارية</h3>
                    <p>اِسم &quot;Cyber Shield Academy&quot; وشعار الدرع والرسومات المرتبطة به هي علامات تجارية مسجلة. يمنع استخدامها دون إذن صريح.</p>
                </div>
            </div>
        ),
        compliance: (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-cyber-100 mb-4">معايير الامتثال واللوائح</h2>
                <div className="policy-section">
                    <h3>1. الامتثال للوائح المحلية</h3>
                    <p>نلتزم بجميع القوانين واللوائح المعمول بها في المملكة العربية السعودية فيما يتعلق بحماية البيانات والجرائم المعلوماتية.</p>
                </div>
                <div className="policy-section">
                    <h3>2. مدونة السلوك</h3>
                    <p>يتوقع من جميع المستخدمين الالتزام بمدونة سلوك مهنية، تشمل:</p>
                    <ul className="list-disc list-inside space-y-2 text-cyber-300">
                        <li>النزاهة الأكاديمية وعدم الغش في الاختبارات.</li>
                        <li>احترام الآخرين في المنتديات والنقاشات.</li>
                        <li>استخدام المهارات المكتسبة لأغراض دفاعية وأخلاقية فقط.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h3>3. التحديثات والتغييرات</h3>
                    <p>نحتفظ بالحق في تحديث هذه السياسات في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل الموقع.</p>
                </div>
            </div>
        ),
    };

    return (
        <div style={{ paddingTop: "100px", minHeight: '100vh' }}>
            <div className="section-container">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">السياسات <span className="gradient-text">والأحكام</span></h1>
                    <p className="text-cyber-300 max-w-2xl mx-auto">إطار العمل المتكامل لأكاديمية الدرع السيبراني، يوضح حقوقك وواجباتك لضمان بيئة تعليمية آمنة وموثوقة.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-1/4">
                        <div className="glass-card p-4 sticky top-24 space-y-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-accent/10 text-accent border border-accent/30'
                                        : 'text-cyber-400 hover:bg-accent/5 hover:text-cyber-200'
                                        }`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span className="font-bold text-sm">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-3/4">
                        <div className="glass-card p-8 min-h-[500px]">
                            {content[activeTab as keyof typeof content]}
                        </div>

                        <div className="mt-8 p-6 rounded-xl border border-cyber-700 text-center" style={{ background: 'rgba(200,150,46,0.04)' }}>
                            <p className="text-cyber-300 text-sm mb-4">هل لديك استفسارات حول هذه السياسات؟</p>
                            <Link href="/contact" className="btn-secondary px-6 py-2 text-sm">تواصل مع فريق الدعم ✉️</Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .policy-section {
                    background: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(200, 150, 46, 0.1);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .policy-section h3 {
                    color: var(--color-cyber-100);
                    font-weight: bold;
                    margin-bottom: 12px;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .policy-section h3::before {
                    content: '';
                    display: block;
                    width: 4px;
                    height: 1.2rem;
                    background: #c8962e;
                    border-radius: 2px;
                }
                .policy-section p {
                    color: var(--color-cyber-400);
                    font-size: 0.95rem;
                    line-height: 1.7;
                }
                .policy-section ul {
                    margin-top: 12px;
                    padding-right: 20px;
                }
                .policy-section li {
                    margin-bottom: 8px;
                }
            `}</style>
        </div>
    );
}

export default function PoliciesPage() {
    return (
        <Suspense fallback={<div className="text-center py-20">⌛ جاري تحميل السياسات...</div>}>
            <PoliciesContent />
        </Suspense>
    );
}
