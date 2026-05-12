import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { randomUUID } from 'crypto';

// GET /api/admin/vulnerabilities
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAdmin: true });
    if (error) return error;

    try {
        const vulns = db.prepare('SELECT * FROM vulnerabilities ORDER BY createdAt DESC').all();
        return NextResponse.json(vulns);
    } catch {
        return NextResponse.json({ message: 'Failed to fetch vulnerabilities' }, { status: 500 });
    }
}

// POST /api/admin/vulnerabilities
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAdmin: true });
    if (error) return error;

    const { title, description, severity, status, cve, affectedAssets, remediation } = body as any;

    try {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO vulnerabilities (id, title, description, severity, status, cve, affectedAssets, remediation, reportedBy, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `);

        stmt.run(
            id, title, description, severity, status || 'OPEN',
            cve || null, affectedAssets || null, remediation || null,
            user!.email
        );

        return NextResponse.json({ message: 'Vulnerability reported successfully', id }, { status: 201 });
    } catch {
        return NextResponse.json({ message: 'Failed to report vulnerability' }, { status: 500 });
    }
}
