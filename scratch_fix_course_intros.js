const db = require('better-sqlite3')('prisma/data/cyber.db');

const courses = db.prepare('SELECT id FROM courses').all();

let updated = 0;
for (const course of courses) {
    const firstLesson = db.prepare("SELECT video_url FROM course_lessons WHERE course_id = ? AND video_url IS NOT NULL AND video_url != '' ORDER BY id ASC LIMIT 1").get(course.id);
    
    if (firstLesson) {
        db.prepare('UPDATE courses SET video_url = ? WHERE id = ?').run(firstLesson.video_url, course.id);
        updated++;
    } else {
        db.prepare('UPDATE courses SET video_url = NULL WHERE id = ?').run(course.id);
    }
}

console.log(`Updated intro videos for ${updated} courses.`);
