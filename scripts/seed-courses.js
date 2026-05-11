const Database = require('better-sqlite3');
const db = new Database('cyber.db');

// Recreate courses table with correct schema
db.exec('DROP TABLE IF EXISTS courses');
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    level TEXT NOT NULL DEFAULT 'beginner',
    category TEXT DEFAULT 'general',
    lessons INTEGER DEFAULT 0,
    duration TEXT DEFAULT '',
    image TEXT DEFAULT '',
    instructor TEXT DEFAULT '',
    price REAL DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level)');

const courses = [
    {
        title_ar: '15 كتاب حول الهكر الأخلاقي',
        title_en: 'Ethical Hacking Books Collection',
        description_ar: 'مجموعة شاملة من 15 كتاباً متخصصاً في الهكر الأخلاقي واختبار الاختراق، تغطي المفاهيم الأساسية والتقنيات المتقدمة في أمن المعلومات',
        description_en: 'A comprehensive collection of 15 specialized books on ethical hacking and penetration testing, covering fundamental concepts and advanced information security techniques',
        level: 'beginner',
        category: 'ethical_hacking',
        lessons: 15,
        duration: 'كتب PDF',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'أدوات كالي لينكس الشاملة',
        title_en: 'Kali Linux Tools Comprehensive Course',
        description_ar: 'دورة شاملة في أدوات كالي لينكس تشمل أدوات جمع المعلومات (Nmap, Zenmap, Maltego, DNSenum)، أدوات كسر كلمات المرور (Hydra, John, Medusa)، أدوات اختراق الواي فاي (Aircrack-ng, Wifite)، وأدوات فحص الثغرات (Wireshark, OWASP-ZAP, Metasploit)',
        description_en: 'Comprehensive Kali Linux tools course covering information gathering (Nmap, Zenmap, Maltego, DNSenum), password cracking (Hydra, John, Medusa), WiFi hacking (Aircrack-ng, Wifite), and vulnerability scanning (Wireshark, OWASP-ZAP, Metasploit)',
        level: 'intermediate',
        category: 'kali_linux',
        lessons: 36,
        duration: '36 فيديو',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'تطوير البرمجيات الخبيثة - دورة متقدمة',
        title_en: 'Malware Development - Advanced Course',
        description_ar: 'دورة متقدمة شاملة في تطوير وتحليل البرمجيات الخبيثة تتكون من 86 وحدة تعليمية تغطي: أساسيات البرمجة، مفاهيم الويندوز، تشفير البايلود (XOR, RC4, AES)، تخطي الحماية، حقن المهام (Process Injection)، تقنيات التشويش، Syscalls، تخطي برامج الحماية وEDRs، لغة Assembly، وتقنيات متقدمة مثل Process Hollowing وDLL Injection',
        description_en: 'Advanced comprehensive course in malware development and analysis with 86 modules covering: programming basics, Windows internals, payload encryption (XOR, RC4, AES), bypassing defenses, process injection, obfuscation techniques, syscalls, bypassing AV/EDRs, Assembly language, and advanced techniques like Process Hollowing and DLL Injection',
        level: 'advanced',
        category: 'malware_dev',
        lessons: 86,
        duration: '86 وحدة تعليمية',
        instructor: 'Professor Technology',
        price: 0
    },
    {
        title_ar: 'دورة اختبار اختراق مع الميتاسبلويت',
        title_en: 'Metasploit Penetration Testing Course',
        description_ar: 'دورة متخصصة في استخدام إطار عمل Metasploit لاختبار الاختراق، تعلم كيفية اكتشاف الثغرات واستغلالها بشكل احترافي',
        description_en: 'Specialized course on using the Metasploit framework for penetration testing, learn how to discover and exploit vulnerabilities professionally',
        level: 'intermediate',
        category: 'penetration_testing',
        lessons: 1,
        duration: 'فيديو شامل',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'دورة فحص الأنظمة NMAP',
        title_en: 'NMAP Systems Scanning Course',
        description_ar: 'دورة متكاملة في استخدام أداة NMAP لفحص الأنظمة والشبكات، اكتشاف الأجهزة المتصلة، فحص المنافذ المفتوحة، وتحديد الخدمات والثغرات الأمنية',
        description_en: 'Complete course on using NMAP for systems and network scanning, device discovery, open port scanning, and identifying services and security vulnerabilities',
        level: 'intermediate',
        category: 'penetration_testing',
        lessons: 1,
        duration: 'فيديو شامل',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'اختبار الاختراق العملي',
        title_en: 'Practical Penetration Testing',
        description_ar: 'دورة عملية في اختبار الاختراق تشمل استخدام أدوات Metasploit وNMAP بشكل تطبيقي مع أمثلة واقعية على فحص واختراق الأنظمة',
        description_en: 'Practical penetration testing course including hands-on use of Metasploit and NMAP tools with real-world examples of system scanning and exploitation',
        level: 'intermediate',
        category: 'penetration_testing',
        lessons: 2,
        duration: '2 فيديو',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'اختراق ويندوز - RAT والتحكم عن بعد',
        title_en: 'Windows Hacking - RAT & Remote Control',
        description_ar: 'دورة شاملة في اختراق أنظمة ويندوز تشمل: فتح البورتات، إعداد No-IP، إنشاء وتشفير سيرفر RAT، دمج السيرفر مع الملفات، سحب البيانات والحسابات البنكية، واستخدام NjRat',
        description_en: 'Comprehensive Windows hacking course covering: port forwarding, No-IP setup, RAT server creation and encryption, file embedding, data extraction, and NjRat usage',
        level: 'intermediate',
        category: 'penetration_testing',
        lessons: 12,
        duration: '12 فيديو',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'تعلم بايثون في فيديو واحد - 6 ساعات',
        title_en: 'Learn Python in One Video - 6 Hours',
        description_ar: 'دورة شاملة ومكثفة لتعلم لغة البرمجة بايثون من الصفر إلى الاحتراف في فيديو واحد مدته 6 ساعات، تغطي جميع الأساسيات والمفاهيم المتقدمة',
        description_en: 'Comprehensive intensive course to learn Python programming from scratch to mastery in one 6-hour video, covering all basics and advanced concepts',
        level: 'beginner',
        category: 'programming',
        lessons: 1,
        duration: '6 ساعات',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'دورة الانترنت المظلم للهاكرز والقراصنة',
        title_en: 'Dark Web Course for Hackers',
        description_ar: 'دورة مكثفة في ساعة واحدة عن الإنترنت المظلم (Dark Web)، كيفية الوصول إليه بأمان، فهم بنيته التحتية، والمخاطر الأمنية المرتبطة به',
        description_en: 'Intensive one-hour course about the Dark Web, how to access it safely, understanding its infrastructure, and associated security risks',
        level: 'intermediate',
        category: 'dark_web',
        lessons: 1,
        duration: 'ساعة واحدة',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'دورة كالي لينكس للمبتدئين',
        title_en: 'Kali Linux for Beginners',
        description_ar: 'دورة أساسيات كالي لينكس من الصفر تشمل: التنصيب، واجهة النظام، الملفات والمسارات، الصلاحيات، المستخدم الجذر، تغيير IP وMAC، خدمة Apache، SSH، مشاركة الملفات عبر SMB، العمليات، التحديثات، متصفح Tor والمزيد',
        description_en: 'Kali Linux fundamentals course from scratch covering: installation, GUI interface, files and paths, permissions, root user, IP/MAC changing, Apache service, SSH, SMB file sharing, processes, updates, Tor browser and more',
        level: 'beginner',
        category: 'kali_linux',
        lessons: 24,
        duration: '24 درس',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'شبكات CCNA - الدورة الكاملة',
        title_en: 'CCNA Networking Complete Course',
        description_ar: 'دورة شاملة في شبكات CCNA تغطي: نموذج OSI، بروتوكولات التوجيه (RIP, OSPF, EIGRP, BGP)، الـ Switching (VLAN, STP, EtherChannel)، أمن الشبكات، VPN، IPv4/IPv6، DHCP، ACL، NAT، تقنيات WAN، WiFi، وإدارة الشبكات (Syslog, NTP, SNMP)',
        description_en: 'Comprehensive CCNA networking course covering: OSI model, routing protocols (RIP, OSPF, EIGRP, BGP), switching (VLAN, STP, EtherChannel), network security, VPN, IPv4/IPv6, DHCP, ACL, NAT, WAN technologies, WiFi, and network management (Syslog, NTP, SNMP)',
        level: 'beginner',
        category: 'networking',
        lessons: 84,
        duration: '84 محاضرة',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'شهادة الهاكر الأخلاقي CEH V10',
        title_en: 'Certified Ethical Hacker (CEH) V10',
        description_ar: 'دورة شاملة للتحضير لشهادة الهاكر الأخلاقي CEH V10 تتكون من 58 محاضرة بالعربي، تغطي جميع مجالات الشهادة من أمن الشبكات والتهديدات الحديثة إلى اختبار الاختراق والتحليل الأمني',
        description_en: 'Comprehensive CEH V10 certification preparation course with 58 Arabic lectures covering all exam domains from network security and modern threats to penetration testing and security analysis',
        level: 'intermediate',
        category: 'certifications',
        lessons: 58,
        duration: '58 محاضرة',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'كالي لينكس المتقدم - الاختراق الأخلاقي',
        title_en: 'Advanced Kali Linux - Ethical Hacking',
        description_ar: 'دورة متقدمة في كالي لينكس تشمل: إتقان بيئة سطح المكتب، Port Scanning، التخفي أونلاين، أدوات Backdoor، Wireshark، كسر كلمات المرور، Metasploit المتقدم، اختراق WiFi (WEP/WPA)، اختراق تطبيقات الويب، WordPress، الهندسة الاجتماعية، وإعداد تقارير الاختراق',
        description_en: 'Advanced Kali Linux course covering: desktop mastery, Port Scanning, online anonymity, Backdoor tools, Wireshark, password cracking, advanced Metasploit, WiFi hacking (WEP/WPA), web application hacking, WordPress, social engineering, and penetration test reporting',
        level: 'intermediate',
        category: 'kali_linux',
        lessons: 44,
        duration: '44 فيديو',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'كورس الاختراق من الصفر',
        title_en: 'Hacking Course from Scratch',
        description_ar: 'دورة اختراق شاملة من الصفر تغطي: تثبيت كالي لينكس، أوامر الطرفية، أقسام أدوات كالي، حقن قواعد البيانات (SQL Injection)، كشف الثغرات، هجمات حجب الخدمة (DDoS)، الهندسة الاجتماعية، الاختراق الداخلي والخارجي',
        description_en: 'Comprehensive hacking course from scratch covering: Kali Linux installation, terminal commands, Kali tools sections, SQL Injection, vulnerability scanning, DDoS attacks, social engineering, internal and external hacking',
        level: 'beginner',
        category: 'penetration_testing',
        lessons: 32,
        duration: '32 فيديو',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    },
    {
        title_ar: 'كورس الاختراق الأخلاقي المتكامل',
        title_en: 'Complete Ethical Hacking Course',
        description_ar: 'دورة متكاملة في الاختراق الأخلاقي من الصفر مرتبة بشكل تسلسلي (29 درس)، تبدأ من تثبيت كالي لينكس وإعداد البيئة وصولاً إلى SQL Injection المتقدم، حجب الخدمة، كشف الثغرات، الهندسة الاجتماعية، وإخفاء الهوية',
        description_en: 'Complete sequential ethical hacking course (29 lessons), from Kali Linux installation and environment setup to advanced SQL Injection, DDoS, vulnerability scanning, social engineering, and anonymization',
        level: 'beginner',
        category: 'ethical_hacking',
        lessons: 29,
        duration: '29 درس',
        instructor: 'أكاديمية الدرع السيبراني',
        price: 0
    }
];

const insert = db.prepare(`
  INSERT INTO courses (title_ar, title_en, description_ar, description_en, level, category, lessons, duration, instructor, price, published)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertMany = db.transaction((items) => {
    for (const c of items) {
        insert.run(c.title_ar, c.title_en, c.description_ar, c.description_en, c.level, c.category, c.lessons, c.duration, c.instructor, c.price);
    }
});

insertMany(courses);

console.log(`✅ تم إدخال ${courses.length} دورة بنجاح!`);

// Show what was inserted
const all = db.prepare('SELECT id, title_ar, level, category, lessons FROM courses ORDER BY id').all();
console.log('\n📋 الدورات المدخلة:');
all.forEach((c, i) => {
    console.log(`  ${i + 1}. [${c.level}] ${c.title_ar} — ${c.lessons} درس (${c.category})`);
});

db.close();
