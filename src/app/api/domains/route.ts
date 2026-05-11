import { NextResponse } from 'next/server';

const domains = [
    { id: 1, slug: "network-security", name_ar: "أمن الشبكات", name_en: "Network Security", icon: "🌐", category: "defensive", description_ar: "حماية البنية التحتية للشبكات من الهجمات والتهديدات" },
    { id: 2, slug: "application-security", name_ar: "أمن التطبيقات", name_en: "Application Security", icon: "📱", category: "defensive", description_ar: "تأمين التطبيقات من الثغرات البرمجية" },
    { id: 3, slug: "cloud-security", name_ar: "أمن السحابة", name_en: "Cloud Security", icon: "☁️", category: "defensive", description_ar: "حماية البيانات والخدمات في البيئات السحابية" },
    { id: 4, slug: "cryptography", name_ar: "التشفير", name_en: "Cryptography", icon: "🔐", category: "core", description_ar: "علم تشفير البيانات وحمايتها" },
    { id: 5, slug: "penetration-testing", name_ar: "اختبار الاختراق", name_en: "Penetration Testing", icon: "🎯", category: "offensive", description_ar: "محاكاة الهجمات لاكتشاف الثغرات" },
    { id: 6, slug: "incident-response", name_ar: "الاستجابة للحوادث", name_en: "Incident Response", icon: "🚨", category: "defensive", description_ar: "التعامل مع الحوادث الأمنية والاختراقات" },
    { id: 7, slug: "digital-forensics", name_ar: "التحليل الجنائي الرقمي", name_en: "Digital Forensics", icon: "🔍", category: "core", description_ar: "تحليل الأدلة الرقمية وتتبع الهجمات" },
    { id: 8, slug: "malware-analysis", name_ar: "تحليل البرمجيات الخبيثة", name_en: "Malware Analysis", icon: "🦠", category: "offensive", description_ar: "دراسة وتحليل البرامج الضارة" },
    { id: 9, slug: "iot-security", name_ar: "أمن إنترنت الأشياء", name_en: "IoT Security", icon: "📡", category: "defensive", description_ar: "حماية أجهزة إنترنت الأشياء المتصلة" },
    { id: 10, slug: "security-governance", name_ar: "حوكمة الأمن", name_en: "Security Governance", icon: "📋", category: "core", description_ar: "السياسات والمعايير والامتثال الأمني" },
    { id: 11, slug: "social-engineering", name_ar: "الهندسة الاجتماعية", name_en: "Social Engineering", icon: "🎭", category: "offensive", description_ar: "أساليب الخداع والتلاعب النفسي" },
    { id: 12, slug: "threat-intelligence", name_ar: "استخبارات التهديدات", name_en: "Threat Intelligence", icon: "🧠", category: "core", description_ar: "جمع وتحليل معلومات التهديدات" },
];

export async function GET() {
    return NextResponse.json({ domains, total: domains.length });
}
