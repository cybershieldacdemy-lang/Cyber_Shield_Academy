import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

// GET /api/documents/templates — returns all active templates
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    const templates = await db.documentTemplate.findMany({
      where,
      orderBy: { code: 'asc' },
      select: { id: true, code: true, titleAr: true, titleEn: true, category: true, schema: true },
    });

    return NextResponse.json({ templates });
  } catch (e) {
    console.error('[GET /api/documents/templates]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
