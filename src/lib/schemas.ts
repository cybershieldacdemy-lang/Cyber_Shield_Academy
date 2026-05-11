import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// 🛡️ AUTHENTICATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const LoginSchema = z.object({
    email: z.string().email("البريد الإلكتروني غير صالح"),
    password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const RegisterSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(50, "الاسم طويل جداً"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    password: z.string()
        .min(8, "كلمة المرور يجب أن تكون 8 خانات على الأقل")
        .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير")
        .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم")
        .regex(/[^A-Za-z0-9]/, "كلمة المرور يجب أن تحتوي على رمز خاص"),
    security_question: z.string().min(5, "سؤال الأمان قصير جداً"),
    security_answer: z.string().min(3, "إجابة الأمان قصيرة جداً").max(100, "إجابة الأمان طويلة جداً"),
    phone: z.string().max(20, "رقم الهاتف طويل جداً").optional().default(''),
    country: z.string().max(50).optional().default(''),
    bio: z.string().max(500, "النبذة طويلة جداً").optional().default(''),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
    account_type: z.enum(['student', 'instructor', 'researcher', 'analyst']).optional().default('student'),
});

// ═══════════════════════════════════════════════════════════════
// 👤 USER PROFILE SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const ProfileUpdateSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    avatar_url: z.string().url().optional(),
    bio: z.string().max(200).optional(),
});

export const PasswordChangeSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string()
        .min(8, "كلمة المرور الجديدة يجب أن تكون 8 خانات على الأقل")
        .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
        .regex(/[0-9]/, "يجب أن تحتوي على رقم")
        .regex(/[^A-Za-z0-9]/, "يجب أن تحتوي على رمز خاص"),
});

export const AccountDeletionSchema = z.object({
    password: z.string().min(1, "كلمة المرور مطلوبة لتأكيد الحذف"),
});
