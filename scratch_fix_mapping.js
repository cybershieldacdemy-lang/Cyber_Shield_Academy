const db = require('better-sqlite3')('prisma/data/cyber.db');

const mapping = {
    '15كتاب حول الهكر الاخلاقي': 1,
    'KaliLinux vedios': 2,
    'Malware s7ee7@Professor_Technology': 3,
    'Metasploit Course -  دورة اختبار اختراق مع الميتاسبلويت': 4,
    'NMAP Course   دورة فحص الانظمة': 5,
    'اختبار الاختراق': 6,
    'اختراق ويندوز': 7,
    'تعلم بايثون في فيديو واحد python (حصري) 6 ساعات بإتقان learn python in one video': 8,
    'دورة الانترنت المظلم للهاكرز والقراصنة _ Dark Web Course في ساعة واحدة': 9,
    'دورة كالي لينكس للمبتدئين': 10,
    'شبكات CCNA': 11,
    'شهادة الهاكر الاخلاقى ( CEH )': 12,
    'كالي': 13,
    'كورس اختراق': 14,
    'كورس الاختراق الاخلاقي': 15
};

const lessons = db.prepare('SELECT id, video_url, course_id FROM course_lessons').all();

let updated = 0;
for (const lesson of lessons) {
    if (!lesson.video_url) continue;
    const folderName = lesson.video_url.split('/')[0];
    const correctCourseId = mapping[folderName] || mapping[folderName.replace(/\\/g, '/')];
    
    if (correctCourseId && correctCourseId !== lesson.course_id) {
        db.prepare('UPDATE course_lessons SET course_id = ? WHERE id = ?').run(correctCourseId, lesson.id);
        updated++;
    }
}

console.log(`Updated ${updated} lessons with correct course_id.`);
