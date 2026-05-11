const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cyber.db');
const db = new Database(dbPath);

console.log('Running CTF DB Migration...');

try {
    // 1. Create ctf_categories table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ctf_categories (
            id TEXT PRIMARY KEY,
            name_ar TEXT NOT NULL,
            name_en TEXT NOT NULL,
            description TEXT,
            icon TEXT DEFAULT '🚩',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Ensured ctf_categories table exists.');

    // 2. Create ctf_challenges table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ctf_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty TEXT DEFAULT 'easy',
            points INTEGER DEFAULT 50,
            flag TEXT NOT NULL,
            hints TEXT,
            file_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES ctf_categories(id)
        )
    `);
    console.log('✅ Ensured ctf_challenges table exists.');

    // 3. Create ctf_solves table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ctf_solves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            solved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            points_earned INTEGER NOT NULL,
            UNIQUE(challenge_id, user_id),
            FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id)
        )
    `);
    console.log('✅ Ensured ctf_solves table exists.');

    // 4. Seed initial CTF data
    const existingCats = db.prepare('SELECT COUNT(*) as c FROM ctf_categories').get().c;
    
    if (existingCats === 0) {
        db.transaction(() => {
            // Insert Categories
            const categories = [
                { id: 'web', name_ar: 'تطبيقات الويب', name_en: 'Web Exploitation', desc: 'تحديات لكسر مواقع الويب واستغلال الثغرات', icon: '🌐' },
                { id: 'crypto', name_ar: 'التشفير', name_en: 'Cryptography', desc: 'فك تشفير الرسائل والبيانات المخفية', icon: '🔐' },
                { id: 'forensics', name_ar: 'التحقيق الجنائي', name_en: 'Digital Forensics', desc: 'تحليل الملفات واستخراج الأدلة الرقمية', icon: '🔍' },
                { id: 'osint', name_ar: 'الاستخبارات المفتوحة', name_en: 'OSINT', desc: 'البحث وجمع المعلومات من مصادر مفتوحة', icon: '🕵️' }
            ];

            const insertCat = db.prepare('INSERT INTO ctf_categories (id, name_ar, name_en, description, icon) VALUES (?, ?, ?, ?, ?)');
            categories.forEach(c => insertCat.run(c.id, c.name_ar, c.name_en, c.desc, c.icon));

            // Insert Challenges
            const challenges = [
                { cat: 'web', title: 'الباب الخلفي الأول', desc: 'هناك مجلد مخفي في هذا الخادم يسمى /admin-portal، حاول قراءة ملف النصي بداخله.', diff: 'easy', points: 50, flag: 'CyberShield{h1dd3n_d1r_f0und}' },
                { cat: 'web', title: 'تخطي تسجيل الدخول', desc: 'استخدم حقن SQL الأساسي لتخطي شاشة الدخول.', diff: 'medium', points: 100, flag: 'CyberShield{sql_1nj3ct10n_m4st3r}' },
                { cat: 'crypto', title: 'شفرة قيصر', desc: 'رسالة مشفرة بإزاحة 3: FbehuVklhog{fdhvdub_f1sk3u_hdvb}', diff: 'easy', points: 50, flag: 'CyberShield{caesar_c1ph3r_easy}' },
                { cat: 'forensics', title: 'رسالة مخفية', desc: 'ابحث في البيانات الوصفية (Metadata) لملف الصورة.', diff: 'easy', points: 50, flag: 'CyberShield{exif_d4t4_l34k}' }
            ];

            const insertChal = db.prepare('INSERT INTO ctf_challenges (category_id, title, description, difficulty, points, flag) VALUES (?, ?, ?, ?, ?, ?)');
            challenges.forEach(c => insertChal.run(c.cat, c.title, c.desc, c.diff, c.points, c.flag));
        })();
        console.log('✅ Seeded initial CTF categories and challenges.');
    }

    console.log('🎉 CTF Migration successful!');
} catch (error) {
    console.error('❌ CTF Migration failed:', error);
} finally {
    db.close();
}
