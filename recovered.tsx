�"use client";

import { useState, useEffect } from 'react';
import CyberTerminal from '@/components/cyber-range/CyberTerminal';

// Force chunk invalidation — v2 sidebar reorganization
const MODULE_VERSION = 'sidebar-v2-2026-04-26';

const toolCategories = [
    {
        name: "فحص الشبكات",
        nameEn: "Network Scanning",
        tools: [
            { name: "Nmap", desc: "أداة فحص شبكات مفتوحة المصدر لاكتشاف الأجهزة والمنافذ والخدمات", platform: "Linux / Windows / macOS", level: "متوسط" },
            { name: "Wireshark", desc: "محلل بروتوكولات الشبكة الأشهر لالتقاط وتحليل حزم البيانات", platform: "متعدد المنصات", level: "متوسط" },
            { name: "Netcat", desc: "أداة شبكات متعددة الاستخدام للقراءة والكتابة عبر اتصالات TCP/UDP", platform: "Linux / Windows", level: "متوسط" },
            { name: "Masscan", desc: "أسرع ماسح منافذ يمكنه فحص الإنترنت بالكامل في دقائق", platform: "Linux", level: "متقدم" },
        ]
    },
    {
        name: "اختبار الاختراق",
        nameEn: "Penetration Testing",
        tools: [
            { name: "OWASP ZAP", desc: "أداة مجانية لفحص ثغرات تطبيقات الويب تلقائياً", platform: "متعدد المنصات", level: "مبتدئ" },
            { name: "Burp Suite", desc: "أداة اختبار أمان تطبيقات الويب الأكثر شعبية", platform: "متعدد المنصات", level: "متوسط" },
            { name: "SQLmap", desc: "أداة آلية للكشف عن ثغرات حقن SQL واستغلالها", platform: "متعدد المنصات", level: "متوسط" },
            { name: "Metasploit", desc: "إطار عمل شامل لاختبار الاختراق واستغلال الثغرات الأمنية", platform: "Linux / Windows", level: "متقدم" },
        ]
    },
    {
        name: "كسر كلمات المرور",
        nameEn: "Password Cracking",
        tools: [
            { name: "John the Ripper", desc: "أداة كسر كلمات مرور سريعة تدعم أنواع متعددة من التجزئة", platform: "متعدد المنصات", level: "متوسط" },
            { name: "Hashcat", desc: "أسرع أداة لكسر كلمات المرور باستخدام وحدة معالجة الرسومات", platform: "متعدد المنصات", level: "متقدم" },
        ]
    }
];

// Sidebar structure organized by difficulty level
const sidebarSections = [
    {
        level: 'مبتدئ',
        levelEn: 'Beginner',
        color: 'text-green-500',
        dotColor: 'bg-green-500',
        borderColor: 'border-green-500/30',
        tabs: [
            { id: 'directory', name: 'دليل أدوات النظام', icon: '📚' },
            { id: 'hash', name: 'مولد الترميز (Base64/Hex)', icon: '🔢' },
            { id: 'password', name: 'مولد كلمات المرور', icon: '🔑' },
        ]
    },
    {
        level: 'متوسط',
        levelEn: 'Intermediate',
        color: 'text-orange-500',
        dotColor: 'bg-orange-500',
        borderColor: 'border-orange-500/30',
        tabs: [
            { id: 'analyzer', name: 'فحص الروابط المشبوهة', icon: '🔍' },
        ]
    },
    {
        level: 'متقدم',
        levelEn: 'Advanced',
        color: 'text-red-500',
        dotColor: 'bg-red-500',
        borderColor: 'border-red-500/30',
        tabs: [
            { id: 'crypto', name: 'تشفير النصوص (AES)', icon: '🔒' },
        ]
    },
];

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState('directory');
    useEffect(() => { console.log('[CyberShield Tools]', MODULE_VERSION); }, []);

    return (
        <div className="min-h-screen bg-cyber-950" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cyber-100">أدوات <span className="text-cyber-100">السيبرانية</span></h1>
                    <p className="text-cyber-400 text-lg">دليل شامل وأدوات تطبيقية لاستخدامها في الأمن السيبراني</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs — Organized by Level */}
                    <div className="w-full md:w-72 flex flex-col gap-1">
                        {sidebarSections.map((section, si) => (
                            <div key={si} className={si > 0 ? 'mt-3' : ''}>
                                {/* Level Header */}
                                <div className={`flex items-center gap-2 px-3 py-2 mb-1`}>
                                    <span className={`w-2 h-2 rounded-full ${section.dotColor}`} />
                                    <span className={`text-xs font-bold ${section.color} uppercase tracking-wider`}>{section.level}</span>
                                    <span className="text-[10px] text-cyber-600 font-mono" dir="ltr">{section.levelEn}</span>
                                    <span className={`flex-1 h-px ${section.borderColor} border-t`} />
                                </div>
                                {/* Tabs */}
                                {section.tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-right ${
                                            activeTab === tab.id 
                                                ? 'bg-cyber-100 text-cyber-950 shadow-[0_0_15px_rgba(200,150,46,0.5)]' 
                                                : 'bg-cyber-900 text-cyber-400 hover:bg-cyber-800 hover:text-cyber-950'
                                        }`}
                                    >
                                        <span className="text-xl">{tab.icon}</span>
                                        <span className="flex-1">{tab.name}</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-h-[500px]">
                        {activeTab === 'directory' && <DirectoryTool />}
                        {activeTab === 'password' && <div className="bg-cyber-900 border border-cyber-700 rounded-3xl p-6 md:p-8"><PasswordTool /></div>}
                        {activeTab === 'crypto' && <div className="bg-cyber-900 border border-cyber-700 rounded-3xl p-6 md:p-8"><CryptoTool /></div>}
                        {activeTab === 'hash' && <div className="bg-cyber-900 border border-cyber-700 rounded-3xl p-6 md:p-8"><HashTool /></div>}
                        {activeTab === 'analyzer' && <div className="bg-cyber-900 border border-cyber-700 rounded-3xl p-6 md:p-8"><AnalyzerTool /></div>}
                        {activeTab === 'range' && <div className="bg-cyber-950 border border-cyber-700 rounded-3xl h-[600px] overflow-hidden"><CyberTerminal labId="general" scenarios={[]} onStepComplete={() => {}} /></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// Tool 0: Directory (The Old Content)
// ---------------------------------------------------------
function DirectoryTool() {
    const getBadge = (l: string) => l === "مبتدئ" ? "bg-green-500/10 text-green-500 border-green-500/20" : l === "متوسط" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-red-500/10 text-red-500 border-red-500/20";
    
    return (
        <div className="space-y-10 animate-fade-in-up">
            {toolCategories.map((cat, i) => (
                <div key={i}>
                    <div className="flex items-center gap-3 mb-5">
                        <h2 className="text-xl font-bold text-cyber-100">{cat.name}</h2>
                        <span className="text-sm text-cyber-500 font-mono" dir="ltr">{cat.nameEn}</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {cat.tools.map((tool, j) => (
                            <div key={j} className="bg-cyber-900 border border-cyber-700 p-5 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-cyber-100 tracking-wider" dir="ltr">{tool.name}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-md border ${getBadge(tool.level)}`}>{tool.level}</span>
                                </div>
                                <p className="text-cyber-400 text-sm leading-relaxed mb-3">{tool.desc}</p>
                                <span className="text-xs text-cyber-500">📌 {tool.platform}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------
// Tool 1: Password Generator & Strength Checker
// ---------------------------------------------------------
function PasswordTool() {
    const [pwd, setPwd] = useState('');
    const [length, setLength] = useState(16);
    const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

    const checkStrength = (password: string) => {
        let score = 0;
        if (password.length > 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        setPwd(password);
        if (password.length === 0) setStrength({ score: 0, label: '', color: '' });
        else if (score < 3) setStrength({ score, label: 'ضعيفة', color: 'bg-red-500' });
        else if (score < 5) setStrength({ score, label: 'متوسطة', color: 'bg-orange-500' });
        else setStrength({ score, label: 'قوية جداً', color: 'bg-green-500' });
    };

    const generate = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let res = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            res += charset.charAt(Math.floor(Math.random() * n));
        }
        checkStrength(res);
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-cyber-100 mb-6">مولد وفاحص كلمات المرور</h2>
            
            <div className="mb-6">
                <div className="relative">
                    <input 
                        type="text" 
                        value={pwd} 
                        onChange={(e) => checkStrength(e.target.value)}
                        placeholder="أدخل كلمة مرور لفحصها..."
                        className="w-full bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 py-4 text-cyber-100 font-mono text-lg outline-none focus:border-cyber-100 transition-all"
                        dir="ltr"
                    />
                    <button 
                        onClick={() => { navigator.clipboard.writeText(pwd); alert('تم النَسخ'); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyber-800 hover:bg-cyber-100 hover:text-cyber-950 text-cyber-300 font-bold rounded-lg text-sm transition-colors"
                    >
                        نسخ
                    </button>
                </div>
            </div>

            {pwd && (
                <div className="mb-8 p-4 border border-cyber-700 rounded-xl bg-cyber-900/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-cyber-400 text-sm font-bold">قوة كلمة المرور:</span>
                        <span className={`text-sm font-bold px-3 py-1 rounded-md ${strength.color} text-cyber-100`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-2 bg-cyber-800 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`h-full flex-1 transition-colors duration-300 ${i <= strength.score ? strength.color : 'bg-transparent'}`} />
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-cyber-700 pt-6">
                <h3 className="text-cyber-300 font-bold mb-4">توليد كلمة مرور موثوقة:</h3>
                <div className="flex items-center gap-4 mb-6">
                    <input 
                        type="range" min="8" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full max-w-xs accent-cyber-100"
                    />
                    <span className="text-cyber-500 font-mono font-bold bg-cyber-500/10 px-3 py-1 rounded-lg border border-cyber-500/20">{length} خانة</span>
                </div>
                <button onClick={generate} className="bg-cyber-100 text-cyber-950 font-bold py-3 px-8 rounded-xl shadow-[0_4px_20px_rgba(200,150,46,0.3)] hover:scale-105 transition-all">
                    ⚡ توليد كلمة مرور أمنة
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// Tool 2: CryptoTool — Dual Mode (Secure AES-GCM / Flexible)
// ---------------------------------------------------------

// --- Helpers for Web Crypto AES-256-GCM (Secure Mode) ---
async function deriveAESKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password) as any, 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt as any, iterations: 100_000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function aesEncrypt(plaintext: string, password: string): Promise<string> {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveAESKey(password, salt);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext) as any);
    const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(cipherBuf).length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(cipherBuf), salt.length + iv.length);
    return btoa(String.fromCharCode(...combined));
}

async function aesDecrypt(cipherB64: string, password: string): Promise<string> {
    const raw = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
    const salt = raw.slice(0, 16);
    const iv = raw.slice(16, 28);
    const ciphertext = raw.slice(28);
    const key = await deriveAESKey(password, salt);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext as any);
    return new TextDecoder().decode(plainBuf);
}

// --- Helpers for XOR obfuscation (Flexible Mode) ---
const INTERNAL_FALLBACK_KEY = 'CyB3rSh1eLd_2026!';

function xorObfuscate(text: string, key: string): string {
    const effectiveKey = key || INTERNAL_FALLBACK_KEY;
    let out = '';
    for (let i = 0; i < text.length; i++) {
        out += String.fromCharCode(text.charCodeAt(i) ^ effectiveKey.charCodeAt(i % effectiveKey.length));
    }
    return out;
}

function flexEncrypt(plaintext: string, userKey: string): string {
    const xored = xorObfuscate(plaintext, userKey);
    return 'FLEX.' + btoa(encodeURIComponent(xored));
}

function flexDecrypt(cipherB64: string, userKey: string): string {
    try {
        const payload = cipherB64.startsWith('FLEX.') ? cipherB64.slice(5) : cipherB64;
        const decoded = decodeURIComponent(atob(payload));
        // Try with user-provided key first
        if (userKey) {
            const attempt = xorObfuscate(decoded, userKey);
            // Basic check: if it produces printable characters, accept it
            if (/^[\x20-\x7E\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s\d]+$/.test(attempt)) {
                return attempt;
            }
        }
        // Fallback: try internal key
        const fallback = xorObfuscate(decoded, INTERNAL_FALLBACK_KEY);
        if (/^[\x20-\x7E\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s\d]+$/.test(fallback)) {
            return fallback;
        }
        // Last resort: return raw decoded
        return decoded;
    } catch {
        return '[خطأ] تعذّر فك التشفير — تأكد من صحة النص المشفّر';
    }
}

function CryptoTool() {
    const [text, setText] = useState('');
    const [key, setKey] = useState('');
    const [result, setResult] = useState('');
    const [mode, setMode] = useState<'secure' | 'flexible'>('secure');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | ''; msg: string }>({ type: '', msg: '' });
    const [copied, setCopied] = useState(false);

    const handleEncrypt = async () => {
        if (!text) return setStatus({ type: 'error', msg: 'الرجاء إدخال النص المراد تشفيره' });
        if (mode === 'secure' && !key) return setStatus({ type: 'error', msg: 'الوضع الآمن يتطلب مفتاح تشفير' });
        setLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            if (mode === 'secure') {
                const encrypted = await aesEncrypt(text, key);
                setResult(encrypted);
                setStatus({ type: 'success', msg: 'تم التشفير بـ AES-256-GCM — يلزم نفس المفتاح لفك التشفير' });
            } else {
                setResult(flexEncrypt(text, key));
                setStatus({ type: 'success', msg: 'تم التشفير بالوضع المرن — يمكن فك التشفير بأي مفتاح' });
            }
        } catch {
            setStatus({ type: 'error', msg: 'حدث خطأ أثناء التشفير' });
        }
        setLoading(false);
    };

    const handleDecrypt = async () => {
        if (!text) return setStatus({ type: 'error', msg: 'الرجاء إدخال النص المشفّر' });
        if (mode === 'secure' && !key) return setStatus({ type: 'error', msg: 'الوضع الآمن يتطلب المفتاح الأصلي لفك التشفير' });
        setLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            if (mode === 'secure') {
                const decrypted = await aesDecrypt(text, key);
                setResult(decrypted);
                setStatus({ type: 'success', msg: 'تم فك التشفير بنجاح ✓' });
            } else {
                const decrypted = flexDecrypt(text, key);
                setResult(decrypted);
                setStatus({ type: 'success', msg: key ? 'تم فك التشفير بالمفتاح المُقدّم' : 'تم فك التشفير بالمفتاح الداخلي الاحتياطي' });
            }
        } catch {
            if (mode === 'secure') {
                setStatus({ type: 'error', msg: 'فشل فك التشفير — المفتاح غير صحيح أو النص المشفّر تالف' });
            } else {
                setResult(text);
                setStatus({ type: 'info', msg: 'تعذّر فك التشفير — تم إرجاع النص كما هو' });
            }
        }
        setLoading(false);
    };

    const copyResult = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-cyber-100 mb-2">تشفير النصوص</h2>
            <p className="text-cyber-500 text-sm mb-6">اختر وضع التشفير المناسب حسب احتياجاتك الأمنية</p>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => { setMode('secure'); setResult(''); setStatus({ type: '', msg: '' }); }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-right ${
                        mode === 'secure'
                            ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                            : 'border-cyber-700 bg-cyber-800/30 hover:border-cyber-500'
                    }`}
                >
                    {mode === 'secure' && <span className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />}
                    <div className="text-lg font-bold text-cyber-100 mb-1">🛡️ الوضع الآمن</div>
                    <div className="text-xs text-cyber-500 leading-relaxed">AES-256-GCM — يتطلب نفس المفتاح للتشفير وفك التشفير</div>
                </button>
                <button
                    onClick={() => { setMode('flexible'); setResult(''); setStatus({ type: '', msg: '' }); }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-right ${
                        mode === 'flexible'
                            ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
                            : 'border-cyber-700 bg-cyber-800/30 hover:border-cyber-500'
                    }`}
                >
                    {mode === 'flexible' && <span className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />}
                    <div className="text-lg font-bold text-cyber-100 mb-1">⚡ الوضع المرن</div>
                    <div className="text-xs text-cyber-500 leading-relaxed">XOR + Base64 — يمكن فك التشفير بدون المفتاح الأصلي</div>
                </button>
            </div>

            {/* Trade-off Notice */}
            <div className={`mb-5 p-3 rounded-lg border text-xs leading-relaxed ${
                mode === 'secure'
                    ? 'bg-green-500/5 border-green-500/20 text-green-400'
                    : 'bg-orange-500/5 border-orange-500/20 text-orange-400'
            }`}>
                {mode === 'secure'
                    ? '🔐 تشفير حقيقي بمعيار AES-256 مع PBKDF2 لاشتقاق المفتاح. فقدان المفتاح يعني فقدان البيانات نهائياً.'
                    : '⚠️ تشفير تعليمي قابل للعكس. المفتاح اختياري — يوجد مفتاح داخلي احتياطي. غير مناسب لحماية بيانات حساسة.'
                }
            </div>

            {/* Input Fields */}
            <div className="space-y-3 mb-4">
                <textarea
                    rows={4}
                    value={text}
                    onChange={e => { setText(e.target.value); setStatus({ type: '', msg: '' }); }}
                    className="w-full bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 py-3 text-cyber-100 outline-none font-mono text-sm focus:border-cyber-100 transition-colors"
                    placeholder={mode === 'secure' ? 'أدخل النص للتشفير أو النص المشفّر لفك التشفير...' : 'أدخل النص — المفتاح اختياري في الوضع المرن...'}
                    dir="auto"
                />
                <div className="relative">
                    <input
                        type="password"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                        className="w-full bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 py-3 text-cyber-100 outline-none font-mono focus:border-cyber-100 transition-colors"
                        placeholder={mode === 'secure' ? 'المفتاح السري (مطلوب) ⚿' : 'المفتاح (اختياري — يُستخدم مفتاح داخلي إذا فارغ)'}
                        dir="ltr"
                    />
                    {mode === 'flexible' && !key && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-orange-500/70 font-bold pointer-events-none">
                            مفتاح داخلي
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
                <button
                    onClick={handleEncrypt}
                    disabled={loading}
                    className={`flex-1 font-bold py-3 rounded-xl transition-all disabled:opacity-50 ${
                        mode === 'secure'
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-cyber-100 text-cyber-950 hover:shadow-[0_0_20px_rgba(200,150,46,0.3)]'
                    }`}
                >
                    {loading ? '⏳ جارٍ...' : '🔒 تشفير'}
                </button>
                <button
                    onClick={handleDecrypt}
                    disabled={loading}
                    className="flex-1 bg-cyber-800 text-cyber-100 border border-cyber-300/30 font-bold py-3 rounded-xl hover:bg-cyber-700 transition-all disabled:opacity-50"
                >
                    {loading ? '⏳ جارٍ...' : '🔓 فك التشفير'}
                </button>
            </div>

            {/* Status Message */}
            {status.msg && (
                <div className={`p-3 rounded-lg border text-sm mb-4 ${
                    status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                    {status.msg}
                </div>
            )}

            {/* Result Output */}
            {result && (
                <div className="relative">
                    <textarea
                        readOnly
                        value={result}
                        rows={4}
                        className="w-full bg-cyber-500/5 border border-cyber-500/30 rounded-xl px-4 py-3 pr-16 text-cyber-100 outline-none font-mono text-sm"
                        dir="auto"
                    />
                    <button
                        onClick={copyResult}
                        className="absolute top-3 left-3 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyber-800 hover:bg-cyber-100 hover:text-cyber-950 text-cyber-300 transition-colors"
                    >
                        {copied ? '✓ تم' : 'نسخ'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------
// Tool 3: HashTool
// ---------------------------------------------------------
function HashTool() {
    const [input, setInput] = useState('');
    const [b64, setB64] = useState('');
    const [hex, setHex] = useState('');

    const process = (val: string) => {
        setInput(val);
        if (!val) { setB64(''); setHex(''); return; }
        try {
            setB64(btoa(encodeURIComponent(val)));
            let hexStr = '';
            for (let i = 0; i < val.length; i++) {
                hexStr += val.charCodeAt(i).toString(16).padStart(2, '0');
            }
            setHex(hexStr);
        } catch {
            setB64('Error'); setHex('Error');
        }
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-cyber-100 mb-6">مولد الترميز (Base64 / Hex)</h2>
            <textarea rows={3} value={input} onChange={e => process(e.target.value)} className="w-full bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 py-3 text-cyber-100 mb-6 outline-none font-mono text-sm" placeholder="Enter text..." />
            <div className="space-y-4">
                <div className="bg-cyber-900/50 p-4 border border-cyber-700 rounded-xl"><div className="text-cyber-500 mb-2 font-bold text-xs uppercase">Base64 Encode</div><div className="text-cyber-300 font-mono text-sm break-all">{b64 || '-'}</div></div>
                <div className="bg-cyber-900/50 p-4 border border-cyber-700 rounded-xl"><div className="text-cyber-500 mb-2 font-bold text-xs uppercase">Hex Representation</div><div className="text-orange-400 font-mono text-sm break-all">{hex || '-'}</div></div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// Tool 4: AnalyzerTool
// ---------------------------------------------------------
function AnalyzerTool() {
    const [url, setUrl] = useState('');
    const [report, setReport] = useState<any>(null);

    const analyze = () => {
        if (!url) return;
        let riskScore = 0; const warnings = [];
        if (url.startsWith('http://')) { riskScore += 40; warnings.push('يفتقر لبروتوكول HTTPS.'); }
        if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { riskScore += 30; warnings.push('يستخدم عنوان IP بدلاً من اسم النطاق.'); }
        if (url.length > 80) { riskScore += 10; warnings.push('رابط طويل جداً قد يخفي الوجهة الحقيقية.'); }
        if (/\.(tk|ml|ga|cf|gq|xyz)$/i.test(new URL(url.startsWith('http') ? url : `https://${url}`).hostname || '')) { riskScore += 50; warnings.push('يستخدم نطاق مجاني أو غير موثوق.'); }
        setReport({ score: Math.min(riskScore, 100), warnings });
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-cyber-100 mb-6">محلل الروابط الذكي</h2>
            <div className="flex gap-2 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="flex-1 bg-cyber-800/50 border border-cyber-600 rounded-xl px-4 text-cyber-100 outline-none font-mono" placeholder="http://example.com" dir="ltr" />
                <button onClick={analyze} className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700">فحص الرابط</button>
            </div>
            {report && (
                <div className="border-t border-cyber-700 pt-6 flex gap-6">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center border-4" style={{ borderColor: report.score > 50 ? '#ef4444' : '#22c55e' }}>
                        <span className="text-2xl font-bold text-cyber-100">{report.score}%</span>
                    </div>
                    <div>
                        <h3 className={`font-bold mb-2 ${report.score > 50 ? 'text-red-500' : 'text-green-500'}`}>{report.score > 50 ? 'خطر مرتفع!' : 'أمن وموثوق نسبياً'}</h3>
                        <ul className="text-sm text-cyber-400 list-disc list-inside">{report.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul>
                    </div>
                </div>
            )}
        </div>
    );
}

