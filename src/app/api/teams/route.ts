/**
 * 👥 Teams API
 * GET:  List teams / team leaderboard
 * POST: Create a new team
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { createTeam, getTeamLeaderboard } from '@/lib/team-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const leaderboard = getTeamLeaderboard(Math.min(limit, 50));
    return NextResponse.json({ teams: leaderboard });
  } catch (error) {
    console.error('Teams GET error:', error);
    return NextResponse.json({ message: 'خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

    const { name, description } = await request.json();
    if (!name || name.length < 3 || name.length > 30) {
      return NextResponse.json({ message: 'اسم الفريق يجب أن يكون بين 3 و 30 حرف' }, { status: 400 });
    }

    const teamId = createTeam(user.id, name.trim(), description?.trim() || '');
    return NextResponse.json({ message: 'تم إنشاء الفريق', teamId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'خطأ' }, { status: 400 });
  }
}
