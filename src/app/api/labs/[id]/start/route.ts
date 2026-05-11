import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userSession = { userId: user.id };

        const { id: labId } = await params;

        // Check for existing active sessions globally or for this lab
        const existingSession = await db.labSession.findFirst({
            where: {
                userId: userSession.userId,
                status: 'running',
                expiresAt: { gt: new Date() }
            }
        });

        if (existingSession) {
            return NextResponse.json({ error: 'يوجد لديك جلسة مختبر نشطة بالفعل. قم بإنهائها أولاً.' }, { status: 400 });
        }

        // Mock container provisioning (In real world: call Docker API)
        const mockIp = `10.10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

        const newSession = await db.labSession.create({
            data: {
                userId: userSession.userId,
                labId: labId,
                status: 'running',
                ipAddress: mockIp,
                containerId: `sim-container-${Date.now()}`,
                expiresAt: expiresAt
            }
        });

        return NextResponse.json(newSession);

    } catch (error) {
        console.error('Error starting lab:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
