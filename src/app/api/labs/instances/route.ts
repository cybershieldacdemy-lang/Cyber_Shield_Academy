/**
 * 🐳 Lab Instance Management API
 * GET:    List user's active lab instances
 * POST:   Start a new lab instance
 * DELETE: Stop a lab instance
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { startLabInstance, stopLabInstance, getUserActiveLabs, getLabStats, validateLabFlag } from '@/lib/lab-manager';

// GET — List active labs
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

    const activeLabs = getUserActiveLabs(user.id);
    const stats = getLabStats();

    return NextResponse.json({
      activeLabs: activeLabs.map(lab => ({
        id: lab.id,
        labId: lab.labId,
        status: lab.status,
        targetIP: lab.targetIP,
        port: lab.containerPort,
        startedAt: lab.startedAt,
        expiresAt: lab.expiresAt,
        flagsTotal: lab.flags.length,
      })),
      platformStats: stats,
    });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ' }, { status: 500 });
  }
}

// POST — Start lab or submit flag
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

    const { labId, action, flag } = await request.json();

    if (!labId) {
      return NextResponse.json({ message: 'معرف المختبر مطلوب' }, { status: 400 });
    }

    // Submit flag
    if (action === 'submit_flag' && flag) {
      const result = validateLabFlag(user.id, labId, flag);
      return NextResponse.json(result);
    }

    // Start lab
    const instance = startLabInstance(user.id, labId);
    return NextResponse.json({
      message: 'تم بدء المختبر',
      instance: {
        id: instance.id,
        labId: instance.labId,
        targetIP: instance.targetIP,
        port: instance.containerPort,
        expiresAt: instance.expiresAt,
        status: instance.status,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'خطأ' }, { status: 400 });
  }
}

// DELETE — Stop lab
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

    const { labId } = await request.json();
    if (!labId) {
      return NextResponse.json({ message: 'معرف المختبر مطلوب' }, { status: 400 });
    }

    const stopped = stopLabInstance(user.id, labId);
    if (!stopped) {
      return NextResponse.json({ message: 'لا يوجد مختبر نشط بهذا المعرف' }, { status: 404 });
    }

    return NextResponse.json({ message: 'تم إيقاف المختبر' });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ' }, { status: 500 });
  }
}
