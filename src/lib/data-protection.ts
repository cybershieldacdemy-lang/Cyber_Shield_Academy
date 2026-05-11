/**
 * 🔐 Data Protection — حماية البيانات
 * Encryption, CSRF, Audit Logging, Data Integrity
 */
import { createCipheriv, createDecipheriv, randomBytes, createHmac, timingSafeEqual } from 'crypto';

// ═══════════════════════════════════════════════════════════════
// 🔑 ENCRYPTION CONFIG — إعدادات التشفير
// ═══════════════════════════════════════════════════════════════
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cs-default-key-32bytes-change!!'; // Must be 32 bytes
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const _AUTH_TAG_LENGTH = 16; // Used as documentation for GCM auth tag size
const HMAC_SECRET = process.env.HMAC_SECRET || 'hmac-secret-key-for-integrity-check';

// ═══════════════════════════════════════════════════════════════
// 🔒 AES-256-GCM ENCRYPTION — تشفير البيانات الحساسة
// ═══════════════════════════════════════════════════════════════

/** Encrypt sensitive data using AES-256-GCM */
export function encryptData(plainText: string): string {
    const iv = randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/** Decrypt data encrypted with AES-256-GCM */
export function decryptData(encryptedText: string): string {
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) throw new Error('Invalid encrypted format');

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
        const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch {
        throw new Error('فشل فك التشفير — البيانات تالفة أو مفتاح غير صحيح');
    }
}

// ═══════════════════════════════════════════════════════════════
// ✅ DATA INTEGRITY — سلامة البيانات (HMAC)
// ═══════════════════════════════════════════════════════════════

/** Generate HMAC signature for data integrity verification */
export function generateHMAC(data: string): string {
    return createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
}

/** Verify HMAC signature */
export function verifyHMAC(data: string, signature: string): boolean {
    const expected = generateHMAC(data);
    try {
        return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
        return false;
    }
}

/** Create a signed data package with integrity check */
export function signData(data: object): string {
    const json = JSON.stringify(data);
    const signature = generateHMAC(json);
    return Buffer.from(`${json}|${signature}`).toString('base64');
}

/** Verify and extract signed data */
export function verifySignedData<T = unknown>(signed: string): T | null {
    try {
        const decoded = Buffer.from(signed, 'base64').toString('utf8');
        const lastPipe = decoded.lastIndexOf('|');
        if (lastPipe === -1) return null;

        const json = decoded.substring(0, lastPipe);
        const signature = decoded.substring(lastPipe + 1);

        if (!verifyHMAC(json, signature)) return null;
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// 🛡️ CSRF TOKEN — حماية من هجمات CSRF
// ═══════════════════════════════════════════════════════════════
const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-token-key-changeme!';

/** Generate a CSRF token tied to a session/user */
export function generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(16).toString('hex');
    const payload = `${sessionId}:${timestamp}:${random}`;
    const signature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');
    return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/** Verify a CSRF token */
export function verifyCSRFToken(token: string, sessionId: string): boolean {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const parts = decoded.split(':');
        if (parts.length !== 4) return false;

        const [tokenSessionId, timestamp, random, signature] = parts;

        // Verify session match
        if (tokenSessionId !== sessionId) return false;

        // Verify not expired (1 hour)
        const tokenAge = Date.now() - parseInt(timestamp, 36);
        if (tokenAge > 3600000) return false;

        // Verify signature
        const payload = `${tokenSessionId}:${timestamp}:${random}`;
        const expectedSig = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');
        return timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature));
    } catch {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📊 AUDIT LOGGING — سجل العمليات الحساسة
// ═══════════════════════════════════════════════════════════════
import db, { statements } from '@/lib/db';

export type AuditAction =
    | 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'REGISTER'
    | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE'
    | 'DATA_ACCESS' | 'DATA_CREATE' | 'DATA_UPDATE' | 'DATA_DELETE'
    | 'ADMIN_ACTION' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY'
    | 'EXPORT_DATA' | 'BULK_OPERATION' | 'DELETE_ATTEMPT' | 'ACCOUNT_DELETED' | string;

export interface AuditEntry {
    action: AuditAction;
    userId?: string;
    ip: string;
    userAgent?: string;
    resource?: string;
    resourceId?: string;
    details?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

/** Log an audit event */
export function logAudit(entry: AuditEntry): void {
    try {
        statements.insertAuditLog.run(
            entry.action,
            entry.userId || null,
            entry.ip,
            entry.userAgent || null,
            entry.resource || null,
            entry.resourceId || null,
            entry.details || null,
            entry.severity || 'low'
        );
    } catch (error) {
        console.error('[AUDIT] Failed to log:', error);
    }
}

/** Get recent audit logs */
export function getAuditLogs(filters?: {
    userId?: string; action?: AuditAction; severity?: string;
    limit?: number; offset?: number;
}) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    // Fast path: no filters — use cached statement
    if (!filters?.userId && !filters?.action && !filters?.severity) {
        return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
    }

    // Filtered path: build dynamic query
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: unknown[] = [];

    if (filters?.userId) { query += ' AND user_id = ?'; params.push(filters.userId); }
    if (filters?.action) { query += ' AND action = ?'; params.push(filters.action); }
    if (filters?.severity) { query += ' AND severity = ?'; params.push(filters.severity); }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
}

// ═══════════════════════════════════════════════════════════════
// 🧹 SENSITIVE DATA MASKING — إخفاء البيانات الحساسة
// ═══════════════════════════════════════════════════════════════

/** Mask email: u***@domain.com */
export function maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!domain) return '***';
    return `${user[0]}${'*'.repeat(Math.max(user.length - 1, 2))}@${domain}`;
}

/** Mask phone: +966 *** ** 89 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return '***';
    if (phone.length <= 6) return phone.slice(0, 2) + '*'.repeat(phone.length - 2);
    return phone.slice(0, 4) + '*'.repeat(Math.max(0, phone.length - 6)) + phone.slice(-2);
}

/** Remove sensitive fields from user object */
export function sanitizeUserOutput(user: Record<string, unknown>): Record<string, unknown> {
    const { password: _password, security_answer: _security_answer, verification_code: _verification_code, ...safe } = user;
    return safe;
}

// ═══════════════════════════════════════════════════════════════
// 🔐 FIELD-LEVEL ENCRYPTION — تشفير حقول محددة
// ═══════════════════════════════════════════════════════════════

const ENCRYPTED_FIELDS = ['security_answer', 'phone'];

/** Encrypt specified fields in an object */
export function encryptFields(obj: Record<string, unknown>, fields: string[] = ENCRYPTED_FIELDS): Record<string, unknown> {
    const result = { ...obj };
    for (const field of fields) {
        if (typeof result[field] === 'string' && result[field]) {
            result[field] = encryptData(result[field] as string);
        }
    }
    return result;
}

/** Decrypt specified fields in an object */
export function decryptFields(obj: Record<string, unknown>, fields: string[] = ENCRYPTED_FIELDS): Record<string, unknown> {
    const result = { ...obj };
    for (const field of fields) {
        if (typeof result[field] === 'string' && result[field]) {
            try {
                result[field] = decryptData(result[field] as string);
            } catch {
                // Field might not be encrypted (legacy data)
            }
        }
    }
    return result;
}
