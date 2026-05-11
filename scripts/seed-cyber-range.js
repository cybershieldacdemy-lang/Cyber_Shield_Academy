const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'cyber.db');
const db = new Database(dbPath);

console.log('🚀 Seeding Cyber Range Data...');

try {
    db.transaction(() => {
        // Ensure tables exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS lab_scenarios (
                id TEXT PRIMARY KEY,
                lab_id TEXT NOT NULL,
                step_order INTEGER NOT NULL,
                title_ar TEXT NOT NULL,
                title_en TEXT NOT NULL,
                task_description TEXT NOT NULL,
                validation_regex TEXT,
                hint TEXT,
                solution TEXT,
                FOREIGN KEY (lab_id) REFERENCES labs(id)
            );

            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY,
                title_ar TEXT NOT NULL,
                title_en TEXT NOT NULL,
                description_ar TEXT,
                description_en TEXT,
                icon TEXT,
                points INTEGER DEFAULT 50,
                category TEXT DEFAULT 'general'
            );

            CREATE TABLE IF NOT EXISTS user_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL,
                earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, achievement_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (achievement_id) REFERENCES achievements(id)
            );

            CREATE TABLE IF NOT EXISTS course_lesson_labs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL,
                lesson_id INTEGER NOT NULL,
                lab_id TEXT NOT NULL,
                UNIQUE(course_id, lesson_id, lab_id),
                FOREIGN KEY (course_id) REFERENCES courses(id),
                FOREIGN KEY (lesson_id) REFERENCES course_lessons(id),
                FOREIGN KEY (lab_id) REFERENCES labs(id)
            );
        `);
        // 1. Achievements
        const achievements = [
            { id: 'first_hack', title_ar: 'المخترق الأول', title_en: 'First Hack', desc_ar: 'أكمل أول مهمة لك في المختبر', desc_en: 'Complete your first lab mission', icon: '🎯', pts: 50 },
            { id: 'nmap_pro', title_ar: 'خبير الاستطلاع', title_en: 'Recon Specialist', desc_ar: 'استخدم nmap لاكتشاف جميع المنافذ المفتوحة', desc_en: 'Use nmap to discover all open ports in a scenario', icon: '📡', pts: 100 },
            { id: 'root_access', title_ar: 'صلاحيات الجذر', title_en: 'Root Access', desc_ar: 'احصل على صلاحيات root في مختبر متقدم', desc_en: 'Gain root privileges in an advanced lab', icon: '👑', pts: 250 },
            { id: 'script_kiddie', title_ar: 'مخترق مبتدئ', title_en: 'Script Kiddie', desc_ar: 'استخدم أداة آلية لتنفيذ هجوم ناجح', desc_en: 'Use an automated tool for a successful attack', icon: '⌨️', pts: 30 }
        ];

        const insertAch = db.prepare('INSERT OR IGNORE INTO achievements (id, title_ar, title_en, description_ar, description_en, icon, points) VALUES (?, ?, ?, ?, ?, ?, ?)');
        achievements.forEach(a => insertAch.run(a.id, a.title_ar, a.title_en, a.desc_ar, a.desc_en, a.icon, a.pts));

        // 2. Scenario Steps for the first lab (Beginner: Web Server Recon)
        const scenarioId = 'web_recon_01';
        const steps = [
            {
                id: 'step_1',
                order: 1,
                title_ar: 'فحص الشبكة',
                title_en: 'Network Scanning',
                desc: 'ابدأ بفحص خادم الهدف (10.0.5.22) لمعرفة المنافذ المفتوحة باستخدام nmap.',
                regex: /nmap\s+10\.0\.5\.22/,
                hint: 'استخدم الأمر: nmap 10.0.5.22'
            },
            {
                id: 'step_2',
                order: 2,
                title_ar: 'تحليل الخدمات',
                title_en: 'Service Analysis',
                desc: 'اقرأ محتوى ملف /etc/hostname للتأكد من هوية النظام.',
                regex: /cat\s+\/etc\/hostname/,
                hint: 'استخدم cat /etc/hostname'
            },
            {
                id: 'step_3',
                order: 3,
                title_ar: 'البحث عن العلم',
                title_en: 'Find the Flag',
                desc: 'ابحث عن ملف باسم flag.txt داخل مجلد المستخدم واقرأ محتواه.',
                regex: /cat\s+.*flag\.txt/,
                hint: 'جرب البحث في /home/user'
            }
        ];

        const insertStep = db.prepare('INSERT OR IGNORE INTO lab_scenarios (id, lab_id, step_order, title_ar, title_en, task_description, validation_regex, hint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        steps.forEach(s => insertStep.run(`${scenarioId}_${s.id}`, 'wifi-wpa2', s.order, s.title_ar, s.title_en, s.desc, s.regex.source, s.hint));
        // Note: Reusing 'wifi-wpa2' lab ID for now as a placeholder for the first interactive experience.

    })();
    console.log('✅ Cyber Range Seeding Completed!');
} catch (error) {
    console.error('❌ Seeding Failed:', error);
} finally {
    db.close();
}
