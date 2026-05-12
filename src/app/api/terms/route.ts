import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';

// Cache for full terms listing (2-minute TTL)
let termsCache: Map<string, { data: any; expiry: number }> = new Map();

// GET: Fetch all terms (or paginated)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50') || 50, 1), 2000);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0);
        const q = searchParams.get('q') || '';

        // Check cache for non-search requests
        const cacheKey = `${limit}:${offset}:${q}`;
        const now = Date.now();
        const cached = termsCache.get(cacheKey);
        if (cached && cached.expiry > now) {
            return NextResponse.json(cached.data);
        }

        // Clean old cache entries periodically
        if (termsCache.size > 50) termsCache.clear();

        // Basic search filtering
        let query = 'SELECT * FROM terms';
        const params: any[] = [];

        if (q) {
            query += ' WHERE term_en LIKE ? OR term_ar LIKE ?';
            params.push(`%${q}%`, `%${q}%`);
        }

        query += ` ORDER BY term_en LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const terms = db.prepare(query).all(...params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as count FROM terms';
        const countParams: any[] = [];

        if (q) {
            countQuery += ' WHERE term_en LIKE ? OR term_ar LIKE ?';
            countParams.push(`%${q}%`, `%${q}%`);
        }

        const total = (db.prepare(countQuery).get(...countParams) as any).count;
        const data = { terms, total };

        // Cache for 2 minutes
        termsCache.set(cacheKey, { data, expiry: now + 120_000 });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching terms:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new term
export async function POST(req: Request) {
    try {
        // Basic Auth Check (In a real app, verify admin role from header/cookie)
        // const token = req.headers.get('Authorization')?.split(' ')[1];
        // if (!token || !verifyToken(token)) return NextResponse.json({message: 'Unauthorized'}, {status: 401});

        const body = await req.json();
        const { termEn, termAr, definitionEn, definitionAr, example, level, categoryId } = body;

        // Validation
        if (!termEn || !termAr || !definitionEn || !definitionAr || !level || !categoryId) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Insert 0 as ID to let autoincrement work? No, schema says INTEGER PRIMARY KEY which usually implies autoincrement if not provided.
        // However, init-db created it as INTEGER PRIMARY KEY.

        // We need to NOT pass ID if we want autoincrement, or pass null.
        const stmt = db.prepare(`
        INSERT INTO terms (term_en, term_ar, definition_en, definition_ar, example, level, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(termEn, termAr, definitionEn, definitionAr, example || '', level, categoryId);

        return NextResponse.json({ message: 'Term created', id: result.lastInsertRowid }, { status: 201 });

    } catch (error) {
        console.error('Error creating term:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
