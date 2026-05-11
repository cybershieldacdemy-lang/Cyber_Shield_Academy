import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { domains } from "@/data/domains-data";

// Below-the-fold components — lazy loaded (code-split for smaller initial bundle)
const FAQSection = dynamic(() => import("@/components/FAQSection"));
const ScrollReveal = dynamic(() => import("@/components/ScrollReveal"));
const PlatformStats = dynamic(() => import("@/components/PlatformStats"));
const LeaderboardPreview = dynamic(() => import("@/components/LeaderboardPreview"));
const LatestChallenges = dynamic(() => import("@/components/LatestChallenges"));
const ThreatMapPreview = dynamic(() => import("@/components/ThreatMapPreview"));

const featuredCourses = [
  {
    id: 1,
    title: "أساسيات الأمن السيبراني",
    level: "مبتدئ",
    lessons: 24,
    duration: "12 ساعة",
    desc: "تعلم المفاهيم الأساسية للأمن السيبراني وكيفية حماية الأنظمة والشبكات",
    gradient: "linear-gradient(135deg, #e8dcc8, #d4c5a8)",
  },
  {
    id: 2,
    title: "اختبار الاختراق المتقدم",
    level: "متقدم",
    lessons: 35,
    duration: "20 ساعة",
    desc: "تقنيات متقدمة في اختبار الاختراق واكتشاف الثغرات الأمنية",
    gradient: "linear-gradient(135deg, #e0d4be, #cfc0a0)",
  },
  {
    id: 3,
    title: "التحليل الجنائي الرقمي",
    level: "متوسط",
    lessons: 28,
    duration: "15 ساعة",
    desc: "تعلم كيفية تحليل الأدلة الرقمية واستخراج المعلومات المهمة",
    gradient: "linear-gradient(135deg, #e5dbc5, #d9ccaf)",
  },
];

const whyFeatures = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2da5c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "محتوى تعليمي شامل",
    desc: "دروس تفاعلية تغطي جميع جوانب الأمن السيبراني من الأساسيات حتى الاحتراف.",
    color: "#2da5c7",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#805ad5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "مساعد ذكي",
    desc: "احصل على إجابات فورية وتوجيهات مخصصة من مساعد الذكاء الاصطناعي.",
    color: "#805ad5",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38b2ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "تطبيق عملي",
    desc: "تمارين عملية وسيناريوهات واقعية لتطبيق ما تعلمته.",
    color: "#38b2ac",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dd6b20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "تحديات يومية",
    desc: "تحديات جديدة كل يوم لاختبار مهاراتك وكسب نقاط الخبرة.",
    color: "#dd6b20",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d69e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "نظام مكافآت",
    desc: "اجمع XP وارتقِ في المستويات واحصل على شارات مميزة.",
    color: "#d69e2e",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "مجتمع نشط",
    desc: "تواصل مع متعلمين آخرين وشارك خبراتك وإنجازاتك.",
    color: "#e53e3e",
  },
];

const features = [
  { icon: "📖", title: "قاموس المصطلحات", desc: "أكثر من 1,300 مصطلح سيبراني مع التعريف بالعربية والإنجليزية", color: "#38b2ac" },
  { icon: "🗺️", title: "مسارات تعلم", desc: "مسارات منظمة من المبتدئ إلى المحترف مع خطط دراسية", color: "#2da5c7" },
  { icon: "🔬", title: "12 تخصص أمني", desc: "شرح شامل لجميع تخصصات الأمن السيبراني", color: "#805ad5" },
  { icon: "📰", title: "أخبار الثغرات", desc: "آخر أخبار الثغرات والهجمات السيبرانية العالمية", color: "#e53e3e" },
  { icon: "🎯", title: "دورات تدريبية", desc: "دورات متخصصة مع شهادات إتمام معتمدة", color: "#d69e2e" },
  { icon: "🔧", title: "أدوات الأمن", desc: "دليل شامل لأهم أدوات الأمن السيبراني", color: "#38b2ac" },
];

const learningSteps = [
  { step: "01", title: "سجّل مجاناً", desc: "أنشئ حسابك واختر مسارك التعليمي المناسب", icon: "📝", color: "#c8962e" },
  { step: "02", title: "تعلّم النظريات", desc: "ادرس المفاهيم الأساسية عبر دروس تفاعلية", icon: "📚", color: "#2da5c7" },
  { step: "03", title: "طبّق عملياً", desc: "مارس المهارات في مختبرات آمنة وتحديات CTF", icon: "⚔️", color: "#805ad5" },
  { step: "04", title: "احصل على شهادة", desc: "أكمل المسار واحصل على شهادة معتمدة", icon: "🏆", color: "#38b2ac" },
];

export default function Home() {
  const getBadgeClass = (level: string) =>
    level === "مبتدئ" ? "badge-beginner" : level === "متوسط" ? "badge-intermediate" : "badge-advanced";

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 py-12 lg:py-20">
            {/* Right Side - Text Content */}
            <div className="flex-1 text-right order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                background: 'rgba(200, 150, 46, 0.1)',
                border: '1px solid rgba(200, 150, 46, 0.2)',
              }}>
                <span style={{ color: '#c8962e', fontSize: '0.85rem', fontWeight: 600 }}>✦ تعلم الأمن السيبراني بطريقة عملية</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight" style={{ lineHeight: 1.2 }}>
                <span style={{ color: '#c8962e' }}>أكاديمية الدرع</span>
                <br />
                <span style={{ color: '#c8962e' }}>السيبراني</span>
              </h1>

              <p className="text-lg mb-8 leading-relaxed max-w-xl" style={{ color: '#5c5549' }}>
                منصة تعليمية شاملة تضم دورات احترافية، مختبرات عملية، أدوات تفاعلية، ومجتمع متخصص. ابدأ رحلتك في عالم الأمن السيبراني الآن.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{
                  background: 'linear-gradient(135deg, #c8962e, #b0831f)',
                }}>
                  🚀 ابدأ التعلم مجاناً
                </Link>
                <Link href="/paths" className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300" style={{
                  color: '#3d3730',
                  border: '1px solid #d4cbb8',
                }}>
                  🗺️ استعرض المسارات
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#38b2ac' }} />
                  <span className="text-sm font-medium" style={{ color: '#5c5549' }}>+10,000 طالب نشط</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#c8962e' }} />
                  <span className="text-sm font-medium" style={{ color: '#5c5549' }}>+50 مختبر عملي</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#805ad5' }} />
                  <span className="text-sm font-medium" style={{ color: '#5c5549' }}>14 مسار تعليمي</span>
                </div>
              </div>
            </div>

            {/* Left Side - Illustration */}
            <div className="flex-1 relative order-2 lg:order-1">
              <div className="relative">
                {/* Main Illustration Area */}
                <div className="relative rounded-3xl overflow-hidden" style={{
                  maxWidth: '500px',
                  margin: '0 auto',
                }}>
                  <Image
                    src="/images/hero-illustration.png"
                    alt="CyberLearn - أكاديمية الدرع السيبراني"
                    width={500}
                    height={500}
                    className="w-full h-auto rounded-3xl"
                    priority
                  />
                </div>

                {/* Floating Card - XP Achievement */}
                <div className="absolute top-8 -left-4 lg:-left-8 animate-float rounded-xl px-4 py-3 flex items-center gap-3" style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(200, 150, 46, 0.1)',
                  animationDelay: '0.5s',
                }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(200, 150, 46, 0.1)' }}>
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#7a7164' }}>تم إنجاز التحدي</div>
                    <div className="text-sm font-bold" style={{ color: '#c8962e' }}>+XP 500</div>
                  </div>
                </div>

                {/* Floating Card - New Concept */}
                <div className="absolute bottom-12 -right-4 lg:-right-8 animate-float rounded-xl px-4 py-3 flex items-center gap-3" style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(56, 178, 172, 0.15)',
                  animationDelay: '1.5s',
                }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(56, 178, 172, 0.1)' }}>
                    🔐
                  </div>
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#7a7164' }}>مفهوم جديد</div>
                    <div className="text-sm font-bold" style={{ color: '#38b2ac' }}>التشفير</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NEW: Platform Stats Bar ═══ */}
      <PlatformStats />

      {/* ═══ NEW: Platform Introduction Section ═══ */}
      <section className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-divider" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              لماذا تحتاج <span className="gradient-text">الأمن السيبراني</span>؟
            </h2>
            <p style={{ color: '#5c5549' }} className="max-w-3xl mx-auto text-lg leading-relaxed">
              في عالم يزداد اتصالاً يوماً بعد يوم، تتزايد التهديدات السيبرانية بشكل غير مسبوق. من سرقة البيانات إلى هجمات الفدية، أصبح الأمن السيبراني ضرورة حتمية وليس خياراً. تعلّم كيف تحمي نفسك ومؤسستك وابدأ مسيرتك المهنية في أسرع القطاعات نمواً في العالم.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass-card p-8">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#1a1612' }}>لماذا الأمن السيبراني مهم؟</h3>
            <ul className="space-y-3">
              {[
                "3.5 مليون وظيفة شاغرة عالمياً في مجال الأمن السيبراني",
                "تكلفة الجرائم السيبرانية تتجاوز 10 تريليون دولار سنوياً",
                "زيادة 300% في هجمات الفدية خلال السنوات الأخيرة",
                "95% من الاختراقات بسبب أخطاء بشرية يمكن تجنبها",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#5c5549' }}>
                  <span style={{ color: '#c8962e', fontWeight: 700 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#1a1612' }}>كيف تبدأ التعلم؟</h3>
            <div className="space-y-4">
              {learningSteps.map((step) => (
                <div key={step.step} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}25`,
                  }}>
                    {step.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#3d3730' }}>{step.title}</div>
                    <div className="text-xs" style={{ color: '#7a7164' }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-divider" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              الدورات <span className="gradient-text">المميزة</span>
            </h2>
            <p style={{ color: '#5c5549' }} className="max-w-2xl mx-auto">
              ابدأ رحلتك مع أفضل دوراتنا التي تم إعدادها بعناية من قبل خبراء محترفين
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <div key={course.id} className="glass-card overflow-hidden group flex flex-col">
              {/* Course Thumbnail */}
              <div
                className="relative h-48 flex items-center justify-center"
                style={{ background: course.gradient }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{
                  background: 'rgba(200, 150, 46, 0.15)',
                  border: '2px solid rgba(200, 150, 46, 0.25)',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" style={{ color: '#c8962e' }}>
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#7a7164' }}>
                    <span>⏱️ {course.duration}</span>
                  </div>
                  <span className={`badge ${getBadgeClass(course.level)}`}>{course.level}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 transition-colors" style={{ color: '#1a1612' }}>{course.title}</h3>
                <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: '#5c5549' }}>{course.desc}</p>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #ece4d4' }}>
                  <span className="text-xs" style={{ color: '#7a7164' }}>📖 {course.lessons} درس</span>
                  <Link href="/courses" className="text-sm hover:underline font-semibold" style={{ color: '#c8962e' }}>
                    ابدأ الآن
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/courses" className="btn-secondary">
            عرض جميع الدورات ←
          </Link>
        </div>
      </section>

      {/* ═══ NEW: Challenges + Leaderboard + Threat Map ═══ */}
      <section className="section-container" style={{ background: 'rgba(200, 150, 46, 0.02)' }}>
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-divider" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              اختبر مهاراتك <span className="gradient-text">وتنافس</span>
            </h2>
            <p style={{ color: '#5c5549' }} className="max-w-2xl mx-auto">
              حل التحديات، تسلّق لوحة المتصدرين، وراقب الهجمات السيبرانية الحية
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LatestChallenges />
          <LeaderboardPreview />
          <ThreatMapPreview />
        </div>
      </section>

      {/* Why CyberShield Academy Section */}
      <section className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-divider" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              لماذا <span className="gradient-text">CyberShield Academy</span>؟
            </h2>
            <p style={{ color: '#5c5549' }} className="max-w-2xl mx-auto">
              نقدم لك كل ما تحتاجه لتصبح خبيراً في الأمن السيبراني من خلال تجربة تعليمية فريدة
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyFeatures.map((feature, i) => (
            <div key={i} className="glass-card p-7 group text-center" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform group-hover:scale-110" style={{
                background: `${feature.color}15`,
                border: `1px solid ${feature.color}30`,
              }}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1612' }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5c5549' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="section-container" style={{ background: 'rgba(200, 150, 46, 0.02)' }}>
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-divider" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ماذا <span className="gradient-text">نقدم لك؟</span>
            </h2>
            <p style={{ color: '#5c5549' }} className="max-w-2xl mx-auto">منصة شاملة تغطي جميع جوانب الأمن السيبراني بمحتوى عربي احترافي</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-7 group" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110" style={{
                background: `${f.color}15`,
                border: `1px solid ${f.color}30`,
              }}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1612' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5c5549' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domains Preview */}
      <section className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-divider" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              تخصصات <span className="gradient-text">الأمن السيبراني</span>
            </h2>
            <p style={{ color: '#5c5549' }} className="max-w-2xl mx-auto">12 تخصصاً يغطي جميع مجالات الحماية الرقمية</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {domains.map((domain) => (
            <Link key={domain.id} href={`/domains/${domain.slug}`} className="glass-card p-6 group block">
              <div className="text-3xl mb-3">{domain.icon}</div>
              <h3 className="font-bold mb-1 group-hover:text-amber-700 transition-colors" style={{ color: '#1a1612' }}>{domain.nameAr}</h3>
              <p className="text-xs font-mono mb-2" style={{ color: '#a89f8e' }} dir="ltr">{domain.nameEn}</p>
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#5c5549' }}>{domain.descriptionAr}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/domains" className="btn-secondary">
            استكشف جميع التخصصات ←
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="section-container text-center">
        <div className="glass-card p-12 md:p-16 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              مستعد لبدء رحلتك في <span className="gradient-text">الأمن السيبراني</span>؟
            </h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto" style={{ color: '#5c5549' }}>
              انضم إلى آلاف المتعلمين وابدأ مسيرتك في حماية الفضاء الرقمي
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-10 py-4">
                🎓 سجل مجاناً الآن
              </Link>
              <Link href="/about" className="btn-secondary text-lg px-10 py-4">
                تعرف علينا أكثر
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
