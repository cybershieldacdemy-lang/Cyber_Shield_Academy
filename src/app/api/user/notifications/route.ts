import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { statements } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as { id: string } | null;
    if (!payload?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = payload.id;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    const notifications = statements.getUserNotifications.all(userId, limit, offset);
    const unreadCountRow = statements.getUnreadNotificationsCount.get(userId) as { count: number };

    return NextResponse.json({
      notifications,
      unreadCount: unreadCountRow?.count || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(_request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as { id: string } | null;
    if (!payload?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = payload.id;

    // Mark all as read
    statements.markAllNotificationsAsRead.run(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
