"use client";
import { useState } from "react";
import Link from "next/link";
import { cybersecurityModules } from "@/data/modules-data";
import { SmartDataView } from "@/components/ui/SmartDataView";

// ═══════════════════════════════════════════════════════
// DATA: Learning Paths (TryHackMe-inspired cards)
// ═══════════════════════════════════════════════════════
const learningPaths = [
    // ═══ سهل (Easy) ═══
    {
        id: "pre-security",
        title: "الأمن المسبق",
        titleEn: "Pre-Security",
        desc: "خطواتك الأولى في عالم الأمن السيبراني. تعرّف على كيفية عمل التكنولوجيا ثم فكّر كالمهاجمين والمدافعين.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 5,
        hours: 40,
        icon: "🔰",
        gradient: "linear-gradient(135deg, #2c7a7b, #38b2ac)",
        isNew: true,
        enrolled: 15,
    },
    {
        id: "cyber-fundamentals",
        title: "أساسيات الأمن السيبراني",
        titleEn: "Cyber Security Fundamentals",
        desc: "تعلم كل ما تحتاجه للشروع في مسار وظيفي في مجال الأمن السيبراني الهجومي أو الدفاعي.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 8,
        hours: 64,
        icon: "🛡️",
        gradient: "linear-gradient(135deg, #2da5c7, #38b2ac)",
    },
    {
        id: "soc-level-1",
        title: "المستوى الأول من SOC",
        titleEn: "SOC Level 1",
        desc: "تعلم المهارات اللازمة لبدء مسيرتك المهنية كمحلل من المستوى الأول في مركز عمليات الأمن السيبراني أو محلل أمني.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 9,
        hours: 72,
        icon: "🛡️",
        gradient: "linear-gradient(135deg, #2b6cb0, #4299e1)",
    },
    {
        id: "security-engineer",
        title: "مهندس أمن",
        titleEn: "Security Engineer",
        desc: "تعلم المهارات اللازمة لبدء مسيرتك المهنية في مجال هندسة الأمن.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 6,
        hours: 33,
        icon: "⚙️",
        gradient: "linear-gradient(135deg, #805ad5, #6b46c1)",
    },
    {
        id: "comptia-pentest",
        title: "شهادة اختبار الاختراق CompTIA+",
        titleEn: "CompTIA Pentest+",
        desc: "تعلم المهارات العملية واستعد لاجتياز اختبار Pentest+ بنجاح.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 5,
        hours: 28,
        icon: "📜",
        gradient: "linear-gradient(135deg, #38b2ac, #2c7a7b)",
        image: "/images/paths/comptia-pentest.png",
    },
    {
        id: "web-fundamentals",
        title: "أساسيات الويب",
        titleEn: "Web Fundamentals",
        desc: "مسار نحو تأمين تطبيقات الويب.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 5,
        hours: 30,
        icon: "🌐",
        gradient: "linear-gradient(135deg, #a89f8e, #7a7164)",
        image: "/images/paths/web-fundamentals.png",
    },
    {
        id: "intro-to-cyber-security",
        title: "مقدمة في الأمن السيبراني",
        titleEn: "Introduction to Cyber Security",
        desc: "يعتبر هذا المسار نقطة البداية المثالية في عالم الأمن السيبراني. ستتعرف على المفاهيم الأساسية والأدوات لجميع مستويات المهارة.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 14,
        hours: 48,
        icon: "🌐",
        gradient: "linear-gradient(135deg, #3db28c, #2b6cb0)",
        isNew: true,
    },
    {
        id: "pre-security-legacy",
        title: "الأمن المسبق (النسخة الكلاسيكية)",
        titleEn: "Pre-Security (Legacy)",
        desc: "يعكس مسار الأمن المسبق الأصلي أساسيات الأمن السيبراني، والشبكات، وتقنيات الويب، والتعمق في أساسيات لينكس وويندوز.",
        difficulty: "سهل",
        diffColor: "#38b2ac",
        modules: 5,
        hours: 32,
        icon: "🏛️",
        gradient: "linear-gradient(135deg, #4a5568, #2d3748)",
        image: "/images/paths/pre-security-legacy.png",
    },
    // ═══ متوسط (Intermediate) ═══
    {
        id: "jr-penetration-tester",
        title: "فاحص اختراق مبتدئ",
        titleEn: "Junior Penetration Tester",
        desc: "تعلم المهارات اللازمة لبدء مسيرة مهنية كمختبر اختراقي.",
        difficulty: "متوسط",
        diffColor: "#d69e2e",
        modules: 8,
        hours: 56,
        icon: "🎯",
        gradient: "linear-gradient(135deg, #d69e2e, #dd6b20)",
    },
    {
        id: "soc-level-2",
        title: "المستوى الثاني من SOC",
        titleEn: "SOC Level 2",
        desc: "تعلم جميع المهارات اللازمة للانتقال إلى المستوى التالي في مسيرتك المهنية كمحلل في مركز عمليات الأمن السيبراني.",
        difficulty: "متوسط",
        diffColor: "#d69e2e",
        modules: 8,
        hours: 48,
        icon: "🔵",
        gradient: "linear-gradient(135deg, #2b6cb0, #3182ce)",
    },
    {
        id: "devsecops",
        title: "ديف سيك أوبس",
        titleEn: "DevSecOps",
        desc: "اكسب تخصصك في مجال DevSecOps أو أمن المنتجات. وسّع فهمك لأمن المنتجات.",
        difficulty: "متوسط",
        diffColor: "#d69e2e",
        modules: 5,
        hours: 40,
        icon: "🔄",
        gradient: "linear-gradient(135deg, #dd6b20, #e53e3e)",
    },
    {
        id: "offensive-pentesting",
        title: "اختبار الاختراق الهجومي",
        titleEn: "Offensive Pentesting",
        desc: "استعد لاختبارات الاختراق في العالم الحقيقي.",
        difficulty: "متوسط",
        diffColor: "#d69e2e",
        modules: 5,
        hours: 27,
        icon: "⚔️",
        gradient: "linear-gradient(135deg, #e53e3e, #c53030)",
        image: "/images/paths/offensive-pentesting.png",
    },
    {
        id: "aws-security",
        title: "الهجوم والدفاع عن AWS",
        titleEn: "AWS Attack & Defense",
        desc: "تدرّب على كيفية اختراق المهاجمين لبيئات AWS.",
        difficulty: "متوسط",
        diffColor: "#d69e2e",
        modules: 5,
        hours: 17,
        icon: "☁️",
        gradient: "linear-gradient(135deg, #dd6b20, #d69e2e)",
        isNew: true,
        image: "/images/paths/aws-security.png",
    },
    {
        id: "web-application-pentesting",
        title: "اختبار اختراق تطبيقات الويب",
        titleEn: "Web Application Pentesting",
        desc: "تعلم حول الثغرات الأمنية المختلفة التي يمكن أن توجد في تطبيقات الويب وكيفية إجراء تقييمات أمنية لتطبيقات الويب.",
        difficulty: "متوسط",
        diffColor: "#d69e2e",
        modules: 5,
        hours: 45,
        icon: "🕷️",
        gradient: "linear-gradient(135deg, #e53e3e, #805ad5)",
        isNew: true,
        image: "/images/paths/web-application-pentesting.png",
    },
    {
        id: "defending-azure",
        title: "الدفاع عن Azure",
        titleEn: "Defending Azure",
        desc: "اكتسب خبرة عملية بأدوات الأمان السحابية الخاصة بـ Azure وتعلم كيفية حمايتها.",
        difficulty: "متوسط",
        diffColor: "#d69e2e",
        modules: 4,
        hours: 35,
        icon: "☁️",
        gradient: "linear-gradient(135deg, #3182ce, #2b6cb0)",
        isNew: true,
        image: "/images/paths/defending-azure.png",
    },
    // ═══ صعب (Advanced) ═══
    {
        id: "red-team",
        title: "فريق الهجوم الأحمر",
        titleEn: "Red Team",
        desc: "تعلم المهارات اللازمة لتصبح عضواً في فريق الهجوم الأحمر.",
        difficulty: "صعب",
        diffColor: "#e53e3e",
        modules: 6,
        hours: 36,
        icon: "🔴",
        gradient: "linear-gradient(135deg, #c53030, #e53e3e)",
    },
    {
        id: "advanced-endpoint-investigations",
        title: "التحقيقات المتقدمة في نقاط النهاية",
        titleEn: "Advanced Endpoint Investigations",
        desc: "التهديدات الحديثة لا تتوقف عند السجلات ولا ينبغي لك ذلك. يجهز هذا المسار المحللين للتحقيق عبر نقاط النهاية في العالم الحقيقي.",
        difficulty: "صعب",
        diffColor: "#e53e3e",
        modules: 8,
        hours: 60,
        icon: "🛡️",
        gradient: "linear-gradient(135deg, #2b6cb0, #2c7a7b)",
        isNew: true,
        image: "/images/paths/advanced-endpoint-investigations.png",
    },
];

// ═══════════════════════════════════════════════════════
// DATA: Roadmap Steps (Vertical Flowchart)
// ═══════════════════════════════════════════════════════
const roadmapSteps = [
    {
        id: 1,
        title: "أساسيات علوم الحاسوب",
        desc: "اكتسب المهارات الأساسية في علوم الحاسوب اللازمة للبدث في مجال الأمن السيبراني.",
        type: "foundation",
        courses: [
            { title: "الأمن المسبق", difficulty: "سهل", diffColor: "#38b2ac", type: "طريق" },
        ],
    },
    {
        id: 2,
        title: "أسس الأمن السيبراني",
        desc: "تطوير مهارات الأمن السيبراني اللازمة لدخول أي مهنة في هذا المجال.",
        type: "core",
        courses: [
            { title: "أساسيات الأمن السيبراني", difficulty: "سهل", diffColor: "#38b2ac", type: "طريق" },
            { title: "الأمن السيبراني 101 (SEC1)", difficulty: "", diffColor: "#c8962e", type: "الشهادة المهنية" },
        ],
    },
    {
        id: 3,
        title: "المهارات المهنية في مجال الأمن السيبراني",
        desc: "أتقن المهارات اللازمة لمسارك المهني الذي ترغب فيه. هل أنت محتار بشأن المسار الوظيفي الأنسب لك؟",
        type: "specialization",
    },
];

// ═══════════════════════════════════════════════════════
// DATA: Career Tracks (3 columns)
// ═══════════════════════════════════════════════════════
const careerTracks = [
    {
        title: "محلل أمني",
        titleEn: "Security Analyst",
        desc: "تابع، حلّل أمن إبطالي بسرعة لتصبح",
        icon: "🛡️",
        color: "#2b6cb0",
        items: [
            { title: "المستوى الأول من SOC", difficulty: "سهل", diffColor: "#38b2ac", type: "طريق" },
            { title: "محلل أمن من المستوى الأول (SAL1)", difficulty: "", diffColor: "#c8962e", type: "الشهادة المهنية" },
            { title: "المستوى الثاني من SOC", difficulty: "متوسط", diffColor: "#d69e2e", type: "طريق" },
            { title: "محلل أمن من المستوى الثاني (SAL2)", difficulty: "", diffColor: "#c8962e", type: "الشهادة المهنية" },
            { title: "التحقيقات المتقدمة في نقاط النهاية", difficulty: "صعب", diffColor: "#e53e3e", type: "طريق" },
        ],
    },
    {
        title: "جهاز اختبار الاختراق",
        titleEn: "Penetration Tester",
        desc: "اختبر وأبني بمفوضك واشقي طريقك نحو النجاح كمختبر",
        icon: "🎯",
        color: "#e53e3e",
        items: [
            { title: "فاحص اختراق مبتدئ", difficulty: "متوسط", diffColor: "#d69e2e", type: "طريق" },
            { title: "فاحص اختراق مبتدئ (PT1)", difficulty: "", diffColor: "#c8962e", type: "الشهادة المهنية" },
            { title: "أساسيات الويب", difficulty: "سهل", diffColor: "#38b2ac", type: "طريق" },
            { title: "اختبار اختراق تطبيقات الويب", difficulty: "متوسط", diffColor: "#d69e2e", type: "طريق" },
            { title: "فريق الهجوم الأحمر", difficulty: "صعب", diffColor: "#e53e3e", type: "طريق" },
        ],
    },
    {
        title: "مهندس أمن",
        titleEn: "Security Engineer",
        desc: "تلقن المفاهيم، مهندس أمن إبطالي في رحلتك لتصبح",
        icon: "⚙️",
        color: "#805ad5",
        items: [
            { title: "مهندس أمن", difficulty: "سهل", diffColor: "#38b2ac", type: "طريق" },
            { title: "ديف سايب أوبس", difficulty: "متوسط", diffColor: "#d69e2e", type: "طريق" },
            { title: "الهجوم والدفاع عن AWS", difficulty: "متوسط", diffColor: "#d69e2e", type: "طريق" },
            { title: "الدفاع عن Azure", difficulty: "متوسط", diffColor: "#d69e2e", type: "طريق" },
        ],
    },
];

// ═══════════════════════════════════════════════════════
// Existing Level-Based Paths & Professional Tracks data
// ═══════════════════════════════════════════════════════
const levelPaths = [
    {
        level: "سهل", levelEn: "Easy", color: "#38b2ac", icon: "🔰", duration: "3-6 أشهر",
        desc: "تعلم أساسيات الأمن السيبراني والمفاهيم الأساسية",
        skills: ["فهم الشبكات", "أساسيات أنظمة التشغيل", "مبادئ أمن المعلومات", "أساسيات التشفير", "التوعية الأمنية"],
        tools: ["Wireshark", "VirtualBox", "Linux CLI", "Nmap"],
        certs: ["CompTIA Security+", "CompTIA Network+", "CC (ISC²)"],
        roadmap: ["فهم أساسيات الشبكات TCP/IP", "تعلم أنظمة التشغيل Linux و Windows", "دراسة مبادئ CIA Triad", "التعرف على أنواع التهديدات", "ممارسة أدوات أساسية"],
    },
    {
        level: "متوسط", levelEn: "Intermediate", color: "#d69e2e", icon: "🔧", duration: "6-12 شهر",
        desc: "تعمق في التخصصات المختلفة واكتسب مهارات عملية",
        skills: ["إدارة الجدران النارية", "تحليل السجلات", "فحص الثغرات", "الاستجابة للحوادث", "أمن السحابة"],
        tools: ["Burp Suite", "Metasploit", "Splunk", "Nessus", "OWASP ZAP"],
        certs: ["CEH", "CySA+", "SSCP", "AWS Security Specialty"],
        roadmap: ["إتقان فحص الثغرات واختبار الأمان", "تعلم إدارة SIEM", "دراسة أمن تطبيقات الويب", "التدرب على الاستجابة للحوادث", "فهم أمن السحابة"],
    },
    {
        level: "صعب", levelEn: "Advanced", color: "#e53e3e", icon: "🚀", duration: "12-18 شهر",
        desc: "أتقن التخصصات المتقدمة واستعد للشهادات الاحترافية",
        skills: ["اختبار اختراق متقدم", "تحليل جنائي رقمي", "هندسة عكسية", "صيد التهديدات", "أمن البنية التحتية"],
        tools: ["IDA Pro", "Ghidra", "Cobalt Strike", "Volatility", "Autopsy"],
        certs: ["OSCP", "CISSP", "GIAC GSEC", "CISM"],
        roadmap: ["إتقان اختبار الاختراق المتقدم", "تعلم الهندسة العكسية", "دراسة التحليل الجنائي الرقمي", "التدرب على صيد التهديدات", "الاستعداد لشهادات OSCP و CISSP"],
    },
];

const proTracks = [
    { title: "مختبر اختراق", titleEn: "Pentester", icon: "🎯", color: "#c53030", skills: ["Kali Linux", "Burp Suite", "Metasploit", "Python", "Network Scanning"], certs: ["OSCP", "CEH", "GPEN"] },
    { title: "محلل SOC", titleEn: "SOC Analyst", icon: "🛡️", color: "#2b6cb0", skills: ["SIEM", "Log Analysis", "Incident Response", "Threat Detection", "Ticketing"], certs: ["CySA+", "GCIH", "Security+"] },
    { title: "الفريق الأزرق", titleEn: "Blue Team", icon: "🔵", color: "#3182ce", skills: ["Defensive Security", "Forensics", "SIEM", "EDR", "Threat Hunting"], certs: ["GCIH", "GCFA", "BTL1"] },
    { title: "الفريق الأحمر", titleEn: "Red Team", icon: "🔴", color: "#e53e3e", skills: ["Advanced Exploitation", "Social Engineering", "C2 Frameworks", "Evasion", "Reporting"], certs: ["OSCP", "CRTO", "OSCE"] },
];

// ═══════════════════════════════════════════════════════
// TAB NAVIGATION CONSTANTS
// ═══════════════════════════════════════════════════════
const tabs = [
    { id: "roadmap", label: "خارطة الطريق", icon: "🗺️" },
    { id: "paths", label: "المسارات", icon: "📚" },
    { id: "modules", label: "الوحدات", icon: "📦" },
    { id: "levels", label: "حسب المستوى", icon: "📊" },
    { id: "careers", label: "المهن", icon: "💼" },
];

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function PathsPage() {
    const [activeTab, setActiveTab] = useState("roadmap");
    const [searchQuery, setSearchQuery] = useState("");
    const [diffFilter, setDiffFilter] = useState("الكل");
    const [moduleSearch, setModuleSearch] = useState("");
    const [moduleDiffFilter, setModuleDiffFilter] = useState("الكل");
    const [moduleStatusFilter, setModuleStatusFilter] = useState("الكل");

    const getDiffColor = (diff: string) => {
        if (diff === "سهل") return "#38b2ac";
        if (diff === "متوسط") return "#d69e2e";
        return "#e53e3e";
    };

    const filteredModules = cybersecurityModules.filter((m) => {
        const matchSearch = m.title.includes(moduleSearch) || m.titleEn.toLowerCase().includes(moduleSearch.toLowerCase()) || m.desc.includes(moduleSearch);
        const matchDiff = moduleDiffFilter === "الكل" || m.difficulty === moduleDiffFilter;
        return matchSearch && matchDiff;
    });

    const filteredPaths = learningPaths.filter((p) => {
        const matchSearch = p.title.includes(searchQuery) || p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.includes(searchQuery);
        const matchDiff = diffFilter === "الكل" || p.difficulty === diffFilter;
        return matchSearch && matchDiff;
    });

    return (
        <div style={{ paddingTop: "80px" }}>
            {/* ═══ Hero Section — Light Theme ═══ */}
            <div className="page-header">
                <div className="text-5xl mb-4">🗺️</div>
                <h1>خارطة طريق تعلم <span className="gradient-text">الأمن السيبراني</span></h1>
                <p>من المبادئ الأساسية إلى التقنيات المتقدمة، توفر هذه الخطة خطوات واضحة وموارد أساسية لمساعدتك في بناء مجموعة مهارات قوية.</p>
            </div>

            {/* ═══ Stats Bar ═══ */}
            <section style={{ background: 'linear-gradient(135deg, rgba(200,150,46,0.06), rgba(45,165,199,0.04))' }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="text-center">
                            <div className="text-3xl font-black gradient-text">+450</div>
                            <div className="text-xs font-medium mt-1" style={{ color: '#7a7164' }}>تحدي في الأمن السيبراني</div>
                        </div>
                        <div className="w-px h-12 hidden md:block" style={{ background: 'rgba(200,150,46,0.2)' }} />
                        <div className="text-center">
                            <div className="text-3xl font-black gradient-text">+1.2 ألف</div>
                            <div className="text-xs font-medium mt-1" style={{ color: '#7a7164' }}>مختبر عملي تفاعلي</div>
                        </div>
                        <div className="w-px h-12 hidden md:block" style={{ background: 'rgba(200,150,46,0.2)' }} />
                        <div className="text-center">
                            <div className="text-3xl font-black gradient-text">14</div>
                            <div className="text-xs font-medium mt-1" style={{ color: '#7a7164' }}>مسار تعليمي متخصص</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Tab Navigation ═══ */}
            <section className="sticky top-16 z-30" style={{ background: "#faf6ee", borderBottom: "1px solid rgba(200,150,46,0.1)" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                                style={{
                                    color: activeTab === tab.id ? "#c8962e" : "#5c5549",
                                    background: activeTab === tab.id ? "rgba(200,150,46,0.1)" : "transparent",
                                    borderBottom: activeTab === tab.id ? "2px solid #c8962e" : "2px solid transparent",
                                    fontWeight: activeTab === tab.id ? 700 : 500,
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TAB: Roadmap ═══ */}
            {activeTab === "roadmap" && (
                <section className="section-container">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="section-divider" />
                            <h2 className="text-3xl font-bold mb-3">
                                خارطة طريق <span className="gradient-text">التعلم</span>
                            </h2>
                            <p style={{ color: "#5c5549" }}>خطوات واضحة وموارد أساسية لمساعدتك في بناء مجموعة مهارات قوية.</p>
                        </div>

                        {/* Vertical Flowchart */}
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute right-1/2 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(180deg, rgba(200,150,46,0.3), rgba(200,150,46,0.1))", transform: "translateX(50%)" }} />

                            {roadmapSteps.map((step, idx) => (
                                <div key={step.id} className="relative mb-12">
                                    {/* Step node */}
                                    <div className="flex justify-center mb-4">
                                        <div className="w-9 h-9 rounded-full z-10 flex items-center justify-center text-sm font-bold" style={{
                                            background: "linear-gradient(135deg, #c8962e, #e8c068)",
                                            color: "#fff",
                                            boxShadow: "0 4px 12px rgba(200,150,46,0.3)",
                                        }}>
                                            {step.id}
                                        </div>
                                    </div>

                                    {/* Step card */}
                                    <div className="glass-card p-6 mx-4 text-center">
                                        <h3 className="text-lg font-bold mb-2" style={{ color: "#1a1612" }}>{step.title}</h3>
                                        <p className="text-sm mb-4" style={{ color: "#5c5549" }}>{step.desc}</p>

                                        {step.courses && (
                                            <div className="space-y-2">
                                                {step.courses.map((course, ci) => (
                                                    <div key={ci} className="flex items-center gap-3 p-3 rounded-xl" style={{
                                                        background: "rgba(250,246,238,0.8)",
                                                        border: "1px solid rgba(200,150,46,0.1)",
                                                    }}>
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${course.diffColor || "#c8962e"}15` }}>
                                                            {course.type === "طريق" ? "📚" : "🏅"}
                                                        </div>
                                                        <div className="flex-1 text-right">
                                                            <div className="text-sm font-semibold" style={{ color: "#3d3730" }}>{course.title}</div>
                                                            <div className="text-[10px]" style={{ color: "#7a7164" }}>{course.type}</div>
                                                        </div>
                                                        {course.difficulty && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{
                                                                background: `${course.diffColor}15`,
                                                                color: course.diffColor,
                                                                border: `1px solid ${course.diffColor}30`,
                                                            }}>
                                                                {course.difficulty}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {step.type === "specialization" && (
                                            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab("careers"); }}
                                                className="inline-block mt-2 text-sm font-bold hover:underline" style={{ color: "#c8962e" }}>
                                                اكتشف المسارات الوظيفية ←
                                            </Link>
                                        )}
                                    </div>

                                    {/* Arrow down */}
                                    {idx < roadmapSteps.length - 1 && (
                                        <div className="flex justify-center mt-4">
                                            <svg width="16" height="24" viewBox="0 0 16 24" fill="none"><path d="M8 0v20M2 16l6 6 6-6" stroke="#c8962e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Career Tracks Section */}
                            <div className="mt-16">
                                <div className="text-center mb-8">
                                    <div className="section-divider" />
                                    <h3 className="text-2xl font-bold">
                                        المسارات <span className="gradient-text">المهنية</span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {careerTracks.map((track, ti) => (
                                        <div key={ti} className="glass-card p-5">
                                            <div className="text-center mb-4">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3" style={{
                                                    background: `${track.color}15`,
                                                    border: `1px solid ${track.color}30`,
                                                }}>
                                                    {track.icon}
                                                </div>
                                                <h4 className="text-base font-bold" style={{ color: track.color }}>{track.title}</h4>
                                                <p className="text-[10px] mt-1" style={{ color: "#7a7164" }}>{track.desc}</p>
                                            </div>
                                            <div className="space-y-2">
                                                {track.items.map((item, ii) => (
                                                    <div key={ii} className="flex items-center gap-2 p-2.5 rounded-xl" style={{
                                                        background: "rgba(250,246,238,0.8)",
                                                        border: `1px solid ${item.type === "الشهادة المهنية" ? "rgba(200,150,46,0.2)" : "rgba(200,150,46,0.08)"}`,
                                                    }}>
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${item.diffColor || "#c8962e"}15` }}>
                                                            {item.type === "طريق" ? "📚" : "🏅"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold truncate" style={{ color: "#3d3730" }}>{item.title}</div>
                                                            <div className="text-[9px]" style={{ color: "#7a7164" }}>{item.type}</div>
                                                        </div>
                                                        {item.difficulty && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{
                                                                background: `${item.diffColor}15`,
                                                                color: item.diffColor,
                                                                border: `1px solid ${item.diffColor}30`,
                                                            }}>
                                                                {item.difficulty}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* What's Next */}
                            <div className="text-center mt-16 pt-10" style={{ borderTop: "1px solid rgba(200,150,46,0.1)" }}>
                                <h3 className="text-xl font-bold mb-3" style={{ color: "#1a1612" }}>ماذا بعد؟</h3>
                                <p className="text-sm mb-6" style={{ color: "#5c5549" }}>دليل إرشادي وغرف تمارين، مع إضافة محتوى جديد كل أسبوع! استكشف أكثر من 1200 غرفة</p>
                                <button onClick={() => setActiveTab("paths")} className="btn-secondary">
                                    استكشف المزيد ←
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ TAB: Paths Grid ═══ */}
            {activeTab === "paths" && (
                <section className="section-container">
                    <div className="text-center mb-8">
                        <div className="section-divider" />
                        <h2 className="text-3xl font-bold mb-3">مسارات التعلم في مجال <span className="gradient-text">الأمن السيبراني</span></h2>
                        <p style={{ color: "#5c5549" }}>تعرف على الأمن السيبراني وصقل مهاراتك من خلال اتباع مسار تعليمي منظم.</p>
                    </div>

                    {/* Search + Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
                        <div className="relative flex-1">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#a89f8e" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="ابحث عن مسارات التعلم..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 rounded-xl text-sm outline-none focus:ring-2 transition-all"
                                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,150,46,0.15)", color: "#3d3730" }}
                            />
                        </div>
                        <select
                            value={diffFilter}
                            onChange={(e) => setDiffFilter(e.target.value)}
                            className="px-4 py-3 rounded-xl text-sm font-medium cursor-pointer outline-none"
                            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,150,46,0.15)", color: "#5c5549" }}
                        >
                            <option value="الكل">جميع المستويات</option>
                            <option value="سهل">سهل</option>
                            <option value="متوسط">متوسط</option>
                            <option value="صعب">صعب</option>
                        </select>
                    </div>

                    {/* Paths Grid */}
                    <SmartDataView
                        isFilterEmpty={filteredPaths.length === 0}
                        emptyType="filter"
                        emptyConfig={{
                            action: (
                                <button
                                    onClick={() => { setSearchQuery(""); setDiffFilter("الكل"); }}
                                    className="mt-4 px-6 py-2 bg-neon-blue text-black font-bold rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    مسح الفلاتر
                                </button>
                            )
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredPaths.map((path) => (
                                <Link key={path.id} href={`/paths/${path.id}`} className="glass-card overflow-hidden group flex flex-col">
                                    {/* Card Header */}
                                    <div className="relative h-36 flex items-center justify-center overflow-hidden" style={{ background: path.gradient }}>
                                        {path.image ? (
                                            <img src={path.image} alt={path.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <span className="text-5xl transition-transform group-hover:scale-110">{path.icon}</span>
                                        )}
                                        {path.isNew && (
                                            <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold z-10" style={{ background: "#e53e3e", color: "#fff" }}>
                                                NEW 2026
                                            </span>
                                        )}
                                        {path.enrolled && (
                                            <span className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 z-10" style={{ background: "#000000", color: "#fff" }}>
                                                {path.enrolled}%
                                            </span>
                                        )}
                                    </div>
                                    {/* Card Body */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-base mb-1 group-hover:text-amber-700 transition-colors" style={{ color: "#1a1612" }}>{path.title}</h3>
                                        <p className="text-xs leading-relaxed mb-3 flex-1" style={{ color: "#5c5549" }}>{path.desc}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] px-2 py-1 rounded-full font-bold" style={{ background: `${path.diffColor}15`, color: path.diffColor, border: `1px solid ${path.diffColor}30` }}>
                                                {path.difficulty}
                                            </span>
                                            <span className="text-[10px]" style={{ color: "#a89f8e" }}>{path.modules} وحدات • {path.hours}h</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </SmartDataView>
                </section>
            )}

            {/* ═══ TAB: Modules ═══ */}
            {activeTab === "modules" && (
                <section className="section-container">
                    <div className="text-center mb-6">
                        <div className="section-divider" />
                        <h2 className="text-3xl font-bold mb-3">الوحدات <span className="gradient-text">التعليمية</span></h2>
                        <p style={{ color: "#5c5549" }}>وحدات مكونة من مختبرات صغيرة الحجم يمكنك تعلمها بشكل فردي أو كجزء من مسار</p>
                    </div>

                    {/* Search + Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-5xl mx-auto">
                        <div className="relative flex-1">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#a89f8e" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="ابحث عن وحدة تعليمية..."
                                value={moduleSearch}
                                onChange={(e) => setModuleSearch(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 rounded-xl text-sm outline-none focus:ring-2 transition-all"
                                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,150,46,0.15)", color: "#3d3730" }}
                            />
                        </div>
                        <select
                            value={moduleDiffFilter}
                            onChange={(e) => setModuleDiffFilter(e.target.value)}
                            className="px-4 py-3 rounded-xl text-sm font-medium cursor-pointer outline-none"
                            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,150,46,0.15)", color: "#5c5549" }}
                        >
                            <option value="الكل">الصعوبة</option>
                            <option value="سهل">سهل</option>
                            <option value="متوسط">متوسط</option>
                            <option value="صعب">صعب</option>
                        </select>
                        <select
                            value={moduleStatusFilter}
                            onChange={(e) => setModuleStatusFilter(e.target.value)}
                            className="px-4 py-3 rounded-xl text-sm font-medium cursor-pointer outline-none"
                            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,150,46,0.15)", color: "#5c5549" }}
                        >
                            <option value="الكل">الحالة</option>
                            <option value="لم يبدأ">لم يبدأ</option>
                            <option value="قيد التقدم">قيد التقدم</option>
                            <option value="مكتمل">مكتمل</option>
                        </select>
                    </div>

                    {/* Modules Grid */}
                    <SmartDataView
                        isFilterEmpty={filteredModules.length === 0}
                        emptyType="filter"
                        emptyConfig={{
                            action: (
                                <button
                                    onClick={() => { setModuleSearch(""); setModuleDiffFilter("الكل"); setModuleStatusFilter("الكل"); }}
                                    className="mt-4 px-6 py-2 bg-neon-blue text-black font-bold rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    مسح الفلاتر
                                </button>
                            )
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredModules.map((mod, i) => (
                                <div key={i} className="glass-card overflow-hidden group flex flex-col cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                                    {/* Colored Top Banner */}
                                    <div className="relative h-24 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${mod.color}, ${mod.color}bb)` }}>
                                        <span className="text-4xl drop-shadow-lg transition-transform group-hover:scale-110">{mod.icon}</span>
                                        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.15) 100%)" }} />
                                    </div>
                                    {/* Card Body */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-sm mb-1 group-hover:text-amber-700 transition-colors" style={{ color: "#1a1612" }}>{mod.title}</h3>
                                        <p className="text-xs leading-relaxed flex-1" style={{
                                            color: "#5c5549",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical" as const,
                                            overflow: "hidden",
                                        }}>{mod.desc}</p>
                                        <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "1px solid rgba(200,150,46,0.08)" }}>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                                                background: `${getDiffColor(mod.difficulty)}15`,
                                                color: getDiffColor(mod.difficulty),
                                                border: `1px solid ${getDiffColor(mod.difficulty)}30`,
                                            }}>
                                                {mod.difficulty}
                                            </span>
                                            <span className="text-[10px]" style={{ color: "#a89f8e" }}>{mod.modules} وحدات</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SmartDataView>
                </section>
            )}

            {/* ═══ TAB: Levels (Original Content) ═══ */}
            {activeTab === "levels" && (
                <section className="section-container">
                    <div className="text-center mb-10">
                        <div className="section-divider" />
                        <h2 className="text-2xl font-bold">المسارات حسب <span className="gradient-text">المستوى</span></h2>
                    </div>
                    <div className="space-y-8">
                        {levelPaths.map((path, i) => (
                            <div key={i} className="glass-card p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{
                                        background: `${path.color}15`,
                                        border: `1px solid ${path.color}30`,
                                    }}>
                                        {path.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold" style={{ color: path.color }}>{path.level}</h3>
                                        <p className="text-xs font-mono" style={{ color: '#a89f8e' }} dir="ltr">{path.levelEn} • {path.duration}</p>
                                    </div>
                                </div>
                                <p className="mb-6" style={{ color: '#5c5549' }}>{path.desc}</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h4 className="text-sm font-bold mb-3" style={{ color: '#3d3730' }}>📋 خطة الدراسة</h4>
                                        <ol className="space-y-2">{path.roadmap.map((s, j) => <li key={j} className="text-sm flex gap-2" style={{ color: '#5c5549' }}><span style={{ color: '#c8962e' }}>{j + 1}.</span>{s}</li>)}</ol>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold mb-3" style={{ color: '#3d3730' }}>🔧 الأدوات</h4>
                                        <div className="flex flex-wrap gap-2">{path.tools.map((t, j) => <span key={j} className="text-xs px-2 py-1 rounded-md" style={{ background: `${path.color}15`, color: path.color, border: `1px solid ${path.color}30` }}>{t}</span>)}</div>
                                        <h4 className="text-sm font-bold mb-3 mt-5" style={{ color: '#3d3730' }}>📜 الشهادات المقترحة</h4>
                                        <div className="flex flex-wrap gap-2">{path.certs.map((c, j) => <span key={j} className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(200,150,46,0.08)', color: '#8b7340', border: '1px solid rgba(200,150,46,0.2)' }}>{c}</span>)}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold mb-3" style={{ color: '#3d3730' }}>💡 المهارات المطلوبة</h4>
                                        <ul className="space-y-2">{path.skills.map((s, j) => <li key={j} className="text-sm flex gap-2" style={{ color: '#5c5549' }}><span style={{ color: '#c8962e' }}>✓</span>{s}</li>)}</ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══ TAB: Careers (Original Tracks) ═══ */}
            {activeTab === "careers" && (
                <section className="section-container">
                    <div className="text-center mb-10">
                        <div className="section-divider" />
                        <h2 className="text-2xl font-bold">المسارات <span className="gradient-text">الاحترافية</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {proTracks.map((track, i) => (
                            <div key={i} className="glass-card p-7">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{
                                        background: `${track.color}15`,
                                        border: `1px solid ${track.color}30`,
                                    }}>
                                        {track.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg" style={{ color: track.color }}>{track.title}</h3>
                                        <p className="text-xs font-mono" style={{ color: '#a89f8e' }} dir="ltr">{track.titleEn}</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold mb-2" style={{ color: '#3d3730' }}>المهارات الأساسية</h4>
                                    <div className="flex flex-wrap gap-2">{track.skills.map((s, j) => <span key={j} className="text-xs px-2 py-1 rounded-md" style={{ background: `${track.color}15`, color: track.color, border: `1px solid ${track.color}30` }}>{s}</span>)}</div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold mb-2" style={{ color: '#3d3730' }}>الشهادات</h4>
                                    <div className="flex flex-wrap gap-2">{track.certs.map((c, j) => <span key={j} className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(200,150,46,0.08)', color: '#8b7340', border: '1px solid rgba(200,150,46,0.2)' }}>{c}</span>)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══ CTA Section (preserved) ═══ */}
            <section className="section-container text-center">
                <div className="glass-card p-10">
                    <h2 className="text-2xl font-bold mb-4">هل أنت مستعد <span className="gradient-text">للانطلاق؟</span></h2>
                    <p className="mb-6" style={{ color: '#5c5549' }}>سجل الآن وابدأ مسيرتك التعليمية في الأمن السيبراني</p>
                    <Link href="/register" className="btn-primary text-lg px-10 py-4">🎓 سجل مجاناً</Link>
                </div>
            </section>
        </div>
    );
}
