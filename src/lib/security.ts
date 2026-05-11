/**
 * 🔒 Security Utilities — أدوات الأمان
 * Input sanitization, validation, and security helpers
 */

// ═══════════════════════════════════════════════════════════════
// 🧹 INPUT SANITIZATION — تنظيف المدخلات
// ═══════════════════════════════════════════════════════════════

/** Remove HTML tags and dangerous characters */
export function sanitizeHTML(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/** Strip all HTML tags completely */
export function stripTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}

/** Sanitize SQL-like patterns from input */
export function sanitizeSQL(input: string): string {
    return input
        .replace(/['";\\]/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '');
}

/** General sanitize: strip dangerous patterns, trim, limit length */
export function sanitize(input: string, maxLength: number = 1000): string {
    return stripTags(input).trim().slice(0, maxLength);
}

// ═══════════════════════════════════════════════════════════════
// ✅ VALIDATION — التحقق من البيانات
// ═══════════════════════════════════════════════════════════════

/** Validate email format */
export function isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && email.length <= 254;
}

/** Validate password strength */
export function isStrongPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'يجب أن تحتوي على حرف كبير واحد على الأقل' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'يجب أن تحتوي على حرف صغير واحد على الأقل' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'يجب أن تحتوي على رقم واحد على الأقل' };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: 'يجب أن تحتوي على رمز خاص واحد على الأقل' };
    return { valid: true, message: 'كلمة المرور قوية ✅' };
}

/** Validate URL format */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
}

/** Check if string contains injection patterns */
export function hasInjection(input: string): boolean {
    const patterns = [
        /<script/i, /javascript:/i, /on\w+\s*=/i,
        /union\s+select/i, /;\s*drop\s+/i, /;\s*delete\s+/i,
        /exec\s*\(/i, /eval\s*\(/i, /\$\{.*\}/,
    ];
    return patterns.some(p => p.test(input));
}

// ═══════════════════════════════════════════════════════════════
// 🔐 CRYPTO HELPERS — مساعدات التشفير
// ═══════════════════════════════════════════════════════════════

/** Generate a random token */
export function generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    return result;
}

/** Hash a string using SHA-256 */
export async function sha256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ═══════════════════════════════════════════════════════════════
// 📋 REQUEST VALIDATION — التحقق من الطلبات
// ═══════════════════════════════════════════════════════════════

/** Validate request body fields */
export function validateFields(body: Record<string, any>, required: string[]): { valid: boolean; missing: string[] } {
    const missing = required.filter(field => !body[field] || (typeof body[field] === 'string' && body[field].trim() === ''));
    return { valid: missing.length === 0, missing };
}

/** Sanitize all string fields in an object */
export function sanitizeObject(obj: Record<string, any>, maxLength: number = 1000): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitize(value, maxLength);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
