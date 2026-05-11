import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userSession = { userId: user.id };

        const body = await request.json();
        const { labId, challengeId, flag } = body;

        if (!labId || !challengeId || !flag) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const challenge = await db.labChallenge.findUnique({
            where: { id: challengeId }
        });

        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        if (challenge.flag !== flag.trim()) {
            return NextResponse.json({ error: 'علم (Flag) غير صحيح', success: false }, { status: 200 });
        }

        // Correct flag! Update progress
        let progress = await db.userLabProgress.findUnique({
            where: { userId_labId: { userId: userSession.userId, labId: labId } }
        });

        if (!progress) {
            progress = await db.userLabProgress.create({
                data: {
                    userId: userSession.userId,
                    labId: labId,
                    challenges: JSON.stringify([challengeId]),
                    score: challenge.points
                }
            });
        } else {
            const completed = JSON.parse(progress.challenges);
            if (completed.includes(challengeId)) {
                return NextResponse.json({ error: 'لقد قمت بحل هذا التحدي مسبقاً', success: true, alreadySubmitted: true }, { status: 200 });
            }
            
            completed.push(challengeId);
            
            // Check if all challenges for this lab are completed
            const allChallenges = await db.labChallenge.findMany({ where: { labId: labId }, select: { id: true } });
            const isFullyCompleted = allChallenges.every(c => completed.includes(c.id));

            progress = await db.userLabProgress.update({
                where: { id: progress.id },
                data: {
                    challenges: JSON.stringify(completed),
                    score: progress.score + challenge.points,
                    completed: isFullyCompleted
                }
            });
        }

        // Add points to User global score
        await db.user.update({
            where: { id: userSession.userId },
            data: { points: { increment: challenge.points } }
        });

        return NextResponse.json({ success: true, message: 'تم إدخال العلم بنجاح!', points: challenge.points, progress });

    } catch (error) {
        console.error('Error verifying flag:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
