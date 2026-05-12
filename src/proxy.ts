import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod';

// ═══════════════════════════════════════════════════════════════
// 🔒 RATE LIMITING — حماية من هجمات DDoS والـ Brute Force
// ═══════════════════════════════════════════════════════════════
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const authRateLimit = new Map<string, { count: number; lastReset: number }>();

const WINDOW_SIZE = 60 * 1000;       // 1 minute window
const MAX_REQUESTS = 100;            // General: 100 req/min
const AUTH_WINDOW = 15 * 60 * 1000;  // Auth: 15 min window
const MAX_AUTH_ATTEMPTS = 10;        // Auth: 10 attempts per 15 min

// ═══════════════════════════════════════════════════════════════
// 🧹 MEMORY CLEANUP — منع تسرب الذاكرة
// ═══════════════════════════════════════════════════════════════
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupMaps() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    // Clean expired rate limit entries
    for (const [key, record] of rateLimit) {
        if (now - record.lastReset > WINDOW_SIZE) rateLimit.delete(key);
    }
    for (const [key, record] of authRateLimit) {
        if (now - record.lastReset > AUTH_WINDOW) authRateLimit.delete(key);
    }
    // Clean expired bans
    for (const [ip, expiry] of BANNED_IPS) {
        if (expiry <= now) BANNED_IPS.delete(ip);
    }
}

// ═══════════════════════════════════════════════════════════════
// 🛡️ BLOCKED PATTERNS — حظر أنماط الهجمات المعروفة
// ═══════════════════════════════════════════════════════════════
const BLOCKED_PATTERNS = [
    /\.\.\//,                    // Path traversal
    /<script/i,                  // XSS injection
    /javascript:/i,              // JS protocol injection
    /\bon\w+\s*=/i,               // Event handler injection
    /union\s+select/i,          // SQL injection
    /;\s*drop\s+table/i,        // SQL drop
    /;\s*delete\s+from/i,       // SQL delete
    /exec\s*\(/i,               // Command injection
    /eval\s*\(/i,               // Code execution
    /\$\{.*\}/,                 // Template injection
];

const BLOCKED_USER_AGENTS = [
    /sqlmap/i,                  // SQL injection tool
    /nikto/i,                   // Vulnerability scanner
    /nmap/i,                    // Network scanner
    /masscan/i,                 // Port scanner
    /dirbuster/i,              // Directory brute-force
    /gobuster/i,               // Directory brute-force
    /hydra/i,                  // Brute-force tool
];

// ═══════════════════════════════════════════════════════════════
// 🍯 HONEYPOT & ACTIVE DEFENSE — مصيدة المخترقين
// ═══════════════════════════════════════════════════════════════
const HONEYPOT_ROUTES = [
    '/admin/login.php',
    '/wp-admin',
    '/.env',
    '/backup.sql',
    '/config.json',
    '/server-status',
];

const BANNED_IPS = new Map<string, number>(); // IP -> Expiry Timestamp
const BAN_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ═══════════════════════════════════════════════════════════════
// 🌐 CORS — التحكم في الوصول عبر النطاقات
// ═══════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://cybershield.academy',
    'https://www.cybershield.academy',
];

function getClientIP(request: NextRequest): string {
    return request.headers.get('x-real-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || '127.0.0.1';
}

function checkRateLimit(map: Map<string, { count: number; lastReset: number }>, key: string, window: number, max: number): boolean {
    const now = Date.now();
    const record = map.get(key) || { count: 0, lastReset: now };

    if (now - record.lastReset > window) {
        record.count = 0;
        record.lastReset = now;
    }

    record.count++;
    map.set(key, record);

    return record.count > max;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // 🧹 Periodic memory cleanup
    cleanupMaps();

    // ═══════════════════════════════════════════════════════════
    // 1️⃣ BLOCK MALICIOUS USER AGENTS — حظر أدوات الاختراق
    // ═══════════════════════════════════════════════════════════
    if (BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
        return new NextResponse(JSON.stringify({ message: 'Access Denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 0️⃣ CHECK BANNED IPS — التحقق من العناوين المحظورة
    // ═══════════════════════════════════════════════════════════
    const banExpiry = BANNED_IPS.get(ip);
    if (banExpiry && banExpiry > Date.now()) {
        return new NextResponse(JSON.stringify({ message: 'Access Denied (IP Banned due to suspicious activity)' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 🍯 HONEYPOT CHECK — مصيدة المخترقين
    // ═══════════════════════════════════════════════════════════
    if (HONEYPOT_ROUTES.some(route => pathname.includes(route))) {
        console.warn(`[SECURITY] HONEYPOT TRIGGERED by ${ip} targeting ${pathname}`);
        BANNED_IPS.set(ip, Date.now() + BAN_DURATION);

        // Return strict 404 to not reveal honeypot nature, or strict 403
        return new NextResponse(JSON.stringify({ message: 'Not Found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 1️⃣ BLOCK MALICIOUS USER AGENTS — حظر أدوات الاختراق

    // ═══════════════════════════════════════════════════════════
    // 2️⃣ BLOCK MALICIOUS PAYLOADS — حظر أنماط الحقن
    // ═══════════════════════════════════════════════════════════
    const url = request.nextUrl.toString();
    if (BLOCKED_PATTERNS.some(pattern => pattern.test(url))) {
        console.warn(`[SECURITY] Blocked malicious request from ${ip}: ${pathname}`);
        return new NextResponse(JSON.stringify({ message: 'Bad Request' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 3️⃣ ADMIN ROUTE PROTECTION — حماية لوحة التحكم
    // ═══════════════════════════════════════════════════════════
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            if (payload.role !== 'admin') {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('error', 'unauthorized');
                return NextResponse.redirect(loginUrl);
            }
        } catch {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.set('token', '', { maxAge: 0, path: '/' });
            return response;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 3.5️⃣ TEACHER & INSTRUCTOR DASHBOARD PROTECTION — حماية لوحة المدرّب
    // ═══════════════════════════════════════════════════════════
    if (pathname.startsWith('/dashboard/teacher') || pathname.startsWith('/instructor')) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            if (payload.role !== 'teacher' && payload.role !== 'admin' && payload.role !== 'instructor' && payload.account_type !== 'instructor') {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('error', 'unauthorized');
                return NextResponse.redirect(loginUrl);
            }
        } catch {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.set('token', '', { maxAge: 0, path: '/' });
            return response;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🍯 HONEYPOT & ACTIVE DEFENSE — مصيدة المخترقين
    // ═══════════════════════════════════════════════════════════════


    // ═══════════════════════════════════════════════════════════════
    // 🛡️ AUTH RATE LIMITING — حماية من Brute Force
    // ═══════════════════════════════════════════════════════════════
    if (pathname === '/api/auth/login' || pathname === '/api/auth/register' || pathname === '/api/user/delete') {
        if (checkRateLimit(authRateLimit, ip, AUTH_WINDOW, MAX_AUTH_ATTEMPTS)) {
            console.warn(`[SECURITY] Auth rate limit exceeded for IP: ${ip}`);
            return new NextResponse(JSON.stringify({
                message: 'تم تجاوز عدد المحاولات المسموحة. حاول مرة أخرى بعد 15 دقيقة.'
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '900',
                },
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 5️⃣ GENERAL RATE LIMITING — تحديد عدد الطلبات
    // ═══════════════════════════════════════════════════════════
    if (pathname.startsWith('/api')) {
        if (checkRateLimit(rateLimit, ip, WINDOW_SIZE, MAX_REQUESTS)) {
            return new NextResponse(JSON.stringify({ message: 'Too many requests' }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '60',
                },
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 6️⃣ CORS — أمان الوصول عبر النطاقات
    // ═══════════════════════════════════════════════════════════
    const response = NextResponse.next();
    const origin = request.headers.get('origin');

    if (pathname.startsWith('/api')) {
        if (origin && ALLOWED_ORIGINS.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Max-Age', '86400');
        }

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : '',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 7️⃣ SECURITY HEADERS — رؤوس الأمان الشاملة
    // ═══════════════════════════════════════════════════════════

    // XSS Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // DNS Prefetch Control
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    // Prevent browser from caching sensitive data
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/admin')) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    // Content Security Policy — سياسة أمان المحتوى
    response.headers.set('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net ws: wss: http://localhost:3001 http://localhost:3002 stun:stun.l.google.com:19302 stun:stun1.l.google.com:19302",
        "frame-src 'self' https://www.youtube.com https://youtube.com",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'self'",
        "media-src 'self' blob:",
    ].join('; '));

    // Strict Transport Security (HSTS) — فرض HTTPS
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Permissions Policy — تقييد ميزات المتصفح
    response.headers.set('Permissions-Policy', [
        'camera=(self)',
        'microphone=(self)',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
    ].join(', '));

    // Cross-Origin policies
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js|html|map)$).*)'],
};
