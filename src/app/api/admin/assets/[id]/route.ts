import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// PUT /api/admin/assets/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { id } = await params;
        const { name, assetType, classification, owner, location } = body as any;

        const stmt = db.prepare(`
            UPDATE assets 
            SET name = ?, assetType = ?, classification = ?, owner = ?, location = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = stmt.run(name, assetType, classification, owner, location || null, id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Asset not found' }, { status: 404 });
        }

        logAudit({
            action: 'ASSET_UPDATE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'assets',
            resourceId: id,
            details: `Updated asset: ${name}`,
            severity: 'medium'
        });

        return NextResponse.json({ message: 'Asset updated' });
    } catch (error) {
        console.error('Error updating asset:', error);
        return NextResponse.json({ message: 'Error updating asset' }, { status: 500 });
    }
}

// DELETE /api/admin/assets/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { id } = await params;

        // Get asset info for audit before deleting
        const asset = db.prepare('SELECT name, classification FROM assets WHERE id = ?').get(id) as any;

        const stmt = db.prepare('DELETE FROM assets WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Asset not found' }, { status: 404 });
        }

        logAudit({
            action: 'ASSET_DELETE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'assets',
            resourceId: id,
            details: `Deleted asset: ${asset?.name || id}`,
            severity: 'high'
        });

        return NextResponse.json({ message: 'Asset deleted' });
    } catch (error) {
        console.error('Error deleting asset:', error);
        return NextResponse.json({ message: 'Error deleting asset' }, { status: 500 });
    }
}
