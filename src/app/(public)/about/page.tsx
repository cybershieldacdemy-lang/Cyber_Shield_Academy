import Link from "next/link";

const ciaTriad = [
    { letter: "C", nameEn: "Confidentiality", nameAr: "السرية", desc: "ضمان أن المعلومات متاحة فقط للأشخاص المصرح لهم بالوصول إليها", color: "#2c7a7b", icon: "🔐" },
    { letter: "I", nameEn: "Integrity", nameAr: "السلامة", desc: "ضمان دقة واكتمال المعلومات وعدم التلاعب بها من قبل أطراف غير مصرح لها", color: "#2b6cb0", icon: "✅" },
    { letter: "A", nameEn: "Availability", nameAr: "التوافر", desc: "ضمان إمكانية الوصول إلى المعلومات والأنظمة عند الحاجة إليها", color: "#6b46c1", icon: "🌐" },
];

const threats = [
    { icon: "🎣", name: "التصيد الاحتيالي", nameEn: "Phishing", desc: "رسائل خادعة لسرقة البيانات الشخصية" },
    { icon: "🦠", name: "البرمجيات الخبيثة", nameEn: "Malware", desc: "برامج مصممة لإلحاق الضرر بالأنظمة" },
    { icon: "💰", name: "برامج الفدية", nameEn: "Ransomware", desc: "تشفير البيانات وطلب فدية لفك التشفير" },
    { icon: "👤", name: "الهندسة الاجتماعية", nameEn: "Social Engineering", desc: "خداع الأشخاص للحصول على معلومات حساسة" },
    { icon: "🌊", name: "هجوم حجب الخدمة", nameEn: "DDoS", desc: "إغراق الخوادم بطلبات لتعطيل الخدمة" },
    { icon: "💉", name: "حقن SQL", nameEn: "SQL Injection", desc: "إدخال أوامر خبيثة لاختراق قواعد البيانات" },
];

const timeline = [
    { year: "1970s", event: "ظهور أول فيروسات الحاسوب التجريبية" },
    { year: "1988", event: "دودة موريس — أول هجوم واسع النطاق على الإنترنت" },
    { year: "2000s", event: "انتشار الاختراقات وظهور مفهوم الأمن السيبراني المؤسسي" },
    { year: "2010s", event: "هجمات متقدمة (APT) وظهور برامج الفدية العالمية" },
    { year: "2020s", event: "الذكاء الاصطناعي في الهجمات والدفاع — عصر جديد من التهديدات" },
];

export default function AboutPage() {
    return (
        <div style={{ paddingTop: '80px' }}>
            {/* Header */}
            <div className="page-header">
                <div className="text-5xl mb-4">🔐</div>
                <h1><span className="gradient-text">ما هو الأمن السيبراني؟</span></h1>
                <p>الأمن السيبراني هو ممارسة حماية الأنظمة والشبكات والبرامج والبيانات من الهجمات الرقمية والوصول غير المصرح به</p>
            </div>

            {/* Definition */}
            <section className="section-container">
                <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4 gradient-text">التعريف الشامل</h2>
                    <p className="text-cyber-300 leading-loose text-lg mb-4">
                        الأمن السيبراني (Cybersecurity) هو مجموعة من التقنيات والممارسات والعمليات المصممة لحماية الشبكات والأجهزة والبرامج والبيانات من الهجوم أو التلف أو الوصول غير المصرح به. يُعرف أيضاً بأمن تكنولوجيا المعلومات (IT Security).
                    </p>
                    <p className="text-cyber-400 leading-loose" dir="ltr">
                        Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information, extorting money from users, or interrupting normal business processes.
                    </p>
                </div>
            </section>

            {/* CIA Triad */}
            <section className="section-container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">مثلث <span className="gradient-text">CIA</span></h2>
                    <p className="text-cyber-400">الركائز الثلاث الأساسية لأمن المعلومات</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {ciaTriad.map((item) => (
                        <div key={item.letter} className="glass-card p-8 text-center group">
                            <div className="text-5xl mb-4">{item.icon}</div>
                            <div className="text-4xl font-black mb-2" style={{ color: item.color }}>{item.letter}</div>
                            <h3 className="text-xl font-bold text-cyber-100 mb-1">{item.nameAr}</h3>
                            <p className="text-sm text-cyber-500 font-mono mb-3" dir="ltr">{item.nameEn}</p>
                            <p className="text-cyber-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Important */}
            <section className="section-container" style={{ background: 'linear-gradient(180deg, transparent, rgba(200,150,46,0.03), transparent)' }}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">لماذا <span className="gradient-text">الأمن السيبراني مهم؟</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {[
                        { icon: "💳", title: "حماية البيانات المالية", desc: "حماية المعاملات المصرفية والبطاقات الائتمانية من السرقة" },
                        { icon: "🏥", title: "حماية القطاعات الحيوية", desc: "تأمين المستشفيات والبنية التحتية والمرافق الحكومية" },
                        { icon: "👤", title: "حماية الخصوصية", desc: "منع تسريب البيانات الشخصية والمعلومات الحساسة" },
                        { icon: "🏢", title: "استمرارية الأعمال", desc: "ضمان عدم توقف الخدمات بسبب الهجمات السيبرانية" },
                    ].map((item, i) => (
                        <div key={i} className="glass-card p-6 flex gap-4">
                            <div className="text-3xl">{item.icon}</div>
                            <div>
                                <h3 className="font-bold text-cyber-100 mb-1">{item.title}</h3>
                                <p className="text-cyber-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Common Threats */}
            <section className="section-container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">أبرز <span className="gradient-text">التهديدات السيبرانية</span></h2>
                    <p className="text-cyber-400">تعرف على أخطر التهديدات التي تواجه الأفراد والمؤسسات</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                    {threats.map((t, i) => (
                        <div key={i} className="glass-card p-6 group">
                            <div className="text-3xl mb-3">{t.icon}</div>
                            <h3 className="font-bold text-cyber-100 mb-1">{t.name}</h3>
                            <p className="text-xs text-cyber-500 font-mono mb-2" dir="ltr">{t.nameEn}</p>
                            <p className="text-cyber-400 text-sm">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="section-container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">تاريخ <span className="gradient-text">الأمن السيبراني</span></h2>
                </div>
                <div className="max-w-3xl mx-auto space-y-6">
                    {timeline.map((t, i) => (
                        <div key={i} className="flex gap-6 items-start">
                            <div className="text-xl font-black neon-text whitespace-nowrap min-w-[80px]" dir="ltr">{t.year}</div>
                            <div className="glass-card p-4 flex-1">
                                <p className="text-cyber-300 text-sm">{t.event}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="section-container text-center">
                <div className="glass-card p-10">
                    <h2 className="text-2xl font-bold mb-4">ابدأ رحلتك في تعلم <span className="gradient-text">الأمن السيبراني</span></h2>
                    <p className="text-cyber-400 mb-6">اكتشف التخصصات المختلفة واختر المسار الأنسب لك</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/domains" className="btn-primary">استكشف التخصصات</Link>
                        <Link href="/paths" className="btn-secondary">مسارات التعلم</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
