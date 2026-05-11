/**
 * Seed course lessons from the courses/ directory.
 * 
 * Scans the courses/ folder structure and creates lessons
 * for each video file found, linked to matching courses.
 * 
 * Usage: node scripts/seed-lessons.js
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database('cyber.db');

// Ensure table exists
db.exec(`
    CREATE TABLE IF NOT EXISTS course_lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        video_url TEXT DEFAULT '',
        video_type TEXT DEFAULT 'local',
        duration TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        is_free INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_lessons_course ON course_lessons(course_id);
`);

// Add video_url column to courses if not exists
try {
    db.exec(`ALTER TABLE courses ADD COLUMN video_url TEXT DEFAULT ''`);
} catch(e) {
    // Column already exists — ignore
}

const coursesDir = path.join(__dirname, '..', 'courses');

// Map folder names to course search terms
const folderToCourseMap = {
    'KaliLinux vedios': 'kali',
    'Malware s7ee7@Professor_Technology': 'malware',
    'اختبار الاختراق': 'اختبار الاختراق',
    'اختراق ويندوز': 'اختراق',
    'دورة كالي لينكس للمبتدئين': 'كالي لينكس',
    'شبكات CCNA': 'CCNA',
    'شهادة الهاكر الاخلاقى ( CEH )': 'CEH',
    'كالي': 'كالي',
    'كورس اختراق': 'اختراق',
    'كورس الاختراق الاخلاقي': 'الاختراق الأخلاقي',
};

const videoExtensions = ['.mp4', '.mkv', '.webm', '.avi', '.mov'];

function isVideoFile(filename) {
    return videoExtensions.includes(path.extname(filename).toLowerCase());
}

function scanDirectory(dirPath, relativePath = '') {
    const results = [];
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
        const fullRelPath = relativePath ? `${relativePath}/${item.name}` : item.name;
        
        if (item.isDirectory()) {
            results.push(...scanDirectory(path.join(dirPath, item.name), fullRelPath));
        } else if (isVideoFile(item.name)) {
            results.push({
                name: item.name,
                relativePath: fullRelPath,
                folder: relativePath.split('/')[0] || '',
                size: fs.statSync(path.join(dirPath, item.name)).size,
            });
        }
    }
    
    return results;
}

try {
    console.log('🎬 Scanning courses directory for video files...');
    
    const videos = scanDirectory(coursesDir);
    console.log(`Found ${videos.length} video files`);

    // Get all courses from DB
    const courses = db.prepare('SELECT * FROM courses').all();
    console.log(`Found ${courses.length} courses in database`);

    const insertLesson = db.prepare(`
        INSERT OR IGNORE INTO course_lessons (course_id, title, description, video_url, video_type, duration, sort_order, is_free)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Clear existing lessons first
    db.prepare('DELETE FROM course_lessons').run();
    console.log('Cleared existing lessons');

    let totalAdded = 0;

    // For each course, find matching video files
    for (const course of courses) {
        const courseTitle = (course.title_ar || '') + ' ' + (course.title_en || '');
        const matchingVideos = [];

        for (const video of videos) {
            // Match by folder name or course title
            const folderSearchTerm = folderToCourseMap[video.folder];
            if (folderSearchTerm && courseTitle.includes(folderSearchTerm)) {
                matchingVideos.push(video);
            } else if (video.folder && courseTitle.toLowerCase().includes(video.folder.toLowerCase())) {
                matchingVideos.push(video);
            }
        }

        if (matchingVideos.length > 0) {
            console.log(`\n📚 Course: ${course.title_ar} (${matchingVideos.length} videos)`);
            matchingVideos.forEach((video, i) => {
                const cleanTitle = path.basename(video.name, path.extname(video.name))
                    .replace(/\([\d]+P_HD\)/g, '')
                    .replace(/\([\d]+P\)/g, '')
                    .replace(/\([\d]+p\)/g, '')
                    .trim();
                
                insertLesson.run(
                    course.id,
                    cleanTitle,
                    '',
                    video.relativePath,
                    'local',
                    '',
                    i + 1,
                    i === 0 ? 1 : 0  // First lesson is free
                );
                totalAdded++;
                console.log(`  ✅ ${i + 1}. ${cleanTitle}`);
            });

            // Update lessons count and set first video URL
            db.prepare('UPDATE courses SET lessons = ?, video_url = ? WHERE id = ?')
                .run(matchingVideos.length, matchingVideos[0].relativePath, course.id);
        }
    }

    // Also handle root-level videos (not in subdirectories)
    const rootVideos = videos.filter(v => !v.folder);
    if (rootVideos.length > 0) {
        console.log(`\n📁 Found ${rootVideos.length} root-level videos (not matched to courses)`);
        for (const video of rootVideos) {
            console.log(`  📹 ${video.name}`);
        }
    }

    console.log(`\n✅ Done! Added ${totalAdded} lessons to ${courses.length} courses.`);

} catch (error) {
    console.error('❌ Seeding failed:', error);
} finally {
    db.close();
}
