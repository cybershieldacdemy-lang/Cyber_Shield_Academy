// Script: create DMS tables directly in SQLite (safe — adds only new tables)
const Database = require('better-sqlite3');
const path = require('path');
const { createHash } = require('crypto');

const dbPath = path.join(__dirname, '..', 'prisma', 'data', 'cyber.db');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS document_templates (
  id       TEXT PRIMARY KEY NOT NULL,
  code     TEXT NOT NULL UNIQUE,
  titleAr  TEXT NOT NULL,
  titleEn  TEXT NOT NULL,
  category TEXT NOT NULL,
  schema   TEXT NOT NULL,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id           TEXT PRIMARY KEY NOT NULL,
  serialNumber TEXT NOT NULL UNIQUE,
  templateId   TEXT NOT NULL,
  submitterId  TEXT NOT NULL,
  reviewerId   TEXT,
  status       TEXT NOT NULL DEFAULT 'PENDING',
  data         TEXT NOT NULL,
  signature    TEXT,
  reviewNotes  TEXT,
  createdAt    DATETIME NOT NULL DEFAULT (datetime('now')),
  updatedAt    DATETIME NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (templateId)  REFERENCES document_templates(id),
  FOREIGN KEY (submitterId) REFERENCES users(id),
  FOREIGN KEY (reviewerId)  REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS document_logs (
  id         TEXT PRIMARY KEY NOT NULL,
  documentId TEXT NOT NULL,
  action     TEXT NOT NULL,
  userId     TEXT NOT NULL,
  notes      TEXT,
  createdAt  DATETIME NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (userId)     REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_documents_status    ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_submitter ON documents(submitterId);
`);

console.log('✅ DMS tables created successfully!');

// ─── Seed document templates ─────────────────────────────────────────────────
const cuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const templates = [
  {
    code: 'USR-01', titleAr: 'مستند تسجيل مستخدم', titleEn: 'User Registration Document',
    category: 'Users',
    schema: JSON.stringify([
      { name: 'fullName',    labelAr: 'الاسم الكامل',          labelEn: 'Full Name',    type: 'text',   required: true },
      { name: 'email',       labelAr: 'البريد الإلكتروني',      labelEn: 'Email',        type: 'email',  required: true },
      { name: 'phone',       labelAr: 'رقم الهاتف',             labelEn: 'Phone',        type: 'text',   required: false },
      { name: 'nationality', labelAr: 'الجنسية',                labelEn: 'Nationality',  type: 'text',   required: true },
      { name: 'notes',       labelAr: 'ملاحظات',               labelEn: 'Notes',        type: 'textarea', required: false },
    ])
  },
  {
    code: 'INS-01', titleAr: 'طلب انضمام مدرب', titleEn: 'Instructor Application',
    category: 'Instructors',
    schema: JSON.stringify([
      { name: 'fullName',       labelAr: 'الاسم الكامل',           labelEn: 'Full Name',       type: 'text',     required: true },
      { name: 'specialization', labelAr: 'التخصص الدقيق',          labelEn: 'Specialization',  type: 'select',   required: true,
        options: ['Web Pentesting', 'Network Security', 'Reverse Engineering', 'Malware Analysis', 'Cloud Security', 'OSINT', 'Other'] },
      { name: 'linkedin',       labelAr: 'رابط LinkedIn',           labelEn: 'LinkedIn URL',    type: 'url',      required: false },
      { name: 'certs',          labelAr: 'الشهادات المهنية',        labelEn: 'Certifications',  type: 'text',     required: false },
      { name: 'experience',     labelAr: 'سنوات الخبرة',            labelEn: 'Years Experience', type: 'number',  required: true },
      { name: 'motivation',     labelAr: 'دوافع الانضمام',          labelEn: 'Motivation',      type: 'textarea', required: true },
    ])
  },
  {
    code: 'CRS-01', titleAr: 'مستند مقترح دورة', titleEn: 'Course Proposal',
    category: 'Courses',
    schema: JSON.stringify([
      { name: 'titleAr',       labelAr: 'عنوان الدورة (عربي)',    labelEn: 'Course Title (AR)', type: 'text',     required: true },
      { name: 'titleEn',       labelAr: 'عنوان الدورة (إنجليزي)', labelEn: 'Course Title (EN)', type: 'text',     required: true },
      { name: 'level',         labelAr: 'المستوى',                labelEn: 'Level',             type: 'select',   required: true,
        options: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'prerequisites', labelAr: 'المتطلبات السابقة',      labelEn: 'Prerequisites',     type: 'textarea', required: false },
      { name: 'objectives',    labelAr: 'مخرجات التعلم',          labelEn: 'Learning Outcomes', type: 'textarea', required: true },
      { name: 'syllabus',      labelAr: 'المنهج الدراسي',         labelEn: 'Syllabus',          type: 'textarea', required: true },
      { name: 'duration',      labelAr: 'المدة الزمنية',          labelEn: 'Duration',          type: 'text',     required: true },
    ])
  },
  {
    code: 'LAB-01', titleAr: 'مستند إنشاء مختبر', titleEn: 'Lab Creation Document',
    category: 'Labs',
    schema: JSON.stringify([
      { name: 'title',       labelAr: 'اسم المختبر',          labelEn: 'Lab Name',         type: 'text',     required: true },
      { name: 'category',   labelAr: 'الفئة',                 labelEn: 'Category',         type: 'select',   required: true,
        options: ['Web', 'Network', 'Forensics', 'Cryptography', 'Reverse Engineering', 'OSINT'] },
      { name: 'difficulty', labelAr: 'مستوى الصعوبة',         labelEn: 'Difficulty',       type: 'select',   required: true,
        options: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'environment', labelAr: 'بيئة التشغيل',         labelEn: 'Environment',      type: 'select',   required: true,
        options: ['Docker', 'VirtualBox', 'Browser-based', 'Cloud VM'] },
      { name: 'targetVulnerability', labelAr: 'الثغرة المستهدفة', labelEn: 'Target Vulnerability', type: 'text', required: true },
      { name: 'flags',      labelAr: 'قائمة الـ Flags',        labelEn: 'Flags List',       type: 'textarea', required: false },
      { name: 'scenario',   labelAr: 'سيناريو المختبر',        labelEn: 'Lab Scenario',     type: 'textarea', required: true },
    ])
  },
  {
    code: 'EXM-01', titleAr: 'مستند بنك الأسئلة', titleEn: 'Question Bank Document',
    category: 'Exams',
    schema: JSON.stringify([
      { name: 'quizTitle',   labelAr: 'عنوان الاختبار',        labelEn: 'Quiz Title',       type: 'text',    required: true },
      { name: 'courseRef',   labelAr: 'الدورة المرتبطة',       labelEn: 'Related Course',   type: 'text',    required: true },
      { name: 'difficulty',  labelAr: 'مستوى الصعوبة',         labelEn: 'Difficulty',       type: 'select',  required: true,
        options: ['Easy', 'Medium', 'Hard'] },
      { name: 'numQuestions', labelAr: 'عدد الأسئلة',          labelEn: 'Number of Qs',    type: 'number',  required: true },
      { name: 'passMark',    labelAr: 'درجة النجاح (%)',        labelEn: 'Pass Mark (%)',    type: 'number',  required: true },
      { name: 'notes',       labelAr: 'ملاحظات إضافية',        labelEn: 'Extra Notes',     type: 'textarea', required: false },
    ])
  },
  {
    code: 'CRT-01', titleAr: 'طلب إصدار شهادة', titleEn: 'Certificate Issuance Request',
    category: 'Certificates',
    schema: JSON.stringify([
      { name: 'studentName', labelAr: 'اسم الطالب',            labelEn: 'Student Name',    type: 'text',    required: true },
      { name: 'courseTitle', labelAr: 'اسم الدورة',            labelEn: 'Course Title',    type: 'text',    required: true },
      { name: 'completionDate', labelAr: 'تاريخ الإتمام',      labelEn: 'Completion Date', type: 'date',    required: true },
      { name: 'grade',       labelAr: 'الدرجة النهائية',       labelEn: 'Final Grade',     type: 'text',    required: true },
      { name: 'certType',    labelAr: 'نوع الشهادة',           labelEn: 'Cert Type',       type: 'select',  required: true,
        options: ['Course Completion', 'Lab Mastery', 'Exam Pass', 'Professional Badge'] },
    ])
  },
  {
    code: 'TCH-01', titleAr: 'تقرير ثغرة / خطأ تقني', titleEn: 'Bug / Vulnerability Report',
    category: 'Technical',
    schema: JSON.stringify([
      { name: 'title',       labelAr: 'عنوان المشكلة',         labelEn: 'Issue Title',      type: 'text',     required: true },
      { name: 'severity',    labelAr: 'مستوى الخطورة',         labelEn: 'Severity',         type: 'select',   required: true,
        options: ['Critical', 'High', 'Medium', 'Low'] },
      { name: 'description', labelAr: 'وصف المشكلة',           labelEn: 'Description',      type: 'textarea', required: true },
      { name: 'steps',       labelAr: 'خطوات الاستنساخ',       labelEn: 'Steps to Reproduce', type: 'textarea', required: true },
      { name: 'affectedUrl', labelAr: 'الصفحة / المسار المتأثر', labelEn: 'Affected URL', type: 'text',     required: false },
      { name: 'browser',     labelAr: 'المتصفح / البيئة',      labelEn: 'Browser / Env',   type: 'text',     required: false },
    ])
  },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO document_templates (id, code, titleAr, titleEn, category, schema)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((rows) => {
  for (const t of rows) insert.run(cuid(), t.code, t.titleAr, t.titleEn, t.category, t.schema);
});

insertMany(templates);
console.log(`✅ Seeded ${templates.length} document templates!`);
db.close();
