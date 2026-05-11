import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userSession = { userId: user.id };

        const { id: labId } = await params;

        const activeSession = await db.labSession.findFirst({
            where: {
                userId: userSession.userId,
                labId: labId,
                status: 'running'
            }
        });

        if (!activeSession) {
            return NextResponse.json({ error: 'No active session found for this lab' }, { status: 404 });
        }

        // Mock destroying container (In real world: call Docker API)

        await db.labSession.update({
            where: { id: activeSession.id },
            data: { status: 'stopped' }
        });

        return NextResponse.json({ success: true, message: 'Lab stopped successfully' });

    } catch (error) {
        console.error('Error stopping lab:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
