import db from '@/lib/db';
import path from 'path';
import fs from 'fs';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

export async function createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.db`;
    const destination = path.join(BACKUP_DIR, filename);

    console.log(`Starting backup to ${destination}...`);

    await db.backup(destination);

    console.log(`Backup completed: ${filename}`);
    return filename;
}

export function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];

    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.db'));

    return files.map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
            filename: file,
            size: stats.size,
            date: stats.mtime
        };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getBackupPath(filename: string): string | null {
    const safeName = path.basename(filename); // Prevent directory traversal
    const filePath = path.join(BACKUP_DIR, safeName);

    if (fs.existsSync(filePath)) {
        return filePath;
    }
    return null;
}
