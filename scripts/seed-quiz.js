const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../cyber.db');
const db = new Database(dbPath);

console.log('Seeding a test quiz...');

// Seed Quiz
const insertQuiz = db.prepare(`
  INSERT INTO quizzes (course_id, lesson_id, title, passing_score)
  VALUES (?, ?, ?, ?)
`);

// Insert into Course ID 1
try {
  const result = insertQuiz.run(1, null, 'الاختبار الشامل لاختبار الاختراق', 70);
  const quizId = result.lastInsertRowid;
  
  // Seed Questions
  const insertQuestion = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option_index)
    VALUES (?, ?, ?, ?)
  `);

  insertQuestion.run(quizId, 'ما هي الأداة الأفضل للبحث عن الثغرات في تطبيقات الويب؟', JSON.stringify(['Nmap', 'Burp Suite', 'Wireshark', 'Metasploit']), 1);
  insertQuestion.run(quizId, 'ما المقصود بهجوم SQL Injection؟', JSON.stringify(['حقن كود خبيث في قاعدة البيانات', 'سرقة ملفات النظام', 'تشفير بيانات المستخدم', 'إيقاف الخادم عن العمل']), 0);
  insertQuestion.run(quizId, 'أي من المنافذ التالية يستخدم عادة لبروتوكول SSH؟', JSON.stringify(['21', '80', '22', '443']), 2);

  console.log('Quiz seeded successfully with ID:', quizId);
} catch (error) {
  console.log('Error seeding quiz:', error);
}

db.close();
