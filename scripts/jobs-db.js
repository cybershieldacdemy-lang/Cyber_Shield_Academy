const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cyber.db');
const db = new Database(dbPath);

console.log('Running Jobs DB Migration...');

try {
    // 1. Create jobs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT DEFAULT 'Remote',
            job_type TEXT DEFAULT 'Full-Time',
            role TEXT NOT NULL, 
            description TEXT NOT NULL,
            requirements TEXT,
            apply_link TEXT,
            posted_by TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Ensured jobs table exists.');

    // 2. Create job_applications table
    db.exec(`
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(job_id, user_id)
        )
    `);
    console.log('✅ Ensured job_applications table exists.');

    // 3. Seed some dummy jobs
    const initJobs = [
        { title: 'Junior Penetration Tester', company: 'CyberDefend LLC', location: 'Riyadh, KSA / Remote', job_type: 'Full-Time', role: 'Pentester', desc: 'Looking for a junior pentester with strong basics in web app security.', req: '- OSCP or equivalent\n- 1+ years experience', posted_by: 'admin' },
        { title: 'SOC Analyst L1', company: 'SecureNet', location: 'Dubai, UAE', job_type: 'Full-Time', role: 'Analyst', desc: 'Monitor security events and respond to incidents.', req: '- CompTIA Security+\n- SIEM experience', posted_by: 'admin' },
        { title: 'Cybersecurity Intern', company: 'TechShield', location: 'Remote', job_type: 'Internship', role: 'Intern', desc: '3-month internship program for cybersecurity students.', req: '- Enrolled in a CS/Cybersecurity degree', posted_by: 'admin' },
    ];

    const insertJob = db.prepare(`
        INSERT INTO jobs (title, company, location, job_type, role, description, requirements, posted_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const existingJobs = db.prepare('SELECT COUNT(*) as c FROM jobs').get().c;
    if (existingJobs === 0) {
        db.transaction(() => {
            for (const j of initJobs) {
                insertJob.run(j.title, j.company, j.location, j.job_type, j.role, j.desc, j.req, j.posted_by);
            }
        })();
        console.log('✅ Seeded initial jobs block.');
    }

    console.log('🎉 Jobs Migration successful!');
} catch (error) {
    console.error('❌ Jobs Migration failed:', error);
} finally {
    db.close();
}
