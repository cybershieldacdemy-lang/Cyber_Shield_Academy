import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// GET /api/admin/assets
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const assets = db.prepare('SELECT * FROM assets ORDER BY createdAt DESC').all();
        return NextResponse.json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json({ message: 'Error fetching assets' }, { status: 500 });
    }
}

// POST /api/admin/assets
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { name, assetType, classification, owner, location } = body as any;

        if (!name || !assetType || !classification || !owner) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const stmt = db.prepare(`
            INSERT INTO assets (id, name, assetType, classification, owner, location)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, name, assetType, classification, owner, location || null);

        logAudit({
            action: 'ASSET_CREATE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'assets',
            resourceId: id,
            details: `Created asset: ${name} (${classification})`,
            severity: classification === 'Restricted' || classification === 'Confidential' ? 'high' : 'medium'
        });

        return NextResponse.json({ message: 'Asset created', id }, { status: 201 });
    } catch (error) {
        console.error('Error creating asset:', error);
        return NextResponse.json({ message: 'Error creating asset' }, { status: 500 });
    }
}
