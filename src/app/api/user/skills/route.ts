/**
 * 🎯 Skill Profile API
 * GET: Build and return user skill profile + job matches
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { buildSkillProfile, matchJobs } from '@/lib/skill-profile';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const includeJobs = searchParams.get('jobs') !== 'false';

    const profile = buildSkillProfile(user.id);
    const response: Record<string, unknown> = { profile };

    if (includeJobs) {
      response.matchedJobs = matchJobs(user.id, 5);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Skill profile error:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
