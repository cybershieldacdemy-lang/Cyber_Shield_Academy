const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cyber.db');
const db = new Database(dbPath);

console.log('Running Gamification DB Migration...');

try {
    // 1. Add points to users
    try {
        db.exec('ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0');
        console.log('✅ Added points column to users table.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('ℹ️ points column already exists in users table.');
        } else {
            throw e;
        }
    }

    // 2. Create badges table
    db.exec(`
        CREATE TABLE IF NOT EXISTS badges (
            id TEXT PRIMARY KEY,
            name_ar TEXT NOT NULL,
            name_en TEXT NOT NULL,
            description_ar TEXT NOT NULL,
            description_en TEXT NOT NULL,
            icon TEXT NOT NULL,
            points_required INTEGER DEFAULT 0
        )
    `);
    console.log('✅ Ensured badges table exists.');

    // 3. Create user_badges table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            badge_id TEXT NOT NULL,
            awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, badge_id)
        )
    `);
    console.log('✅ Ensured user_badges table exists.');

    // 4. Seed initial badges
    const initBadges = [
        { id: 'first_blood', name_ar: 'القطرة الأولى', name_en: 'First Blood', desc_ar: 'أكمل أول درس لك', desc_en: 'Complete your first lesson', icon: '🩸', points: 10 },
        { id: 'scholar', name_ar: 'الباحث', name_en: 'Scholar', desc_ar: 'أكمل أول دورة لك', desc_en: 'Complete your first course', icon: '🎓', points: 100 },
        { id: 'hacker', name_ar: 'هاكر مبتدئ', name_en: 'Novice Hacker', desc_ar: 'اجمع 500 نقطة', desc_en: 'Collect 500 points', icon: '💻', points: 500 },
        { id: 'expert', name_ar: 'خبير أمني', name_en: 'Security Expert', desc_ar: 'اجمع 2000 نقطة', desc_en: 'Collect 2000 points', icon: '🛡️', points: 2000 },
    ];

    const insertBadge = db.prepare(`
        INSERT INTO badges (id, name_ar, name_en, description_ar, description_en, icon, points_required)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name_ar = excluded.name_ar,
            points_required = excluded.points_required
    `);

    db.transaction(() => {
        for (const b of initBadges) {
            insertBadge.run(b.id, b.name_ar, b.name_en, b.desc_ar, b.desc_en, b.icon, b.points);
        }
    })();
    console.log('✅ Seeded initial badges block.');

    console.log('🎉 Migration successful!');
} catch (error) {
    console.error('❌ Migration failed:', error);
} finally {
    db.close();
}
