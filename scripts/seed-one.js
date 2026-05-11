const Database = require('better-sqlite3');
const db = new Database('cyber.db');

try {
    const insert = db.prepare(`
    INSERT INTO terms (term_en, term_ar, definition_en, definition_ar, example, level, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    insert.run(
        'Phishing',
        'التصيد الاحتيالي',
        'Attempting to acquire sensitive information such as usernames, passwords, and credit card details by masquerading as a trustworthy entity.',
        'محاولة الحصول على معلومات حساسة مثل أسماء المستخدمين وكلمات المرور وتفاصيل بطاقة الائتمان من خلال انتحال صفة كيان جدير بالثقة.',
        'Email claiming to be from your bank asking for password.',
        'مبتدئ',
        1
    );

    console.log('Seeded one term successfully.');
} catch (err) {
    console.error('Error seeding:', err);
}

db.close();
