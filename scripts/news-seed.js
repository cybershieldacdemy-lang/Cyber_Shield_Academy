const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cyber.db');
const db = new Database(dbPath);

console.log('Seeding News/Attacks Database...');

try {
    const initNews = [
        { title_ar: "ثغرة حرجة في خوادم Apache تهدد الملايين", title_en: "Critical Apache Vulnerability", content_ar: "ثغرة تنفيذ كود عن بعد تسمح للمهاجمين بالسيطرة الكاملة على الخوادم غير المحدثة.", severity: "critical", cve: "CVE-2024-0001", affected: "Apache 2.4.x", source: "Security Labs" },
        { title_ar: "هجوم فدية يستهدف القطاع الصحي", title_en: "Ransomware targets Health Sector", content_ar: "مجموعة LockBit تدعي اختراق شبكة مستشفيات كبرى وتسريب بيانات المرضى.", severity: "high", cve: "", affected: "Windows Servers", source: "Dark Web Tracker" },
        { title_ar: "تحديث أمني لنظام ماك أو إس", title_en: "macOS Security Update", content_ar: "أبل تصدر تحديثاً لتصحيح ثغرة استغلال يوم الصفر (Zero-Day) كانت تُستغل فعلياً من قبل قراصنة.", severity: "high", cve: "CVE-2024-0002", affected: "macOS Sonoma", source: "Apple Security" },
        { title_ar: "اكتشاف برمجية خبيثة في متجر بلاي", title_en: "Malware in Play Store", content_ar: "جوجل تحذف 50 تطبيقاً خبيثاً من متجرها تم تحميلها أكثر من 30 مليون مرة وتتخفى كتطبيقات تعديل صور.", severity: "medium", cve: "", affected: "Android", source: "Tech News" },
    ];

    const existingNewsCount = db.prepare('SELECT COUNT(*) as c FROM news').get().c;
    
    if (existingNewsCount === 0) {
        const insertNews = db.prepare(`
            INSERT INTO news (title_ar, title_en, content_ar, severity, cve_id, affected, source)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        db.transaction(() => {
            for (const item of initNews) {
                insertNews.run(item.title_ar, item.title_en, item.content_ar, item.severity, item.cve, item.affected, item.source);
            }
        })();
        console.log('✅ Seeded initial news/attacks records.');
    } else {
         console.log('ℹ️ News table is not empty, skipping seed.');
    }

    console.log('🎉 Seeding successful!');
} catch (error) {
    console.error('❌ Seeding failed:', error);
} finally {
    db.close();
}
