const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'data', 'cyber.db');
const db = new Database(dbPath);

console.log('Connecting to database:', dbPath);

db.exec(`
  DROP TABLE IF EXISTS ctf_dynamic_flags;
  DROP TABLE IF EXISTS ctf_attachments;
  DROP TABLE IF EXISTS ctf_unlocked_hints;
  DROP TABLE IF EXISTS ctf_hints;
  DROP TABLE IF EXISTS ctf_solves;
  DROP TABLE IF EXISTS ctf_challenges;
  DROP TABLE IF EXISTS ctf_categories;
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS ctf_categories (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '🚩',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ctf_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT DEFAULT 'easy',
      base_points INTEGER DEFAULT 500,
      min_points INTEGER DEFAULT 50,
      decay_solves INTEGER DEFAULT 50,
      points INTEGER DEFAULT 50,
      flag TEXT NOT NULL,
      is_dynamic INTEGER DEFAULT 0,
      author TEXT DEFAULT 'CyberShield',
      status TEXT DEFAULT 'active',
      tags TEXT DEFAULT '[]',
      external_links TEXT DEFAULT '[]',
      hints TEXT,
      file_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES ctf_categories(id)
  );

  CREATE TABLE IF NOT EXISTS ctf_hints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      cost INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_unlocked_hints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      hint_id INTEGER NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, hint_id),
      FOREIGN KEY (hint_id) REFERENCES ctf_hints(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_dynamic_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      flag TEXT NOT NULL,
      UNIQUE(challenge_id, user_id),
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_solves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      solved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      points_earned INTEGER NOT NULL,
      UNIQUE(challenge_id, user_id),
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id)
  );
`);

console.log('Inserting mock categories...');

const categories = [
    { id: 'web', name_ar: 'أمان الويب', name_en: 'Web Security', description: 'اختراق تطبيقات الويب', icon: '🌐' },
    { id: 'osint', name_ar: 'الاستخبارات', name_en: 'OSINT', description: 'البحث في المصادر المفتوحة', icon: '🔍' },
    { id: 'crypto', name_ar: 'التشفير', name_en: 'Cryptography', description: 'كسر التشفير والتعمية', icon: '🔐' },
    { id: 'forensics', name_ar: 'التحقيق الجنائي', name_en: 'Forensics', description: 'التحليل الجنائي الرقمي', icon: '🕵️' },
    { id: 'rev', name_ar: 'الهندسة العكسية', name_en: 'Reverse Engineering', description: 'عكس هندسة البرمجيات', icon: '⚙️' }
];

const insertCategory = db.prepare('INSERT INTO ctf_categories (id, name_ar, name_en, description, icon) VALUES (?, ?, ?, ?, ?)');
categories.forEach(c => insertCategory.run(c.id, c.name_ar, c.name_en, c.description, c.icon));

console.log('Inserting mock challenges...');

const insertChallenge = db.prepare(`
    INSERT INTO ctf_challenges (
        category_id, title, description, difficulty, base_points, min_points, decay_solves, points, flag, is_dynamic, author, tags, external_links
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Challenge 1: Web
const c1 = insertChallenge.run(
    'web', 
    'SQL Injection 101', 
    `قم بتجاوز شاشة تسجيل الدخول للحصول على العلم.\nالموقع مصاب بثغرة الحقن، حاول استخدام: ' OR 1=1 --`, 
    'easy', 100, 50, 10, 100, 'flag{b4s1c_sqli_byp4ss_2026}', 0, 'CyberShield', '["web", "sqli", "injection"]', '[{"title":"Login Page","url":"/labs/sqli-01"}]'
);

// Challenge 2: Crypto
const c2 = insertChallenge.run(
    'crypto', 
    'Caesar Secret', 
    'لقد اعترضنا هذه الرسالة: synt{pnrfnr_1f_n_p1nff1p}\\nيبدو أنها مشفرة باستخدام إزاحة ROT13. هل يمكنك فك تشفيرها؟', 
    'easy', 100, 50, 10, 100, 'flag{caesar_1s_a_c1ass1c}', 0, 'CryptoMaster', '["crypto", "caesar", "rot13"]', '[]'
);

// Challenge 3: OSINT
const c3 = insertChallenge.run(
    'osint', 
    'Find The Hacker', 
    'تلقينا تهديداً من شخص يستخدم اسم المستخدم @DarkShadowX992. نريد معرفة أول منتدى قام بالتسجيل فيه.\\nابحث جيداً.', 
    'medium', 300, 100, 20, 300, 'flag{hackforums_2011}', 0, 'OSINT_Team', '["osint", "recon", "social"]', '[{"title":"Twitter Search","url":"https://twitter.com/search"}]'
);

// Challenge 4: Forensics
const c4 = insertChallenge.run(
    'forensics', 
    'Hidden in Plain Sight', 
    'عثرنا على هذه الصورة في جهاز المشتبه به. يقول إنها مجرد صورة عادية، ولكننا نشك في وجود ملف مخفي بداخلها (Steganography).', 
    'hard', 500, 200, 30, 500, 'flag{st3g0_m4st3r_1337}', 0, 'Forensics_Dept', '["forensics", "stego", "binwalk"]', '[]'
);

console.log('Inserting mock hints...');
const insertHint = db.prepare('INSERT INTO ctf_hints (challenge_id, content, cost, sort_order) VALUES (?, ?, ?, ?)');

insertHint.run(c1.lastInsertRowid, 'استخدم علامة الاقتباس الأحادية لاختبار الثغرة.', 10, 1);
insertHint.run(c1.lastInsertRowid, 'جرب إغلاق الاستعلام بـ -- أو #.', 20, 2);

insertHint.run(c2.lastInsertRowid, 'ROT13 هو تشفير قيصر مع إزاحة 13.', 0, 1);

insertHint.run(c4.lastInsertRowid, 'أداة binwalk قد تكون مفيدة جداً.', 50, 1);
insertHint.run(c4.lastInsertRowid, 'أداة steghide هي الحل، وكلمة المرور هي 12345.', 100, 2);

console.log('Inserting mock attachments...');
const insertAttachment = db.prepare('INSERT INTO ctf_attachments (challenge_id, file_name, file_url, file_type) VALUES (?, ?, ?, ?)');

insertAttachment.run(c4.lastInsertRowid, 'suspect_image.jpg', '/files/ctf/suspect_image.jpg', 'image/jpeg');

console.log('Setup complete!');
