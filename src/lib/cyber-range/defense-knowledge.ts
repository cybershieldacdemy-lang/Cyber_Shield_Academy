/**
 * 🛡️ Defense Knowledge System
 * Post-completion defense reports for each attack scenario.
 * Shows what the vulnerability was, how to prevent it, and references.
 */

export interface DefenseReport {
    scenarioId: string;
    title_ar: string;
    title_en: string;
    vulnerability: {
        name: string;
        description_ar: string;
        severity: 'Low' | 'Medium' | 'High' | 'Critical';
        cwe?: string;
    };
    howItWorks_ar: string;
    prevention_ar: string[];
    secureCode?: string;
    references: { label: string; url: string }[];
    mitre_attack?: string;
}

export const DEFENSE_REPORTS: Record<string, DefenseReport> = {
    'web-recon-101': {
        scenarioId: 'web-recon-101',
        title_ar: 'تقرير الدفاع: استطلاع خادم الويب',
        title_en: 'Defense Report: Web Server Recon',
        vulnerability: {
            name: 'Information Disclosure',
            description_ar: 'تسريب معلومات حساسة عبر ملفات يمكن الوصول إليها علنياً مثل robots.txt وملفات النسخ الاحتياطي.',
            severity: 'Medium',
            cwe: 'CWE-200'
        },
        howItWorks_ar: 'المهاجم يبدأ باستطلاع الخادم باستخدام أدوات مثل Nmap لاكتشاف المنافذ المفتوحة، ثم يبحث عن ملفات مكشوفة مثل robots.txt وملفات الإعدادات التي قد تحتوي على معلومات حساسة.',
        prevention_ar: [
            'لا تضع معلومات حساسة في robots.txt — هذا الملف عام ويمكن لأي شخص قراءته',
            'احذف ملفات النسخ الاحتياطي من مجلد الويب العام',
            'استخدم .htaccess أو إعدادات nginx لمنع الوصول للمجلدات الحساسة',
            'أغلق المنافذ غير الضرورية (مثل 3306 MySQL)',
            'استخدم جدار حماية لتقييد الوصول للخدمات الداخلية'
        ],
        secureCode: `# Nginx — حظر الوصول للمجلدات الحساسة
location ~ /(admin|backup|config) {
    deny all;
    return 403;
}

# إخفاء إصدارات الخدمات
server_tokens off;

# جدار حماية — أغلق المنافذ غير الضرورية
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3306/tcp`,
        references: [
            { label: 'OWASP Information Disclosure', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
            { label: 'CWE-200', url: 'https://cwe.mitre.org/data/definitions/200.html' }
        ],
        mitre_attack: 'T1595 - Active Scanning'
    },

    'sqli-basics': {
        scenarioId: 'sqli-basics',
        title_ar: 'تقرير الدفاع: حقن SQL',
        title_en: 'Defense Report: SQL Injection',
        vulnerability: {
            name: 'SQL Injection',
            description_ar: 'ثغرة تسمح للمهاجم بحقن أوامر SQL خبيثة في استعلامات قاعدة البيانات عبر مدخلات المستخدم غير المعقمة.',
            severity: 'Critical',
            cwe: 'CWE-89'
        },
        howItWorks_ar: 'عندما يدخل المستخدم بيانات في حقل بحث أو نموذج تسجيل دخول، يتم دمج هذه البيانات مباشرة في استعلام SQL. المهاجم يحقن أوامر SQL إضافية مثل \' OR 1=1-- للتلاعب بالاستعلام واستخراج بيانات غير مصرح بها.',
        prevention_ar: [
            'استخدم Prepared Statements (استعلامات مُعدّة) دائماً — لا تدمج مدخلات المستخدم مباشرة في SQL',
            'استخدم ORM (مثل Prisma, Sequelize) بدلاً من كتابة SQL يدوياً',
            'نظّف وتحقق من جميع المدخلات (Input Validation)',
            'طبّق مبدأ الحد الأدنى من الصلاحيات لحساب قاعدة البيانات',
            'استخدم Web Application Firewall (WAF)'
        ],
        secureCode: `// ❌ كود غير آمن (عرضة لحقن SQL)
const query = "SELECT * FROM users WHERE name = '" + userInput + "'";

// ✅ كود آمن (Prepared Statement)
const stmt = db.prepare("SELECT * FROM users WHERE name = ?");
const result = stmt.get(userInput);

// ✅ TypeScript + Prisma (آمن تلقائياً)
const user = await prisma.user.findFirst({
    where: { name: userInput }
});`,
        references: [
            { label: 'OWASP SQL Injection', url: 'https://owasp.org/www-community/attacks/SQL_Injection' },
            { label: 'OWASP Top 10 - A03 Injection', url: 'https://owasp.org/Top10/A03_2021-Injection/' }
        ],
        mitre_attack: 'T1190 - Exploit Public-Facing Application'
    },

    'ssh-bruteforce': {
        scenarioId: 'ssh-bruteforce',
        title_ar: 'تقرير الدفاع: هجوم التخمين',
        title_en: 'Defense Report: Brute Force',
        vulnerability: {
            name: 'Weak Credentials / No Brute Force Protection',
            description_ar: 'استخدام كلمات مرور ضعيفة وعدم وجود حماية ضد محاولات تسجيل الدخول المتكررة.',
            severity: 'High',
            cwe: 'CWE-307'
        },
        howItWorks_ar: 'المهاجم يستخدم أدوات مثل Hydra لتجربة آلاف كلمات المرور تلقائياً ضد خدمة SSH حتى يجد الكلمة الصحيحة.',
        prevention_ar: [
            'استخدم كلمات مرور قوية (12+ حرف، أرقام، رموز)',
            'ثبّت Fail2Ban لحظر عناوين IP بعد محاولات فاشلة متكررة',
            'استخدم مفاتيح SSH بدلاً من كلمات المرور',
            'غيّر منفذ SSH الافتراضي (22)',
            'فعّل المصادقة الثنائية (2FA)',
            'قيّد الوصول بجدار حماية (فقط IPs مسموحة)'
        ],
        secureCode: `# Fail2Ban — إعداد حماية SSH
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
maxretry = 3
bantime = 3600

# إلغاء تفعيل تسجيل الدخول بكلمة مرور
# /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3`,
        references: [
            { label: 'OWASP Brute Force', url: 'https://owasp.org/www-community/attacks/Brute_force_attack' },
            { label: 'CWE-307', url: 'https://cwe.mitre.org/data/definitions/307.html' }
        ],
        mitre_attack: 'T1110 - Brute Force'
    },

    'priv-escalation': {
        scenarioId: 'priv-escalation',
        title_ar: 'تقرير الدفاع: تصعيد الصلاحيات',
        title_en: 'Defense Report: Privilege Escalation',
        vulnerability: {
            name: 'Sudo Misconfiguration & SUID Abuse',
            description_ar: 'إعدادات sudo خاطئة تمنح صلاحيات مفرطة لبرامج يمكن استغلالها للحصول على root.',
            severity: 'Critical',
            cwe: 'CWE-269'
        },
        howItWorks_ar: 'عندما يُمنح مستخدم عادي صلاحية تشغيل برامج معينة بـ sudo (مثل vim أو find)، يمكنه استغلال هذه البرامج لفتح shell بصلاحيات root. مثلاً: sudo vim ثم :!/bin/bash',
        prevention_ar: [
            'راجع إعدادات sudo بانتظام (sudo -l لكل مستخدم)',
            'لا تمنح sudo لبرامج يمكن تشغيل أوامر shell منها (vim, less, find, awk, etc.)',
            'استخدم مبدأ الحد الأدنى من الصلاحيات (Least Privilege)',
            'راقب ملفات SUID وأزِل الصلاحيات غير الضرورية',
            'استخدم AppArmor أو SELinux لتقييد الصلاحيات'
        ],
        secureCode: `# ❌ خطير — يسمح بتصعيد الصلاحيات
john ALL=(ALL) NOPASSWD: /usr/bin/vim

# ✅ آمن — أوامر محددة بدون إمكانية shell escape
john ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx

# البحث عن ملفات SUID وإزالة الصلاحيات
find / -perm -4000 -type f 2>/dev/null
chmod u-s /usr/bin/suspicious_binary`,
        references: [
            { label: 'GTFOBins - Unix Binaries for Privilege Escalation', url: 'https://gtfobins.github.io/' },
            { label: 'OWASP Privilege Escalation', url: 'https://owasp.org/www-project-web-security-testing-guide/' }
        ],
        mitre_attack: 'T1548 - Abuse Elevation Control Mechanism'
    },

    'log-forensics': {
        scenarioId: 'log-forensics',
        title_ar: 'تقرير الدفاع: التحليل الجنائي',
        title_en: 'Defense Report: Log Forensics',
        vulnerability: {
            name: 'Insufficient Logging & Monitoring',
            description_ar: 'عدم وجود نظام كشف ومراقبة فعال سمح للمهاجم بالبقاء دون اكتشاف.',
            severity: 'High',
            cwe: 'CWE-778'
        },
        howItWorks_ar: 'المهاجم استخدم هجوم تخمين للحصول على كلمة مرور SSH، ثم رفع web shell واستخدمه لتنفيذ أوامر على الخادم وسرقة بيانات.',
        prevention_ar: [
            'ثبّت SIEM (مثل Wazuh, ELK Stack) لمراقبة مركزية للسجلات',
            'فعّل تنبيهات فورية لمحاولات الدخول الفاشلة المتكررة',
            'راقب رفع الملفات وتنفيذ الأوامر على خوادم الويب',
            'استخدم File Integrity Monitoring (FIM)',
            'احتفظ بنسخ احتياطية من السجلات في موقع منفصل',
            'راجع السجلات دورياً (Daily Log Review)'
        ],
        references: [
            { label: 'OWASP Top 10 - A09 Logging', url: 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/' },
        ],
        mitre_attack: 'T1059 - Command and Scripting Interpreter'
    },

    'xss-attack': {
        scenarioId: 'xss-attack',
        title_ar: 'تقرير الدفاع: هجوم XSS',
        title_en: 'Defense Report: XSS Attack',
        vulnerability: {
            name: 'Cross-Site Scripting (XSS)',
            description_ar: 'ثغرة تسمح بحقن كود JavaScript خبيث في صفحات الويب التي يراها مستخدمون آخرون.',
            severity: 'High',
            cwe: 'CWE-79'
        },
        howItWorks_ar: 'المهاجم يحقن كود JavaScript في حقل التعليقات. عندما يزور مستخدم آخر الصفحة، يتم تنفيذ الكود في متصفحه. يمكن سرقة ملفات تعريف الارتباط أو إعادة توجيهه لموقع خبيث.',
        prevention_ar: [
            'نظّف جميع المخرجات (Output Encoding) — استخدم HTML entities',
            'استخدم Content Security Policy (CSP) headers',
            'استخدم HttpOnly و Secure flags على ملفات تعريف الارتباط',
            'تحقق من المدخلات في الجانب الخادم (Server-side Validation)',
            'استخدم مكتبات مثل DOMPurify لتنظيف HTML'
        ],
        secureCode: `// ❌ غير آمن — يعرض المدخلات مباشرة
element.innerHTML = userComment;

// ✅ آمن — يستخدم textContent بدلاً من innerHTML
element.textContent = userComment;

// ✅ React (آمن تلقائياً)
<p>{userComment}</p>  // React يعقّم المحتوى تلقائياً

// ✅ CSP Header (في Next.js middleware)
headers: {
  'Content-Security-Policy': "script-src 'self'"
}`,
        references: [
            { label: 'OWASP XSS Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
        ],
        mitre_attack: 'T1189 - Drive-by Compromise'
    },

    'network-pivot': {
        scenarioId: 'network-pivot',
        title_ar: 'تقرير الدفاع: التنقل عبر الشبكة',
        title_en: 'Defense Report: Network Pivoting',
        vulnerability: {
            name: 'Insufficient Network Segmentation',
            description_ar: 'عدم وجود تقسيم شبكي كافٍ يسمح للمهاجم بالتنقل من خادم إلى آخر.',
            severity: 'Critical',
            cwe: 'CWE-653'
        },
        howItWorks_ar: 'بعد اختراق الخادم الخارجي، استخدمه المهاجم كنقطة انطلاق لفحص الشبكة الداخلية والوصول لخوادم أخرى غير محمية.',
        prevention_ar: [
            'طبّق تقسيم الشبكة (Network Segmentation) — افصل الخوادم الخارجية عن الداخلية',
            'استخدم DMZ للخوادم المواجهة للإنترنت',
            'طبّق قواعد جدار حماية صارمة بين الشبكات الفرعية',
            'استخدم Zero Trust Architecture — لا تثق بأي جهاز',
            'راقب حركة المرور الداخلية (East-West Traffic)',
            'استخدم VPN للوصول عن بُعد بدلاً من SSH المباشر'
        ],
        references: [
            { label: 'NIST Network Segmentation', url: 'https://www.nist.gov/cybersecurity' },
        ],
        mitre_attack: 'T1021 - Remote Services'
    },

    'incident-response': {
        scenarioId: 'incident-response',
        title_ar: 'تقرير الدفاع: الاستجابة للحوادث',
        title_en: 'Defense Report: Incident Response',
        vulnerability: {
            name: 'Ransomware Attack via Phishing',
            description_ar: 'هجوم برمجية فدية نجح عبر بريد تصيد إلكتروني أدى لتنزيل وتشغيل برمجية خبيثة.',
            severity: 'Critical',
            cwe: 'CWE-506'
        },
        howItWorks_ar: 'تلقى الموظف بريداً إلكترونياً مزيفاً يحتوي على مرفق .pdf.exe. بعد فتح المرفق، تم تحميل البرمجية الخبيثة التي شفّرت جميع الملفات وحذفت النسخ الاحتياطية.',
        prevention_ar: [
            'درّب الموظفين على اكتشاف رسائل التصيد (Security Awareness Training)',
            'استخدم email filtering وanti-phishing gateway',
            'حافظ على نسخ احتياطية منتظمة (3-2-1 rule)',
            'استخدم Endpoint Detection & Response (EDR)',
            'طبّق مبدأ الحد الأدنى من الصلاحيات',
            'عطّل تشغيل macros والملفات التنفيذية من المرفقات',
            'ضع خطة استجابة للحوادث (Incident Response Plan)',
            'اختبر خطة الاستجابة دورياً (Tabletop Exercises)'
        ],
        references: [
            { label: 'NIST SP 800-61 - Incident Handling Guide', url: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final' },
        ],
        mitre_attack: 'T1486 - Data Encrypted for Impact'
    }
};
