import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';
import { createHash, randomBytes } from 'crypto';

function generateSerial(code: string): string {
  const year = new Date().getFullYear();
  const rand = randomBytes(3).toString('hex').toUpperCase();
  return `DOC-${year}-${code}-${rand}`;
}

function generateSignature(submitterId: string, code: string, data: string): string {
  return createHash('sha256')
    .update(`${submitterId}:${code}:${data}:${Date.now()}`)
    .digest('hex');
}

// ─── GET /api/documents ───────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status    = searchParams.get('status');
    const category  = searchParams.get('category');
    const page      = parseInt(searchParams.get('page') || '1');
    const limit     = parseInt(searchParams.get('limit') || '20');
    const skip      = (page - 1) * limit;

    const isAdmin = user.role === 'admin';

    const where: Record<string, unknown> = {};
    if (!isAdmin) where.submitterId = user.id;          // non-admins see their own docs only
    if (status)   where.status = status;

    if (category) {
      where.template = { category };
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        include: {
          template: { select: { code: true, titleAr: true, titleEn: true, category: true } },
          submitter: { select: { id: true, name: true, email: true, avatar: true } },
          reviewer:  { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.document.count({ where }),
    ]);

    return NextResponse.json({ documents, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error('[GET /api/documents]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST /api/documents ──────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { templateCode, data } = await req.json();
    if (!templateCode || !data) {
      return NextResponse.json({ error: 'templateCode and data are required' }, { status: 400 });
    }

    const template = await db.documentTemplate.findUnique({ where: { code: templateCode } });
    if (!template || !template.isActive) {
      return NextResponse.json({ error: 'Template not found or inactive' }, { status: 404 });
    }

    const dataStr      = JSON.stringify(data);
    const serialNumber = generateSerial(template.code);
    const signature    = generateSignature(user.id, template.code, dataStr);

    const document = await db.document.create({
      data: {
        serialNumber,
        templateId:  template.id,
        submitterId: user.id,
        data:        dataStr,
        signature,
        status:      'PENDING',
        logs: {
          create: {
            action: 'CREATED',
            userId: user.id,
            notes:  `Document submitted by ${user.name}`,
          },
        },
      },
      include: { template: true, logs: true },
    });

    // Record audit log
    await db.auditLog.create({
      data: {
        action:     'DOCUMENT_SUBMIT',
        userId:     user.id,
        resource:   'Document',
        resourceId: document.id,
        details:    `Submitted document ${serialNumber} (${templateCode})`,
        severity:   'low',
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/documents]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
