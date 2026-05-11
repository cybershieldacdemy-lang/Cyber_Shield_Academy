/**
 * Fix lesson sort_order for all courses.
 * Strategy: Extract the lesson number from the title, then assign sort_order accordingly.
 * If no number is found, use the current row insertion order (id).
 */
const Database = require('better-sqlite3');
const db = new Database('prisma/data/cyber.db');

const courses = db.prepare('SELECT DISTINCT course_id FROM course_lessons ORDER BY course_id').all();

// Extract leading number from title like "1 - ...", "01 - ...", "001", "الدرس الاول", etc.
function extractNumber(title) {
    // Pattern 1: starts with digits like "1 - " or "01 - " or "001"
    let m = title.match(/^(\d+)\s*[-–—.)\s]/);
    if (m) return parseInt(m[1], 10);

    // Pattern 2: just a plain number title like "001", "002"
    m = title.match(/^(\d+)$/);
    if (m) return parseInt(m[1], 10);

    // Pattern 3: "الدرس 5" or "الدرس الخامس" etc — extract digit after "الدرس"
    m = title.match(/الدرس\s*(\d+)/);
    if (m) return parseInt(m[1], 10);

    // Pattern 4: Arabic ordinals
    const ordinals = {
        'الاول': 1, 'الأول': 1, 'الثاني': 2, 'الثالث': 3, 'الرابع': 4,
        'الخامس': 5, 'السادس': 6, 'السابع': 7, 'الثامن': 8, 'التاسع': 9,
        'العاشر': 10, 'الحادي عشر': 11, 'الثاني عشر': 12, 'الثالث عشر': 13,
        'الرابع عشر': 14, 'الخامس عشر': 15,
    };
    for (const [word, num] of Object.entries(ordinals)) {
        if (title.includes(word)) return num;
    }

    // Pattern 5: Number anywhere preceded by word boundary like "Episode 1" or "Lesson 5"
    m = title.match(/(?:episode|lesson|part|chapter|درس|الحلقة)\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);

    return null;
}

const update = db.prepare('UPDATE course_lessons SET sort_order = ? WHERE id = ?');

let totalFixed = 0;

db.transaction(() => {
    for (const { course_id } of courses) {
        const lessons = db.prepare('SELECT id, title, sort_order FROM course_lessons WHERE course_id = ? ORDER BY id').all(course_id);

        // Try to extract numbers from titles
        const withNumbers = lessons.map(l => ({
            ...l,
            extractedNum: extractNumber(l.title)
        }));

        // Check if most lessons have extractable numbers
        const numbered = withNumbers.filter(l => l.extractedNum !== null);
        
        let sorted;
        if (numbered.length >= lessons.length * 0.5) {
            // Sort by extracted number, then by id for ties
            sorted = [...withNumbers].sort((a, b) => {
                const na = a.extractedNum ?? 9999;
                const nb = b.extractedNum ?? 9999;
                return na - nb || a.id - b.id;
            });
        } else {
            // No numbers found — just use insertion order (id)
            sorted = [...withNumbers].sort((a, b) => a.id - b.id);
        }

        // Assign sort_order 1, 2, 3, ...
        for (let i = 0; i < sorted.length; i++) {
            const newOrder = i + 1;
            if (sorted[i].sort_order !== newOrder) {
                update.run(newOrder, sorted[i].id);
                totalFixed++;
            }
        }

        console.log(`✅ Course ${course_id}: ${lessons.length} lessons sorted (${numbered.length} had numbers in title)`);
    }
})();

console.log(`\n🎯 Done! Fixed sort_order for ${totalFixed} lessons across ${courses.length} courses.`);

// Verify
const remaining = db.prepare('SELECT COUNT(*) as c FROM course_lessons WHERE sort_order = 0').get();
console.log(`Remaining with sort_order=0: ${remaining.c}`);

db.close();
