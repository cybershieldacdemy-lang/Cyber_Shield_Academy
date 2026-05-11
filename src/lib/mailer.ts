import nodemailer from 'nodemailer';

// It expects standard SMTP credentials in .env
// SMTP_HOST = smtp.gmail.com
// SMTP_PORT = 465 or 587
// SMTP_USER = your email
// SMTP_PASS = your app password

let transporter: nodemailer.Transporter | null = null;

try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
} catch (error) {
    console.error("Mailer initialization error:", error);
}

export async function sendMeetingEmail(toEmail: string, role: 'student' | 'instructor', details: {
    studentName: string,
    instructorName: string,
    sessionTitle: string,
    scheduledAt: string,
    meetLink: string
}) {
    if (!transporter) {
        console.warn(`[MAILER] Cannot send email. Missing SMTP credentials. Mock Output:\nTo: ${toEmail}\nLink: ${details.meetLink}`);
        return;
    }

    const { studentName, instructorName, sessionTitle, scheduledAt, meetLink } = details;
    const formattedDate = new Date(scheduledAt).toLocaleString('ar-EG');
    
    let subject = '';
    let htmlContent = '';

    if (role === 'student') {
        subject = `✅ تأكيد حجز الجلسة: ${sessionTitle}`;
        htmlContent = `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2da5c7;">تم تأكيد حجز جلستك!</h2>
                <p>أهلاً ${studentName}،</p>
                <p>لقد تم حجز جلستك بنجاح مع المدرّب <strong>${instructorName}</strong>.</p>
                <ul>
                    <li><strong>الموضوع:</strong> ${sessionTitle}</li>
                    <li><strong>الموعد:</strong> ${formattedDate}</li>
                </ul>
                <p>يمكنك الدخول إلى غرفة Google Meet في الوقت المحدد عبر الرابط التالي:</p>
                <a href="${meetLink}" style="display: inline-block; padding: 10px 20px; background-color: #25d366; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">الانضمام للجلسة عبر Google Meet 🎥</a>
                <p style="margin-top: 20px; font-size: 12px; color: #777;">* لا يمكن الدخول للجلسة إلا قبل بدايتها بـ 10 دقائق كحد أقصى.</p>
                <p>نتمنى لك جلسة مثمرة!<br/>أكاديمية Cyber Shield</p>
            </div>
        `;
    } else {
        subject = `📅 حجز جلسة جديدة: ${sessionTitle}`;
        htmlContent = `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #c8962e;">طلب جلسة توجيهية جديد</h2>
                <p>مرحباً ${instructorName}،</p>
                <p>قام الطالب <strong>${studentName}</strong> بحجز جلسة معك.</p>
                <ul>
                    <li><strong>الموضوع:</strong> ${sessionTitle}</li>
                    <li><strong>الموعد:</strong> ${formattedDate}</li>
                </ul>
                <p>تم سحب رابط Google Meet التلقائي للجلسة. يرجى الدخول للرابط في الوقت المحدد:</p>
                <a href="${meetLink}" style="display: inline-block; padding: 10px 20px; background-color: #c8962e; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">بدء الجلسة عبر Google Meet 🎥</a>
                <p>يمكنك أيضاً الوصول للرابط عبر لوحة تحكم المدرّب.</p>
                <p>بالتوفيق،<br/>أكاديمية Cyber Shield</p>
            </div>
        `;
    }

    try {
        await transporter.sendMail({
            from: `"Cyber Shield Academy" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject,
            html: htmlContent
        });
        console.log(`Email successfully sent to ${toEmail}`);
    } catch (error) {
        console.error("Failed to send email to", toEmail, error);
    }
}

export async function sendPasswordResetEmail(toEmail: string, resetLink: string) {
    if (!transporter) {
        console.warn(`[MAILER] Cannot send email. Missing SMTP credentials. Mock Output:\nTo: ${toEmail}\nReset Link: ${resetLink}`);
        return;
    }

    const subject = `🔐 إعادة ضبط كلمة المرور - Cyber Shield Academy`;
    const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2da5c7;">استعادة كلمة المرور</h2>
            <p>لقد تلقينا طلباً لإعادة ضبط كلمة المرور الخاصة بحسابك.</p>
            <p>يمكنك تغيير كلمة المرور عبر النقر على الرابط التالي (صالح لمدة 15 دقيقة):</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #c8962e; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">إعادة ضبط كلمة المرور 🔐</a>
            <p style="margin-top: 20px; font-size: 12px; color: #777;">إذا لم تقم بطلب هذا، يرجى تجاهل هذه الرسالة، حسابك آمن.</p>
            <p>أكاديمية Cyber Shield</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Cyber Shield Academy" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject,
            html: htmlContent
        });
        console.log(`Password reset email successfully sent to ${toEmail}`);
    } catch (error) {
        console.error("Failed to send reset email to", toEmail, error);
    }
}

// ═══════════════════════════════════════════════════════════
// 🎉 Welcome Email — بريد الترحيب عند التسجيل
// ═══════════════════════════════════════════════════════════
export async function sendWelcomeEmail(toEmail: string, userName: string) {
    if (!transporter) {
        console.warn(`[MAILER] Mock Welcome Email → To: ${toEmail}, Name: ${userName}`);
        return;
    }

    const subject = `🛡️ مرحباً بك في أكاديمية الدرع السيبراني!`;
    const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: auto;">
            <div style="background: linear-gradient(135deg, #0b0e14, #1a1f2e); padding: 30px; border-radius: 12px; text-align: center;">
                <h1 style="color: #c8962e; margin: 0; font-size: 28px;">🛡️ Cyber Shield Academy</h1>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 5px;">أكاديمية الدرع السيبراني</p>
            </div>
            <div style="padding: 30px; background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                <h2 style="color: #1f2937;">مرحباً ${userName}! 🎉</h2>
                <p>تم إنشاء حسابك بنجاح في أكاديمية الدرع السيبراني. أنت الآن جزء من مجتمع متخصص في أمن المعلومات والأمن السيبراني.</p>
                <p><strong>ما يمكنك فعله الآن:</strong></p>
                <ul style="padding-right: 20px;">
                    <li>📚 تصفح الدورات التدريبية المتقدمة</li>
                    <li>🧪 خض تحديات CTF واختبر مهاراتك</li>
                    <li>🧑‍🏫 احجز جلسات مباشرة مع خبراء</li>
                    <li>📖 تعلم أكثر من 1300 مصطلح سيبراني</li>
                </ul>
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 12px 32px; background: #c8962e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">ابدأ رحلتك الآن 🚀</a>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">هذه الرسالة تلقائية من أكاديمية Cyber Shield. لا تحتاج للرد عليها.</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Cyber Shield Academy" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject,
            html: htmlContent
        });
        console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
        console.error("Failed to send welcome email to", toEmail, error);
    }
}

// ═══════════════════════════════════════════════════════════
// 🔔 Generic Notification Email — إشعارات عامة
// ═══════════════════════════════════════════════════════════
export async function sendNotificationEmail(toEmail: string, options: {
    subject: string;
    title: string;
    body: string;
    ctaText?: string;
    ctaLink?: string;
}) {
    if (!transporter) {
        console.warn(`[MAILER] Mock Notification → To: ${toEmail}, Subject: ${options.subject}`);
        return;
    }

    const { subject, title, body, ctaText, ctaLink } = options;
    const ctaButton = ctaText && ctaLink 
        ? `<div style="text-align: center; margin-top: 20px;"><a href="${ctaLink}" style="display: inline-block; padding: 12px 28px; background: #c8962e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">${ctaText}</a></div>` 
        : '';

    const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: auto;">
            <div style="background: linear-gradient(135deg, #0b0e14, #1a1f2e); padding: 20px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h3 style="color: #c8962e; margin: 0;">🛡️ Cyber Shield Academy</h3>
            </div>
            <div style="padding: 25px 30px; background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
                <div style="color: #374151; font-size: 14px;">${body}</div>
                ${ctaButton}
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 25px 0 15px;" />
                <p style="font-size: 11px; color: #9ca3af; text-align: center;">أكاديمية الدرع السيبراني — رسالة تلقائية</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Cyber Shield Academy" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject,
            html: htmlContent
        });
        console.log(`Notification email sent to ${toEmail}: ${subject}`);
    } catch (error) {
        console.error("Failed to send notification email to", toEmail, error);
    }
}
