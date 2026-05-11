/**
 * 🔐 GDPR User Data API
 * GET:    Export user data (Art. 15/20)
 * DELETE: Request account deletion (Art. 17)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import { exportUserData, deleteUserData } from '@/lib/gdpr';

// GET — Export all user data
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = exportUserData(user.id);
    
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="cybershield-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Export failed' }, { status: 500 });
  }
}

// DELETE — Request account and data deletion
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { confirmation } = body as { confirmation?: string };

    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json({
        message: 'يجب تأكيد الحذف بإرسال: {"confirmation": "DELETE_MY_ACCOUNT"}',
        required: 'DELETE_MY_ACCOUNT',
      }, { status: 400 });
    }

    const result = deleteUserData(user.id, user.id);

    // Clear auth cookies
    const response = NextResponse.json({
      success: true,
      message: 'تم حذف حسابك وجميع بياناتك بنجاح',
      tablesCleared: result.tables.length,
    });

    response.cookies.set('token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Deletion failed' }, { status: 500 });
  }
}
