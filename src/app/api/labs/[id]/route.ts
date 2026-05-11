import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: labId } = await params;
        
        // Optional: Check if user is logged in to return progress
        const user = await getAuthUser();
        let userId = user?.id || null;

        const lab = await db.lab.findUnique({
            where: { id: labId },
            include: {
                challenges: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        points: true,
                        order: true,
                        // DO NOT select flag!
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!lab) {
            return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
        }

        let progress = null;
        let activeSession = null;

        if (userId) {
            progress = await db.userLabProgress.findUnique({
                where: {
                    userId_labId: {
                        userId: userId,
                        labId: labId
                    }
                }
            });

            activeSession = await db.labSession.findFirst({
                where: {
                    userId: userId,
                    labId: labId,
                    status: 'running',
                    expiresAt: { gt: new Date() }
                }
            });
        }

        return NextResponse.json({ lab, progress, activeSession });
    } catch (error) {
        console.error('Error fetching lab:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
