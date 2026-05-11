const db = require('better-sqlite3')('prisma/data/cyber.db');
const fs = require('fs');
const path = require('path');

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

let added = 0;

function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDirectory(fullPath);
        } else {
            // It's a file
            const ext = path.extname(item).toLowerCase();
            if (ext === '.mp4' || ext === '.pdf' || ext === '.mkv' || ext === '.webm' || ext === '.avi') {
                const relativePath = path.relative('courses', fullPath).replace(/\\/g, '/');
                const folderName = relativePath.split('/')[0];
                const courseId = mapping[folderName];
                
                if (courseId) {
                    const existing = db.prepare('SELECT id FROM course_lessons WHERE video_url = ? AND course_id = ?').get(relativePath, courseId);
                    if (!existing) {
                        const title = path.basename(item, ext);
                        db.prepare(`
                            INSERT INTO course_lessons (course_id, title, video_url, video_type, sort_order)
                            VALUES (?, ?, ?, 'local', 0)
                        `).run(courseId, title, relativePath);
                        added++;
                    }
                }
            }
        }
    }
}

scanDirectory('courses');
console.log(`Successfully added ${added} missing files to course_lessons!`);

// Also update lesson count in courses table
const courses = db.prepare('SELECT id FROM courses').all();
for (const course of courses) {
    const count = db.prepare('SELECT COUNT(*) as c FROM course_lessons WHERE course_id = ?').get(course.id).c;
    db.prepare('UPDATE courses SET lessons = ? WHERE id = ?').run(count, course.id);
}
console.log('Updated lessons count in courses table.');
