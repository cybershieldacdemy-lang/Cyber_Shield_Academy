import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

// ─── GET /api/documents/[id] ─────────────────────────────────────────────────
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const document = await db.document.findUnique({
      where: { id },
      include: {
        template: true,
        submitter: { select: { id: true, name: true, email: true, avatar: true } },
        reviewer:  { select: { id: true, name: true } },
        logs: {
          include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Non-admins can only view their own documents
    if (user.role !== 'admin' && document.submitterId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ document });
  } catch (e) {
    console.error('[GET /api/documents/[id]]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH /api/documents/[id] ───────────────────────────────────────────────
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only admins can approve/reject
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { action, notes } = await req.json();

    const allowedActions = ['APPROVED', 'REJECTED', 'ARCHIVED'];
    if (!allowedActions.includes(action)) {
      return NextResponse.json({ error: `Invalid action. Must be one of: ${allowedActions.join(', ')}` }, { status: 400 });
    }

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await db.document.update({
      where: { id },
      data: {
        status:      action,
        reviewerId:  user.id,
        reviewNotes: notes ?? null,
        updatedAt:   new Date(),
        logs: {
          create: {
            action,
            userId: user.id,
            notes:  notes ?? `Document ${action.toLowerCase()} by ${user.name}`,
          },
        },
      },
      include: {
        template: true,
        submitter: { select: { id: true, name: true, email: true } },
        logs:      { orderBy: { createdAt: 'asc' } },
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action:     `DOCUMENT_${action}`,
        userId:     user.id,
        resource:   'Document',
        resourceId: id,
        details:    `Admin ${user.name} ${action.toLowerCase()} document ${existing.serialNumber}`,
        severity:   action === 'REJECTED' ? 'medium' : 'low',
      },
    });

    return NextResponse.json({ document: updated });
  } catch (e) {
    console.error('[PATCH /api/documents/[id]]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
