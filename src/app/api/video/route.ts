import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const videoPath = searchParams.get('path');

        if (!videoPath) {
            return NextResponse.json({ message: 'مسار الفيديو مطلوب' }, { status: 400 });
        }

        // Security check: ensure user is authenticated and enrolled
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            console.error('[Video API] Unauthorized access attempt (no token)');
            return NextResponse.json({ message: 'غير مصرح لك بمشاهدة هذا الفيديو. يرجى تسجيل الدخول.' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            console.error('[Video API] Invalid token');
            return NextResponse.json({ message: 'جلسة غير صالحة.' }, { status: 401 });
        }

        const userId = payload.id;
        
        // Find the course associated with this video
        const lessonInfo = db.prepare('SELECT course_id FROM course_lessons WHERE video_url = ?').get(videoPath) as { course_id: number } | undefined;
        
        if (lessonInfo) {
            // Check if user is admin or teacher (they skip enrollment checks)
            const userRole = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as { role: string } | undefined;
            const isAdminOrTeacher = userRole && (userRole.role === 'admin' || userRole.role === 'teacher');

            if (!isAdminOrTeacher) {
                // Check if user is enrolled
                const enrollment = db.prepare('SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?').get(userId, lessonInfo.course_id);
                if (!enrollment) {
                    console.error(`[Video API] User ${userId} attempted to view video for course ${lessonInfo.course_id} without enrollment`);
                    return NextResponse.json({ message: 'يجب عليك التسجيل في هذه الدورة لمشاهدة الفيديو.' }, { status: 403 });
                }
            }
        }

        // Prevent directory traversal attacks
        const normalized = path.normalize(videoPath).replace(/^(\.\.(\/|\\|$))+/, '');
        if (normalized.includes('..')) {
            console.error(`[Video API] Path traversal attempt: ${videoPath}`);
            return NextResponse.json({ message: 'مسار غير صالح' }, { status: 400 });
        }

        const coursesDir = path.join(process.cwd(), 'courses');
        const fullPath = path.join(coursesDir, normalized);

        // Verify the file is within the courses directory
        if (!fullPath.startsWith(coursesDir)) {
            console.error(`[Video API] Invalid path outside bounds: ${fullPath}`);
            return NextResponse.json({ message: 'مسار غير صالح' }, { status: 400 });
        }

        if (!fs.existsSync(fullPath)) {
            console.error(`[Video API] File not found: ${fullPath}`);
            return NextResponse.json({ message: 'الفيديو غير موجود' }, { status: 404 });
        }

        const stat = fs.statSync(fullPath);
        const fileSize = stat.size;
        const ext = path.extname(fullPath).toLowerCase();

        const mimeTypes: Record<string, string> = {
            '.mp4': 'video/mp4',
            '.mkv': 'video/x-matroska',
            '.webm': 'video/webm',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.pdf': 'application/pdf',
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const range = request.headers.get('range');

        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        headers.set('Content-Type', contentType);
        if (contentType === 'application/pdf') {
            headers.set('Content-Disposition', 'inline; filename="' + encodeURIComponent(path.basename(fullPath)) + '"');
        }
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Cache-Control', 'public, max-age=86400');

        let start = 0;
        let end = fileSize - 1;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            start = parseInt(parts[0], 10);
            if (isNaN(start) || start < 0 || start >= fileSize) {
                headers.set('Content-Range', `bytes */${fileSize}`);
                return new NextResponse(null, { status: 416, headers });
            }
            end = parts[1] ? Math.min(parseInt(parts[1], 10), fileSize - 1) : fileSize - 1;
            headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        }

        const contentLength = end - start + 1;
        headers.set('Content-Length', contentLength.toString());

        const stream = new ReadableStream({
            async start(controller) {
                const fileStream = fs.createReadStream(fullPath, { start, end });
                try {
                    for await (const chunk of fileStream) {
                        try {
                            controller.enqueue(new Uint8Array(chunk as Buffer));
                        } catch (e) {
                            // Client disconnected / Controller closed
                            fileStream.destroy();
                            break;
                        }
                    }
                    try {
                        controller.close();
                    } catch (e) {}
                } catch (error) {
                    console.error('[Video API] Stream error:', error);
                    try {
                        controller.error(error);
                    } catch (e) {}
                }
            },
            cancel() {
                // Handled gracefully
            }
        });

        return new NextResponse(stream, {
            status: range ? 206 : 200,
            headers,
        });
    } catch (error) {
        console.error('[Video API] Critical streaming error:', error);
        return NextResponse.json({ message: 'خطأ في تشغيل الفيديو' }, { status: 500 });
    }
}
