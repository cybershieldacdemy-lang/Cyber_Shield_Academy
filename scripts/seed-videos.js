const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'cyber.db'));

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS learning_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'beginner',
      video_url TEXT NOT NULL,
      thumbnail TEXT DEFAULT '',
      duration TEXT DEFAULT '',
      instructor TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      path_id TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Real YouTube video IDs for cybersecurity content
const ytIds = [
  'fNzpcB7ODxQ','3Kq1MIfTWCE','lDi9uFcD7XI','hXSFdwIOfnE','WnN6dbos5u8',
  'VVoA4bHsAJg','t4-416mg6iU','pGcerfVqYyU','SXmv8quf_xM','HRDwGR0LBAY',
  'OU-e2CaLCkY','aircAruvnKk','nCr_8hOg1l0','1lBGr3t3bBQ','6jQ7pkLMdkE',
  'qiQR5rTSshw','1F4tM1KFqBs','z-GN9NEXT-s','Kx4y9c7w2cI','oVlmBenSCcQ',
  'K7YOY8ViVdU','Gx2TnIdt0hw','gZFXkhHf5Tc','qlK174d_uu8','U_P23SqJaDc',
  'xKqIBBhMGnc','2DfjQlZoPsY','Yp0y7iYXlXc','t0F7fe5Alwg','C-GrPXrmw0Y',
  'rL8X2mlNHPM','7MVIlwzblog','p4JVbF7zoRo','3msA3GCXLAY','dz7Ntp7KQGA',
  'OqTpc_ljPYk','iI9-lzYrjak','b52cfb6lweU','GoXo00iR9gY','5mguomnDXFQ',
  'vasCSy1Bksg','0uvWRwLs5Zo','vg6kdMcHMcI','HcY4Bfh7mGE','PaSFihwjldg',
  'sCYrK42JBx8','h4Sl21AKiDg','a7U3gmLcdHU','1NXsyOSJisY','Q7UGWzXlmr0',
];

const categories = [
  {
    id: 'network-security', name: 'أمن الشبكات',
    topics: [
      ['أساسيات TCP/IP وبروتوكولات الشبكة','تعلم كيف تعمل بروتوكولات الشبكة الأساسية وكيفية تحليلها'],
      ['تحليل حركة الشبكة باستخدام Wireshark','استخدام Wireshark لالتقاط وتحليل الحزم المشبوهة'],
      ['إعداد جدران الحماية وقواعد Firewall','كيفية تكوين وإدارة جدران الحماية بفعالية'],
      ['كشف التسلل باستخدام Snort IDS','إعداد واستخدام نظام كشف التسلل Snort'],
      ['أمن الشبكات اللاسلكية WiFi','حماية الشبكات اللاسلكية من الهجمات الشائعة'],
      ['فحص الشبكة باستخدام Nmap','تقنيات فحص الشبكة واكتشاف الأجهزة والخدمات'],
      ['شبكات VPN وأنفاق SSH','إنشاء اتصالات آمنة عبر VPN و SSH Tunneling'],
      ['تحليل DNS والهجمات عليه','فهم نظام DNS وأنواع الهجمات المتعلقة به'],
      ['أمن بروتوكول DHCP','حماية DHCP من هجمات التزوير والاستنزاف'],
      ['تقسيم الشبكة (Network Segmentation)','أفضل ممارسات تقسيم الشبكات لتعزيز الأمان'],
    ]
  },
  {
    id: 'ethical-hacking', name: 'الاختراق الأخلاقي',
    topics: [
      ['مقدمة في الاختراق الأخلاقي','ما هو الاختراق الأخلاقي وكيف تبدأ فيه'],
      ['جمع المعلومات والاستطلاع','تقنيات OSINT وجمع المعلومات عن الهدف'],
      ['فحص الثغرات الأمنية','استخدام أدوات فحص الثغرات مثل Nessus و OpenVAS'],
      ['استغلال الثغرات باستخدام Metasploit','إطار عمل Metasploit واستغلال الثغرات'],
      ['اختراق كلمات المرور','تقنيات كسر كلمات المرور باستخدام Hashcat و John'],
      ['هجمات الهندسة الاجتماعية','فهم وتنفيذ هجمات الهندسة الاجتماعية'],
      ['تصعيد الصلاحيات في Linux','تقنيات تصعيد الصلاحيات في أنظمة Linux'],
      ['تصعيد الصلاحيات في Windows','تقنيات تصعيد الصلاحيات في أنظمة Windows'],
      ['Post-Exploitation وجمع البيانات','ماذا تفعل بعد الحصول على صلاحيات الوصول'],
      ['كتابة تقارير اختبار الاختراق','كيفية توثيق نتائج اختبار الاختراق بشكل احترافي'],
    ]
  },
  {
    id: 'web-security', name: 'أمن تطبيقات الويب',
    topics: [
      ['ثغرات OWASP Top 10','نظرة شاملة على أخطر 10 ثغرات في تطبيقات الويب'],
      ['هجمات حقن SQL المتقدمة','تقنيات SQL Injection المتقدمة والحماية منها'],
      ['هجمات XSS وCSRF','البرمجة عبر المواقع وتزوير الطلبات'],
      ['استخدام Burp Suite للاختبار','دليل شامل لاستخدام Burp Suite في اختبار الويب'],
      ['أمن واجهات API','حماية REST APIs و GraphQL من الثغرات'],
      ['اختبار المصادقة والجلسات','اختبار آليات المصادقة وإدارة الجلسات'],
      ['ثغرات تحميل الملفات','استغلال وحماية وظائف تحميل الملفات'],
      ['أمن JavaScript والـ DOM','ثغرات DOM-based XSS وحماية الجانب العميل'],
      ['اختبار تطبيقات الويب تلقائياً','أدوات الفحص التلقائي لتطبيقات الويب'],
      ['WAF Bypass - تجاوز جدران حماية الويب','تقنيات تجاوز جدران حماية تطبيقات الويب'],
    ]
  },
  {
    id: 'malware-analysis', name: 'تحليل البرمجيات الخبيثة',
    topics: [
      ['مقدمة في تحليل البرمجيات الخبيثة','أساسيات تحليل الملفات المشبوهة والبرامج الضارة'],
      ['التحليل الساكن للبرمجيات الخبيثة','تحليل الملفات بدون تشغيلها باستخدام أدوات ساكنة'],
      ['التحليل الديناميكي في بيئة معزولة','تشغيل البرمجيات الخبيثة في Sandbox وتحليل سلوكها'],
      ['الهندسة العكسية باستخدام Ghidra','استخدام Ghidra لتحليل الكود الثنائي'],
      ['تحليل ملفات PE و ELF','فهم هياكل الملفات التنفيذية وتحليلها'],
      ['Ransomware - تحليل برامج الفدية','كيف تعمل برامج الفدية وكيفية تحليلها'],
      ['تحليل ماكرو Office الخبيث','كشف وتحليل ماكرو VBA الضار في ملفات Office'],
      ['كتابة قواعد YARA','إنشاء قواعد YARA للكشف عن البرمجيات الخبيثة'],
      ['تحليل حركة C2 الشبكية','تحليل اتصالات Command and Control'],
      ['أدوات تحليل البرمجيات الخبيثة','أفضل الأدوات المستخدمة في تحليل Malware'],
    ]
  },
  {
    id: 'digital-forensics', name: 'التحليل الجنائي الرقمي',
    topics: [
      ['مقدمة في التحليل الجنائي الرقمي','أساسيات التحقيق الجنائي في الحوادث الرقمية'],
      ['تحليل الذاكرة باستخدام Volatility','استخراج وتحليل الأدلة من ذاكرة النظام'],
      ['تحليل صور الأقراص','فحص صور الأقراص واستعادة الملفات المحذوفة'],
      ['التحقيق في حوادث Windows','تحليل سجلات وآثار Windows'],
      ['التحقيق في حوادث Linux','تحليل سجلات ونظام ملفات Linux'],
      ['تحليل البريد الإلكتروني الاحتيالي','التحقيق في رسائل التصيد وتتبع مصدرها'],
      ['استخدام Autopsy للتحقيق','أداة Autopsy للتحليل الجنائي الرقمي'],
      ['سلسلة الحفظ والأدلة الرقمية','إدارة الأدلة الرقمية وسلسلة الحفظ القانونية'],
      ['تحليل الأجهزة المحمولة','استخراج وتحليل البيانات من الهواتف الذكية'],
      ['كتابة تقارير التحقيق الجنائي','توثيق النتائج الجنائية بشكل قانوني ومهني'],
    ]
  },
  {
    id: 'soc-operations', name: 'عمليات مركز الأمن SOC',
    topics: [
      ['مقدمة في مركز عمليات الأمن SOC','ما هو SOC وكيف يعمل وأدواره الأساسية'],
      ['إدارة SIEM وتحليل السجلات','إعداد واستخدام أنظمة SIEM لمراقبة الأمان'],
      ['كتابة قواعد الكشف والتنبيهات','إنشاء قواعد Sigma و SIEM للكشف عن التهديدات'],
      ['الاستجابة للحوادث الأمنية','إجراءات وخطوات الاستجابة للحوادث'],
      ['صيد التهديدات (Threat Hunting)','تقنيات البحث الاستباقي عن التهديدات'],
      ['تحليل مؤشرات الاختراق IOCs','التعرف على وتحليل مؤشرات الاختراق'],
      ['أساسيات Splunk للمحللين','استخدام Splunk في تحليل الأحداث الأمنية'],
      ['إطار عمل MITRE ATT&CK','فهم واستخدام إطار MITRE ATT&CK'],
      ['إدارة الثغرات الأمنية','عملية اكتشاف وتصنيف ومعالجة الثغرات'],
      ['مراقبة نقاط النهاية EDR','استخدام حلول EDR لحماية الأجهزة'],
    ]
  },
  {
    id: 'cloud-security', name: 'أمن السحابة',
    topics: [
      ['أساسيات أمن AWS','مبادئ أمان Amazon Web Services'],
      ['أمن Microsoft Azure','حماية بيئات Azure السحابية'],
      ['أمن Google Cloud Platform','تأمين خدمات Google Cloud'],
      ['إدارة الهوية والوصول IAM','أفضل ممارسات IAM في السحابة'],
      ['أمن الحاويات Docker و Kubernetes','تأمين بيئات الحاويات والأوركسترا'],
      ['DevSecOps والتكامل المستمر','دمج الأمان في خط أنابيب CI/CD'],
      ['تشفير البيانات في السحابة','استراتيجيات تشفير البيانات السحابية'],
      ['المراقبة والتدقيق السحابي','أدوات مراقبة وتدقيق أمن السحابة'],
      ['Serverless Security','أمن التطبيقات بدون خوادم Lambda/Functions'],
      ['Cloud Pentesting','اختبار اختراق البيئات السحابية'],
    ]
  },
  {
    id: 'cryptography', name: 'علم التشفير',
    topics: [
      ['أساسيات التشفير والتجزئة','مفاهيم التشفير المتماثل وغير المتماثل'],
      ['تشفير RSA و ECC','فهم خوارزميات التشفير بالمفتاح العام'],
      ['بروتوكول TLS/SSL','كيف يعمل TLS وكيفية تحليل الشهادات'],
      ['التوقيع الرقمي والشهادات','إنشاء وإدارة التوقيعات والشهادات الرقمية'],
      ['كسر التشفير والتحليل المشفر','تقنيات تحليل وكسر أنظمة التشفير الضعيفة'],
      ['تشفير البلوك تشين','كيف يستخدم Blockchain التشفير'],
      ['إدارة المفاتيح (KMS)','أفضل ممارسات إدارة مفاتيح التشفير'],
      ['PGP وتشفير البريد الإلكتروني','تأمين الاتصالات عبر البريد الإلكتروني'],
      ['Hashing وكسر كلمات المرور','فهم دوال التجزئة وتقنيات الكسر'],
      ['التشفير في تطبيقات الويب','تطبيق التشفير بشكل صحيح في التطبيقات'],
    ]
  },
  {
    id: 'linux-security', name: 'أمن Linux',
    topics: [
      ['تقوية نظام Linux','أفضل ممارسات تأمين خوادم Linux'],
      ['إدارة الصلاحيات والمستخدمين','نظام الصلاحيات في Linux وإدارة المستخدمين'],
      ['SELinux و AppArmor','أنظمة التحكم الإلزامي في الوصول'],
      ['مراقبة سجلات Linux','تحليل ومراقبة سجلات النظام'],
      ['أمن SSH المتقدم','تقوية وحماية خدمة SSH'],
      ['جدار حماية iptables و nftables','إعداد جدران حماية Linux'],
      ['كشف الاختراق في Linux','أدوات وتقنيات كشف الاختراق'],
      ['أمن خوادم الويب Apache/Nginx','تأمين خوادم الويب على Linux'],
      ['أتمتة الأمان بـ Bash Scripting','كتابة سكربتات أمنية بـ Bash'],
      ['حماية قواعد البيانات على Linux','تأمين MySQL و PostgreSQL'],
    ]
  },
  {
    id: 'windows-security', name: 'أمن Windows',
    topics: [
      ['تقوية نظام Windows','أفضل ممارسات تأمين Windows Server'],
      ['Active Directory Security','تأمين وحماية Active Directory'],
      ['Group Policy للأمان','استخدام GPO لتطبيق سياسات الأمان'],
      ['Windows Event Logs','تحليل سجلات أحداث Windows'],
      ['PowerShell للأمن السيبراني','استخدام PowerShell في مهام الأمان'],
      ['حماية نقاط النهاية Windows','Windows Defender و EDR Solutions'],
      ['هجمات Kerberos و AD','فهم هجمات Kerberoasting و Pass-the-Hash'],
      ['أمن Windows Registry','تحليل وحماية سجل Windows'],
      ['التحقيق في حوادث Windows المتقدم','تقنيات متقدمة للتحقيق في Windows'],
      ['أمن Office 365 و Exchange','حماية خدمات Microsoft 365'],
    ]
  },
];

const levels = ['beginner', 'intermediate', 'advanced'];
const levelWeights = { beginner: 0.4, intermediate: 0.35, advanced: 0.25 };

const instructors = [
  'أحمد الأمني', 'سارة المحلل', 'خالد الهاكر', 'فاطمة الشبكات',
  'عمر التشفير', 'نورة الدفاع', 'محمد الاختراق', 'ليلى السحابة',
  'يوسف الجنائي', 'هند البرمجة', 'طارق الحماية', 'رنا التحليل',
];

const durations = [
  '5:30','8:15','10:42','12:30','15:00','18:45','20:10','22:30',
  '25:00','28:15','30:00','32:45','35:20','38:00','40:15','42:30',
  '45:00','48:30','50:00','55:15','1:00:00','1:05:30','1:10:00','1:15:45',
  '1:20:00','1:25:30','1:30:00','1:45:00','2:00:00',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randViews() { return Math.floor(Math.random() * 50000) + 500; }
function randLikes() { return Math.floor(Math.random() * 3000) + 50; }

// Generate 500 videos
const videos = [];
let globalOrder = 0;

// 10 categories × 10 base topics = 100 base topics
// Generate 5 variations per topic = 500 videos
const variations = [
  { prefix: '', suffix: ' - الدرس الشامل', levelBias: 'beginner' },
  { prefix: 'دورة ', suffix: ' المتقدمة', levelBias: 'intermediate' },
  { prefix: '', suffix: ' - تطبيق عملي', levelBias: 'intermediate' },
  { prefix: 'ورشة عمل: ', suffix: '', levelBias: 'advanced' },
  { prefix: '', suffix: ' - من الصفر للاحتراف', levelBias: 'beginner' },
];

for (const cat of categories) {
  for (let ti = 0; ti < cat.topics.length; ti++) {
    const [baseTitle, baseDesc] = cat.topics[ti];
    for (let vi = 0; vi < variations.length; vi++) {
      const v = variations[vi];
      const title = `${v.prefix}${baseTitle}${v.suffix}`;
      const description = baseDesc;
      const level = v.levelBias;
      const ytId = ytIds[(globalOrder) % ytIds.length];
      const video_url = `https://www.youtube.com/watch?v=${ytId}`;
      const thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      const duration = pick(durations);
      const instructor = pick(instructors);
      const tags = JSON.stringify([cat.name, level, baseTitle.split(' ')[0]]);
      
      videos.push({
        title, description, category: cat.id, level, video_url,
        thumbnail, duration, instructor, tags,
        views: randViews(), likes: randLikes(),
        path_id: cat.id, sort_order: globalOrder,
      });
      globalOrder++;
    }
  }
}

console.log(`Generated ${videos.length} videos. Inserting into database...`);

// Clear existing and insert
db.exec('DELETE FROM learning_videos');

const insert = db.prepare(`
  INSERT INTO learning_videos (title, description, category, level, video_url, thumbnail, duration, instructor, tags, views, likes, path_id, sort_order)
  VALUES (@title, @description, @category, @level, @video_url, @thumbnail, @duration, @instructor, @tags, @views, @likes, @path_id, @sort_order)
`);

const insertMany = db.transaction((vids) => {
  for (const v of vids) insert.run(v);
});

insertMany(videos);

const count = db.prepare('SELECT COUNT(*) as c FROM learning_videos').get();
console.log(`✅ Successfully inserted ${count.c} videos into learning_videos table.`);

// Print stats
const stats = db.prepare('SELECT level, COUNT(*) as c FROM learning_videos GROUP BY level').all();
console.log('\n📊 Videos by level:');
stats.forEach(s => console.log(`   ${s.level}: ${s.c}`));

const catStats = db.prepare('SELECT category, COUNT(*) as c FROM learning_videos GROUP BY category').all();
console.log('\n📂 Videos by category:');
catStats.forEach(s => console.log(`   ${s.category}: ${s.c}`));

db.close();
