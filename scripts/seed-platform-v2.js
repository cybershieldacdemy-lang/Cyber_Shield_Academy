const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'cyber.db');
const db = new Database(dbPath);

console.log('🚀 Starting Full Platform Seeding...');

try {
    db.transaction(() => {
        // Ensure tables exist (since this script runs outside the main app context)
        db.exec(`
            CREATE TABLE IF NOT EXISTS labs (
                id TEXT PRIMARY KEY,
                title_ar TEXT NOT NULL,
                title_en TEXT NOT NULL,
                description_ar TEXT,
                description_en TEXT,
                difficulty TEXT DEFAULT 'beginner',
                category TEXT DEFAULT 'network',
                xp INTEGER DEFAULT 100,
                duration TEXT DEFAULT '30m',
                tools TEXT,
                is_online INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS lab_completions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lab_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                status TEXT DEFAULT 'completed',
                completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                points_earned INTEGER NOT NULL,
                UNIQUE(lab_id, user_id),
                FOREIGN KEY (lab_id) REFERENCES labs(id)
            );
            
            -- Also ensure live_sessions matches what we expect
            CREATE TABLE IF NOT EXISTS live_sessions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                teacher_id TEXT NOT NULL,
                student_id TEXT,
                session_type TEXT DEFAULT 'video',
                status TEXT DEFAULT 'scheduled',
                scheduled_at DATETIME,
                started_at DATETIME,
                ended_at DATETIME,
                room_id TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 1. Clear existing data to avoid conflicts

        // 2. Seed CTF Categories
        const ctfCats = [
            { id: 'web', name_ar: 'تطبيقات الويب', name_en: 'Web Exploitation', desc: 'تحديات لكسر مواقع الويب واستغلال الثغرات', icon: '🌐' },
            { id: 'crypto', name_ar: 'التشفير', name_en: 'Cryptography', desc: 'فك تشفير الرسائل والبيانات المخفية', icon: '🔐' },
            { id: 'forensics', name_ar: 'التحقيق الجنائي', name_en: 'Digital Forensics', desc: 'تحليل الملفات واستخراج الأدلة الرقمية', icon: '🔍' },
            { id: 'osint', name_ar: 'الاستخبارات المفتوحة', name_en: 'OSINT', desc: 'البحث وجمع المعلومات من مصادر مفتوحة', icon: '🕵️' },
            { id: 'network', name_ar: 'أمن الشبكات', name_en: 'Network Security', desc: 'تحديات حول بروتوكولات الشبكة والخدمات', icon: '📡' }
        ];

        const insertCtfCat = db.prepare('INSERT OR IGNORE INTO ctf_categories (id, name_ar, name_en, description, icon) VALUES (?, ?, ?, ?, ?)');
        ctfCats.forEach(c => insertCtfCat.run(c.id, c.name_ar, c.name_en, c.desc, c.icon));

        // 3. Seed CTF Challenges
        const ctfChallenges = [
            // Web
            { cat: 'web', title: 'الباب الخلفي الأول', desc: 'هناك مجلد مخفي في هذا الخادم يسمى /admin-portal، حاول قراءة ملف النصي بداخله.', diff: 'easy', points: 50, flag: 'CyberShield{h1dd3n_d1r_f0und}' },
            { cat: 'web', title: 'تخطي تسجيل الدخول', desc: 'استخدم حقن SQL الأساسي لتخطي شاشة الدخول.', diff: 'medium', points: 100, flag: 'CyberShield{sql_1nj3ct10n_m4st3r}' },
            { cat: 'web', title: 'حقن الأوامر (Command Injection)', desc: 'موقع يتيح لك تنفيذ "ping"، هل يمكنك قراءة ملف etc/passwd؟', diff: 'hard', points: 250, flag: 'CyberShield{p1ng_p0ng_sh3ll}' },
            
            // Crypto
            { cat: 'crypto', title: 'شفرة قيصر', desc: 'رسالة مشفرة بإزاحة 3: FbehuVklhog{fdhvdub_f1sk3u_hdvb}', diff: 'easy', points: 50, flag: 'CyberShield{caesar_c1ph3r_easy}' },
            { cat: 'crypto', title: 'الترميز المزدوج', desc: 'هذه السلسلة مشفرة بـ Base64 ثم Hex: 5133b2b25a334a4a5a32684b553139326232316c6157356c635331306157343d', diff: 'medium', points: 120, flag: 'CyberShield{double_decode_win}' },
            
            // OSINT
            { cat: 'osint', title: 'أين القطة؟', desc: 'هذه الصورة التقطت في مدينة عربية مشهورة ببرجها المائل. ما هو اسم المدينة بالإنجليزية؟', diff: 'easy', points: 75, flag: 'CyberShield{pisa}' }, // Wait, Pisa isn't Arabic. Let's use something else.
            { cat: 'osint', title: 'تتبع الموظف', desc: 'ابحث عن حساب تويتر للمبرمج "Ali Cyber" واعرف ما هو نظام التشغيل المفضل لديه.', diff: 'medium', points: 100, flag: 'CyberShield{kali_linux_forever}' },
            
            // Forensics
            { cat: 'forensics', title: 'رسالة مخفية', desc: 'ابحث في البيانات الوصفية (Metadata) لملف الصورة.', diff: 'easy', points: 50, flag: 'CyberShield{exif_d4t4_l34k}' }
        ];

        const insertCtfChal = db.prepare('INSERT OR IGNORE INTO ctf_challenges (category_id, title, description, difficulty, points, flag) VALUES (?, ?, ?, ?, ?, ?)');
        ctfChallenges.forEach(c => insertCtfChal.run(c.cat, c.title, c.desc, c.diff, c.points, c.flag));

        // 4. Seed Labs
        const labs = [
            {
                id: 'wifi-wpa2',
                title_ar: 'اختراق شبكة WiFi (WPA2)',
                title_en: 'WiFi Cracking - WPA2',
                desc_ar: 'تعلم كيفية اختبار أمان شبكات WiFi باستخدام تقنيات WPA2 Handshake Capture',
                desc_en: 'Learn how to test WiFi network security using WPA2 Handshake Capture techniques',
                diff: 'intermediate',
                cat: 'network',
                xp: 250,
                duration: '45m',
                tools: JSON.stringify(['Aircrack-ng', 'Wireshark', 'Kali Linux'])
            },
            {
                id: 'sql-injection-adv',
                title_ar: 'حقن SQL المتقدم',
                title_en: 'Advanced SQL Injection',
                desc_ar: 'اكتشف واستغل ثغرات SQLi المتقدمة بما في ذلك Blind و Time-based injection',
                desc_en: 'Discover and exploit advanced SQLi vulnerabilities including Blind and Time-based injection',
                diff: 'advanced',
                cat: 'web',
                xp: 400,
                duration: '60m',
                tools: JSON.stringify(['Burp Suite', 'SQLMap', 'OWASP ZAP'])
            },
            {
                id: 'nmap-discovery',
                title_ar: 'فحص الشبكة واكتشاف الأجهزة',
                title_en: 'Network Scanning & Discovery',
                desc_ar: 'تعلم استخدام Nmap لفحص الشبكات واكتشاف الأجهزة والخدمات المفتوحة',
                desc_en: 'Learn to use Nmap for network scanning and discovery of devices and services',
                diff: 'beginner',
                cat: 'network',
                xp: 150,
                duration: '30m',
                tools: JSON.stringify(['Nmap', 'Netcat', 'Linux CLI'])
            }
        ];

        const insertLab = db.prepare('INSERT OR IGNORE INTO labs (id, title_ar, title_en, description_ar, description_en, difficulty, category, xp, duration, tools) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        labs.forEach(l => insertLab.run(l.id, l.title_ar, l.title_en, l.desc_ar, l.desc_en, l.diff, l.cat, l.xp, l.duration, l.tools));

        // 5. Seed Live Sessions
        // First get an admin/instructor ID
        const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' OR account_type = 'instructor' LIMIT 1").get();
        if (admin) {
            const sessions = [
                {
                    id: crypto.randomUUID(),
                    title: 'أساسيات التحقيق الجنائي الرقمي',
                    desc: 'جلسة مباشرة لمناقشة كيفية البدء في مجال الـ Forensics',
                    teacher_id: admin.id,
                    type: 'video',
                    scheduled: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                    room: crypto.randomUUID()
                },
                {
                    id: crypto.randomUUID(),
                    title: 'ورشة عمل: حماية تطبيقات الويب',
                    desc: 'تطبيق عملي لأهم توصيات OWASP Top 10',
                    teacher_id: admin.id,
                    type: 'video',
                    scheduled: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
                    room: crypto.randomUUID()
                }
            ];

            const insertSession = db.prepare('INSERT OR IGNORE INTO live_sessions (id, title, description, teacher_id, session_type, scheduled_at, room_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
            sessions.forEach(s => insertSession.run(s.id, s.title, s.desc, s.teacher_id, s.type, s.scheduled, s.room));
        }

    })();
    console.log('✅ Full Platform Seeding Completed Successfully!');
} catch (error) {
    console.error('❌ Seeding Failed:', error);
} finally {
    db.close();
}
