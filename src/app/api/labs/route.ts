import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const labs = await db.lab.findMany({
            where: { isPublished: 1 },
            include: {
                _count: {
                    select: { challenges: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(labs);
    } catch (error) {
        console.error('Error fetching labs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
