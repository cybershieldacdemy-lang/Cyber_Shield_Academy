"use client";
import Link from "next/link";

const footerLinks = [
    {
        title: "التعلم",
        links: [
            { href: "/courses", label: "الدورات التدريبية" },
            { href: "/labs", label: "المختبرات العملية" },
            { href: "/paths", label: "مسارات التعلم" },
            { href: "/terms", label: "المصطلحات السيبرانية" },
            { href: "/tools", label: "الأدوات" },
        ],
    },
    {
        title: "الأقسام",
        links: [
            { href: "/domains", label: "تخصصات الأمن" },
            { href: "/achievements", label: "الإنجازات والشارات" },
            { href: "/pricing", label: "خطط الأسعار" },
            { href: "/blog", label: "المقالات" },
            { href: "/news", label: "أخبار الثغرات" },
        ],
    },
    {
        title: "الأكاديمية",
        links: [
            { href: "/about", label: "عن الأمن السيبراني" },
            { href: "/contact", label: "تواصل معنا" },
            { href: "/login", label: "تسجيل الدخول" },
            { href: "/register", label: "إنشاء حساب" },
            { href: "/policies", label: "سياسة الخصوصية" },
        ],
    },
];

const socialLinks = [
    { name: "𝕏", href: "#", label: "تويتر" },
    { name: "GH", href: "#", label: "جيتهب" },
    { name: "YT", href: "#", label: "يوتيوب" },
    { name: "LI", href: "#", label: "لينكدإن" },
];

export default function Footer() {
    return (
        <footer className="relative overflow-hidden" style={{
            background: 'linear-gradient(180deg, #f0e9db, #ebe3d3)',
            borderTop: '1px solid #d4cbb8',
        }}>
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(rgba(200, 150, 46, 0.06) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }} />

            {/* Newsletter Section */}
            <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">
                <div className="rounded-2xl p-8 md:p-10 mb-14 text-center" style={{
                    background: 'linear-gradient(135deg, rgba(200,150,46,0.06), rgba(200,150,46,0.02))',
                    border: '1px solid rgba(200, 150, 46, 0.12)',
                }}>
                    <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#1a1612' }}>
                        ابقَ على اطلاع بآخر <span style={{ color: '#c8962e' }}>التحديثات</span>
                    </h3>
                    <p className="text-sm mb-6" style={{ color: '#7a7164' }}>
                        احصل على أحدث الأخبار والدورات والنصائح الأمنية مباشرة في بريدك
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="أدخل بريدك الإلكتروني"
                            dir="ltr"
                            className="flex-1 px-5 py-3 rounded-xl text-sm outline-none transition-all duration-300"
                            style={{
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(200, 150, 46, 0.15)',
                                color: '#1a1612',
                            }}
                        />
                        <button className="btn-primary px-6 py-3 text-sm whitespace-nowrap">
                            📬 اشترك الآن
                        </button>
                    </div>
                </div>

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{
                                background: 'linear-gradient(135deg, #c8962e, #e8c068)',
                                boxShadow: '0 2px 8px rgba(200, 150, 46, 0.3)',
                            }}>
                                🛡️
                            </div>
                            <div>
                                <span className="text-base font-bold block leading-tight" style={{ color: '#c8962e' }}>CyberShield</span>
                                <span className="text-xs font-medium" style={{ color: '#a89f8e' }}>Academy</span>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-6" style={{ color: '#7a7164' }}>
                            منصة تعليمية عربية متخصصة في الأمن السيبراني، نهدف إلى بناء جيل واعٍ أمنياً وقادر على حماية الفضاء الرقمي.
                        </p>
                        <div className="flex gap-2.5">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.name}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300"
                                    style={{
                                        color: '#7a7164',
                                        background: 'rgba(255,255,255,0.5)',
                                        border: '1px solid rgba(200,150,46,0.1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #c8962e, #e8c068)';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.borderColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                                        e.currentTarget.style.color = '#7a7164';
                                        e.currentTarget.style.borderColor = 'rgba(200,150,46,0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {s.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: '#1a1612' }}>
                                <span className="w-4 h-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #c8962e, #e8c068)' }} />
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm transition-all duration-300 inline-flex items-center gap-1.5"
                                            style={{ color: '#7a7164' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#c8962e';
                                                e.currentTarget.style.transform = 'translateX(-4px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#7a7164';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-6" style={{
                    borderTop: '1px solid rgba(200, 150, 46, 0.12)',
                }}>
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <p className="text-sm font-medium" style={{ color: '#a89f8e' }}>
                            © {new Date().getFullYear()} أكاديمية الدرع السيبراني. جميع الحقوق محفوظة.
                        </p>
                        <div className="flex gap-6 mt-2">
                            <Link href="/policies" className="text-sm transition-colors duration-300 hover:text-accent" style={{ color: '#a89f8e' }}>سياسة الخصوصية</Link>
                            <Link href="/policies" className="text-sm transition-colors duration-300 hover:text-accent" style={{ color: '#a89f8e' }}>الشروط والأحكام</Link>
                        </div>
                    </div>

                    {/* Contact Buttons moved here */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium" style={{ color: '#7a7164' }}>تواصل معنا مباشرة:</span>
                        <div className="flex gap-3">
                            <a
                                href="https://wa.me/967778999706"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="تواصل عبر واتساب"
                                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                style={{
                                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                                    boxShadow: '0 4px 15px rgba(37,211,102,0.3)',
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </a>
                            <a
                                href="mailto:cybershieldacademy@gmail.com"
                                title="أرسل بريد إلكتروني"
                                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                style={{
                                    background: 'linear-gradient(135deg, #c8962e, #e8c068)',
                                    boxShadow: '0 4px 15px rgba(200,150,46,0.3)',
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
