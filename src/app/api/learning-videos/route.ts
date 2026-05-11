import { NextRequest, NextResponse } from 'next/server';
import db, { statements } from '@/lib/db';

// Video listing cache (60s TTL)
const videoCache = new Map<string, { data: any; expiry: number }>();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'default'; // default, popular, latest
        const pathId = searchParams.get('path');
        const offset = (page - 1) * limit;

        // Cache key for reusable queries
        const cacheKey = `${page}:${limit}:${category || ''}:${level || ''}:${search || ''}:${sort}:${pathId || ''}`;
        const now = Date.now();
        const cached = videoCache.get(cacheKey);
        if (cached && cached.expiry > now) {
            return NextResponse.json(cached.data);
        }
        if (videoCache.size > 100) videoCache.clear();

        // Categories list
        if (searchParams.get('categories') === 'true') {
            const cats = statements.getVideoCategories.all();
            return NextResponse.json({ categories: cats.map((c: any) => c.category) });
        }

        // Popular videos
        if (sort === 'popular' && !category && !level && !search) {
            const videos = statements.getPopularVideos.all(limit);
            return NextResponse.json({ videos, total: videos.length });
        }

        // Latest videos
        if (sort === 'latest' && !category && !level && !search) {
            const videos = statements.getLatestVideos.all(limit);
            return NextResponse.json({ videos, total: videos.length });
        }

        // Path-based videos
        if (pathId) {
            const videos = statements.getVideosByPath.all(pathId);
            return NextResponse.json({ videos, total: videos.length });
        }

        // Dynamic query with filters
        let where = 'WHERE published = 1';
        const params: any[] = [];

        if (category) { where += ' AND category = ?'; params.push(category); }
        if (level) { where += ' AND level = ?'; params.push(level); }
        if (search) { where += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }

        let orderBy = 'ORDER BY sort_order ASC, id DESC';
        if (sort === 'popular') orderBy = 'ORDER BY views DESC';
        if (sort === 'latest') orderBy = 'ORDER BY created_at DESC';

        const countRow = db.prepare(`SELECT COUNT(*) as total FROM learning_videos ${where}`).get(...params) as any;
        const videos = db.prepare(`SELECT * FROM learning_videos ${where} ${orderBy} LIMIT ? OFFSET ?`).all(...params, limit, offset);

        const data = {
            videos,
            total: countRow.total,
            page,
            limit,
            totalPages: Math.ceil(countRow.total / limit),
        };

        videoCache.set(cacheKey, { data, expiry: Date.now() + 60_000 });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Learning videos error:', error);
        return NextResponse.json({ message: 'خطأ في جلب الفيديوهات' }, { status: 500 });
    }
}
