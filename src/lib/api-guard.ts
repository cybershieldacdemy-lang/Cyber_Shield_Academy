/**
 * 🛡️ API Auth Guard — حارس المصادقة لنقاط الـ API
 * Reusable authentication & authorization middleware for API routes
 */
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { logAudit, sanitizeUserOutput } from '@/lib/data-protection';
import { sanitizeObject, hasInjection } from '@/lib/security';
import { checkIP } from '@/lib/firewall-service';
import { ZodSchema } from 'zod';

interface AuthUser {
    id: string;
    email: string;
    role: string;
    [key: string]: unknown;
}

interface GuardOptions {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    allowedRoles?: string[];
    allowedAccountTypes?: string[];
    sanitizeBody?: boolean;
    maxBodySize?: number;
    schema?: ZodSchema;
}

import db from '@/lib/db';

/** Extract authenticated user from request cookies */
export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const payload = verifyToken(token);
        if (!payload || !payload.id) return null;

        // Fetch fresh role from DB to instantly reflect role updates (e.g. user -> instructor)
        const dbUser = db.prepare('SELECT role, account_type FROM users WHERE id = ?').get(payload.id) as { role: string; account_type: string } | undefined;
        if (dbUser) {
            payload.role = dbUser.role;
            payload.account_type = dbUser.account_type;
        }

        return payload as AuthUser;
    } catch {
        return null;
    }
}

/** Get client IP from request headers */
export function getRequestIP(request: Request): string {
    const headers = new Headers(request.headers);
    return headers.get('x-real-ip')
        || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || '127.0.0.1';
}

/** Protect API route with authentication and authorization checks */
export async function guardRoute(
    request: Request,
    options: GuardOptions = {}
): Promise<{ user: AuthUser | null; error: NextResponse | null; body?: Record<string, unknown> }> {
    const {
        requireAuth = false,
        requireAdmin = false,
        allowedRoles,
        sanitizeBody: shouldSanitize = true,
        maxBodySize = 50000,
    } = options;

    const ip = getRequestIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // ═══════════════ 0. Firewall Check ═══════════════
    const firewallResult = checkIP(ip);

    if (!firewallResult.allowed) {
        logAudit({
            action: 'FIREWALL_BLOCK',
            ip,
            userAgent,
            resource: new URL(request.url).pathname,
            details: `تم حظر الطلب: ${firewallResult.reason}`,
            severity: 'medium',
        });

        return {
            user: null,
            error: NextResponse.json(
                { message: 'Access Denied (Firewall)', reason: firewallResult.reason },
                { status: 403 }
            )
        };
    }

    // ═══════════════ 1. Authentication Check ═══════════════
    const user = await getAuthUser();

    if (requireAuth && !user) {
        logAudit({
            action: 'PERMISSION_DENIED',
            ip,
            userAgent,
            resource: new URL(request.url).pathname,
            details: 'غير مصادق — محاولة وصول بدون تسجيل دخول',
            severity: 'medium',
        });

        return {
            user: null,
            error: NextResponse.json(
                { message: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            ),
        };
    }

    // ═══════════════ 2. Admin Check ═══════════════
    if (requireAdmin && user?.role !== 'admin') {
        logAudit({
            action: 'PERMISSION_DENIED',
            userId: user?.id,
            ip,
            userAgent,
            resource: new URL(request.url).pathname,
            details: 'محاولة وصول غير مصرح — ليس admin',
            severity: 'high',
        });

        return {
            user,
            error: NextResponse.json(
                { message: 'ليس لديك صلاحية الوصول' },
                { status: 403 }
            ),
        };
    }

    // ═══════════════ 3. Role Check ═══════════════
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        logAudit({
            action: 'PERMISSION_DENIED',
            userId: user.id,
            ip,
            userAgent,
            resource: new URL(request.url).pathname,
            details: `صلاحية غير كافية — الدور: ${user.role}`,
            severity: 'medium',
        });

        return {
            user,
            error: NextResponse.json(
                { message: 'ليس لديك الصلاحية المطلوبة' },
                { status: 403 }
            ),
        };
    }

    // ═══════════════ 4. Body Parsing & Sanitization ═══════════════
    let body: Record<string, unknown> | undefined;

    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE') {
        try {
            // Check body size
            const contentLength = parseInt(request.headers.get('content-length') || '0');
            if (contentLength > maxBodySize) {
                return {
                    user,
                    error: NextResponse.json(
                        { message: 'حجم الطلب كبير جداً' },
                        { status: 413 }
                    ),
                };
            }

            const clonedRequest = request.clone();
            const rawBody = await clonedRequest.json();

            // 🛡️ Zod Schema Validation
            if (options.schema) {
                const result = options.schema.safeParse(rawBody);
                if (!result.success) {
                    const errorMessages = (result.error as any).errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');

                    logAudit({
                        action: 'SUSPICIOUS_ACTIVITY',
                        userId: user?.id,
                        ip,
                        userAgent,
                        resource: new URL(request.url).pathname,
                        details: `فشل التحقق من صحة البيانات: ${errorMessages}`,
                        severity: 'medium',
                    });

                    return {
                        user,
                        error: NextResponse.json(
                            { message: 'بيانات غير صالحة', errors: result.error.format() },
                            { status: 400 }
                        ),
                    };
                }
                // Use the parsed/transformed data from Zod
                body = result.data as Record<string, unknown>;
            } else {
                body = rawBody as Record<string, unknown>;
            }

            // Check for injection patterns in body values (if not already validated by strict schema, but good as double check)
            if (body) {
                const bodyStr = JSON.stringify(body);
                if (hasInjection(bodyStr)) {
                    logAudit({
                        action: 'SUSPICIOUS_ACTIVITY',
                        userId: user?.id,
                        ip,
                        userAgent,
                        resource: new URL(request.url).pathname,
                        details: 'اكتشاف محتوى ضار في جسم الطلب',
                        severity: 'critical',
                    });

                    return {
                        user,
                        error: NextResponse.json(
                            { message: 'تم اكتشاف محتوى غير مسموح به' },
                            { status: 400 }
                        ),
                    };
                }

                // Sanitize all string fields (redundant if Zod handles it, but keeps legacy safety)
                if (shouldSanitize && !options.schema) {
                    body = sanitizeObject(body as Record<string, any>);
                }
            }
        } catch (e) {
            // Body parsing failed — not necessarily an error (maybe no body)
            console.error('Body parse/validation error:', e);
            return {
                user,
                error: NextResponse.json({ message: 'تنسيق البيانات غير صحيح' }, { status: 400 }),
            };
        }
    }

    return { user, error: null, body };
}

/** Utility to create a secure JSON response with stripped sensitive fields */
export function secureResponse(data: unknown, status: number = 200): NextResponse {
    // If data contains user objects, strip sensitive fields
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        if (obj.password || obj.security_answer) {
            return NextResponse.json(sanitizeUserOutput(obj), { status });
        }
    }

    return NextResponse.json(data, { status });
}
