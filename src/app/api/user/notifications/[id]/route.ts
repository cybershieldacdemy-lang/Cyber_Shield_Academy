import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { statements } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as { id: string } | null;
    if (!payload?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = payload.id;

    const resolvedParams = await params;
    const { id } = resolvedParams;

    statements.markNotificationAsRead.run(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
