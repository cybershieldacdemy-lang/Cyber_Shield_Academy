const Database = require('better-sqlite3');
const db = new Database('./prisma/data/cyber.db');

try {
  db.exec('ALTER TABLE labs ADD COLUMN scenario_ar TEXT;');
  console.log('Added scenario_ar to labs');
} catch (e) {
  console.log('scenario_ar might already exist', e.message);
}

try {
  db.exec('ALTER TABLE lab_scenarios ADD COLUMN points INTEGER DEFAULT 10;');
  console.log('Added points to lab_scenarios');
} catch (e) {
  console.log('points might already exist', e.message);
}

try {
  db.exec('ALTER TABLE audit_logs ADD COLUMN ipAddress TEXT DEFAULT "0.0.0.0";');
  console.log('Added ipAddress to audit_logs');
} catch (e) {
  console.log('ipAddress might already exist', e.message);
}

db.close();
