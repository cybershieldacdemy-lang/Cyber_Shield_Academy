/**
 * 👥 Team Detail & Join API
 * GET:  Get team details with members
 * POST: Join a team
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { getTeamDetails, joinTeam } from '@/lib/team-engine';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const team = getTeamDetails(id);
    if (!team) return NextResponse.json({ message: 'الفريق غير موجود' }, { status: 404 });
    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

    const { id } = await params;
    joinTeam(user.id, id);
    return NextResponse.json({ message: 'تم الانضمام للفريق بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'خطأ' }, { status: 400 });
  }
}
