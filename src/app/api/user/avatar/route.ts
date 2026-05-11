import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 });
    }

    const payload = verifyToken(token) as { id: string } | null;
    if (!payload?.id) {
      return NextResponse.json({ error: 'جلستك منتهية الصلاحية' }, { status: 401 });
    }
    const userId = payload.id;

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرفاق ملف' }, { status: 400 });
    }

    // 3. Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'حجم الملف يتجاوز الحد المسموح (2MB)' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'صيغة الملف غير مدعومة. يسمح بـ JPG, PNG, WEBP' }, { status: 400 });
    }

    // 4. File preparation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get extension
    const ext = file.name.split('.').pop() || 'png';
    // Generate unique name
    const uniqueFilename = `${userId}-${crypto.randomBytes(4).toString('hex')}-${Date.now()}.${ext}`;
    
    // Directory path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    
    // Ensure dir exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Full file path
    const filePath = path.join(uploadDir, uniqueFilename);

    // 5. Save file
    await fs.writeFile(filePath, buffer);

    // Old avatar cleanup (optional but good practice)
    const currentUser = db.prepare('SELECT avatar FROM users WHERE id = ?').get(userId) as { avatar: string } | undefined;
    if (currentUser?.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
       try {
         const oldPath = path.join(process.cwd(), 'public', currentUser.avatar);
         await fs.unlink(oldPath);
       } catch(e) {
         console.warn("Failed to delete old avatar:", e);
       }
    }

    // 6. Update Database
    const avatarUrl = `/uploads/avatars/${uniqueFilename}`;
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarUrl, userId);

    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث الصورة بنجاح',
      avatar: avatarUrl 
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع أثناء الرفع' }, { status: 500 });
  }
}
