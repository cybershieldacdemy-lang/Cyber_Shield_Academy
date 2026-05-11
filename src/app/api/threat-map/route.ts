import { NextRequest, NextResponse } from 'next/server';

const COUNTRIES = [
  { code: 'US', ar: 'الولايات المتحدة', lat: 38.9, lng: -77.0, w: 18 },
  { code: 'CN', ar: 'الصين', lat: 39.9, lng: 116.4, w: 22 },
  { code: 'RU', ar: 'روسيا', lat: 55.7, lng: 37.6, w: 16 },
  { code: 'DE', ar: 'ألمانيا', lat: 52.5, lng: 13.4, w: 8 },
  { code: 'BR', ar: 'البرازيل', lat: -15.8, lng: -47.9, w: 7 },
  { code: 'IN', ar: 'الهند', lat: 28.6, lng: 77.2, w: 10 },
  { code: 'IR', ar: 'إيران', lat: 35.7, lng: 51.4, w: 9 },
  { code: 'KP', ar: 'كوريا الشمالية', lat: 39.0, lng: 125.7, w: 6 },
  { code: 'GB', ar: 'بريطانيا', lat: 51.5, lng: -0.1, w: 5 },
  { code: 'FR', ar: 'فرنسا', lat: 48.9, lng: 2.3, w: 5 },
  { code: 'JP', ar: 'اليابان', lat: 35.7, lng: 139.7, w: 4 },
  { code: 'SA', ar: 'السعودية', lat: 24.7, lng: 46.7, w: 6 },
  { code: 'AE', ar: 'الإمارات', lat: 25.2, lng: 55.3, w: 5 },
  { code: 'EG', ar: 'مصر', lat: 30.0, lng: 31.2, w: 4 },
  { code: 'TR', ar: 'تركيا', lat: 41.0, lng: 28.9, w: 5 },
  { code: 'IL', ar: 'إسرائيل', lat: 31.8, lng: 35.2, w: 7 },
  { code: 'UA', ar: 'أوكرانيا', lat: 50.4, lng: 30.5, w: 6 },
  { code: 'NL', ar: 'هولندا', lat: 52.4, lng: 4.9, w: 5 },
  { code: 'AU', ar: 'أستراليا', lat: -33.9, lng: 151.2, w: 3 },
  { code: 'CA', ar: 'كندا', lat: 45.4, lng: -75.7, w: 4 },
  { code: 'PK', ar: 'باكستان', lat: 33.7, lng: 73.0, w: 4 },
  { code: 'NG', ar: 'نيجيريا', lat: 9.1, lng: 7.5, w: 5 },
  { code: 'VN', ar: 'فيتنام', lat: 21.0, lng: 105.8, w: 4 },
  { code: 'ID', ar: 'إندونيسيا', lat: -6.2, lng: 106.8, w: 3 },
  { code: 'MX', ar: 'المكسيك', lat: 19.4, lng: -99.1, w: 3 },
  { code: 'PL', ar: 'بولندا', lat: 52.2, lng: 21.0, w: 3 },
  { code: 'KR', ar: 'كوريا الجنوبية', lat: 37.6, lng: 127.0, w: 4 },
  { code: 'QA', ar: 'قطر', lat: 25.3, lng: 51.5, w: 2 },
  { code: 'JO', ar: 'الأردن', lat: 31.9, lng: 35.9, w: 2 },
  { code: 'MA', ar: 'المغرب', lat: 34.0, lng: -6.8, w: 2 },
];

const ATTACKS = [
  { id: 'ddos', ar: 'هجوم حجب الخدمة', en: 'DDoS', icon: '🌊', sev: 'critical', w: 15 },
  { id: 'brute', ar: 'القوة الغاشمة', en: 'Brute Force', icon: '🔨', sev: 'high', w: 18 },
  { id: 'sqli', ar: 'حقن SQL', en: 'SQL Injection', icon: '💉', sev: 'critical', w: 12 },
  { id: 'xss', ar: 'XSS', en: 'XSS Attack', icon: '🕷️', sev: 'high', w: 10 },
  { id: 'phish', ar: 'تصيد احتيالي', en: 'Phishing', icon: '🎣', sev: 'medium', w: 20 },
  { id: 'ransom', ar: 'فدية', en: 'Ransomware', icon: '🔐', sev: 'critical', w: 8 },
  { id: 'malware', ar: 'برمجية خبيثة', en: 'Malware', icon: '🦠', sev: 'high', w: 14 },
  { id: 'scan', ar: 'فحص منافذ', en: 'Port Scan', icon: '🔍', sev: 'low', w: 22 },
  { id: 'mitm', ar: 'هجوم وسيط', en: 'MITM', icon: '👤', sev: 'high', w: 6 },
  { id: 'zero', ar: 'يوم صفر', en: 'Zero-Day', icon: '💀', sev: 'critical', w: 3 },
  { id: 'cred', ar: 'حشو بيانات', en: 'Credential Stuffing', icon: '🔑', sev: 'high', w: 10 },
  { id: 'dns', ar: 'تزييف DNS', en: 'DNS Spoofing', icon: '🌐', sev: 'medium', w: 7 },
  { id: 'apt', ar: 'تهديد متقدم', en: 'APT', icon: '🎯', sev: 'critical', w: 4 },
  { id: 'exfil', ar: 'تسريب بيانات', en: 'Data Exfil', icon: '📤', sev: 'critical', w: 5 },
  { id: 'c2', ar: 'قيادة وسيطرة', en: 'C2 Beacon', icon: '📡', sev: 'high', w: 6 },
  { id: 'shell', ar: 'قشرة ويب', en: 'Web Shell', icon: '🐚', sev: 'critical', w: 4 },
  { id: 'crypto', ar: 'تعدين خفي', en: 'Cryptojacking', icon: '⛏️', sev: 'medium', w: 8 },
  { id: 'supply', ar: 'سلسلة توريد', en: 'Supply Chain', icon: '📦', sev: 'critical', w: 2 },
];

const SECTORS = [
  { ar: 'البنوك', en: 'Banking', icon: '🏦' },
  { ar: 'الحكومة', en: 'Government', icon: '🏛️' },
  { ar: 'الصحة', en: 'Healthcare', icon: '🏥' },
  { ar: 'التعليم', en: 'Education', icon: '🎓' },
  { ar: 'الاتصالات', en: 'Telecom', icon: '📡' },
  { ar: 'الطاقة', en: 'Energy', icon: '⚡' },
  { ar: 'التقنية', en: 'Technology', icon: '💻' },
  { ar: 'الدفاع', en: 'Defense', icon: '🛡️' },
];

const APT_GROUPS = [
  'APT28', 'APT29', 'APT41', 'Lazarus', 'Sandworm', 'Turla',
  'FIN7', 'DarkSide', 'REvil', 'Conti', 'MuddyWater', 'OilRig',
  'Charming Kitten', 'Kimsuky', 'Hafnium', 'Nobelium', 'Lapsus$',
];

function wRand<T extends { w: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) { r -= i.w; if (r <= 0) return i; }
  return items[items.length - 1];
}

function rIP(): string {
  const f = [1,2,5,8,14,23,27,31,37,41,45,46,49,58,72,77,80,85,91,93,95,101,103,110,115,120,128,136,142,148,155,160,168,176,185,193,198,203,210,220];
  return `${f[Math.floor(Math.random()*f.length)]}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*254)+1}`;
}

function genAttack() {
  const src = wRand(COUNTRIES);
  let tgt = wRand(COUNTRIES);
  while (tgt.code === src.code) tgt = wRand(COUNTRIES);
  const atk = wRand(ATTACKS);
  const sec = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  const isAPT = atk.id === 'apt' || (atk.sev === 'critical' && Math.random() < 0.3);
  const ts = new Date(Date.now() - Math.floor(Math.random() * 120000));
  return {
    id: crypto.randomUUID(),
    timestamp: ts.toISOString(),
    source: { country: src.code, countryAr: src.ar, lat: src.lat + (Math.random()-0.5)*4, lng: src.lng + (Math.random()-0.5)*4, ip: rIP() },
    target: { country: tgt.code, countryAr: tgt.ar, lat: tgt.lat + (Math.random()-0.5)*4, lng: tgt.lng + (Math.random()-0.5)*4, ip: rIP(), port: [80,443,22,3389,8080,53,445,3306][Math.floor(Math.random()*8)] },
    attack: { type: atk.id, nameAr: atk.ar, nameEn: atk.en, icon: atk.icon, severity: atk.sev },
    sector: { nameAr: sec.ar, nameEn: sec.en, icon: sec.icon },
    aptGroup: isAPT ? APT_GROUPS[Math.floor(Math.random()*APT_GROUPS.length)] : null,
    blocked: Math.random() < 0.65,
  };
}

function genStats() {
  const total = Math.floor(12847 + Math.random() * 500);
  const blocked = Math.floor(total * (0.62 + Math.random() * 0.08));
  return {
    totalAttacks24h: total,
    blockedAttacks24h: blocked,
    criticalAlerts: Math.floor(total * 0.1),
    activeAPTs: Math.floor(3 + Math.random() * 5),
    blockRate: Math.round((blocked / total) * 100),
    topAttackers: COUNTRIES.sort((a,b) => b.w - a.w).slice(0,10).map(c => ({ code: c.code, nameAr: c.ar, attacks: Math.floor(c.w * (100 + Math.random()*200)) })),
    topAttackTypes: ATTACKS.sort((a,b) => b.w - a.w).slice(0,8).map(a => ({ type: a.id, nameAr: a.ar, icon: a.icon, count: Math.floor(a.w * (50 + Math.random()*100)), severity: a.sev })),
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 50);
    const attacks = Array.from({ length: count }, genAttack).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const response: Record<string, unknown> = { attacks };
    if (searchParams.get('stats') !== 'false') response.stats = genStats();
    return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Threat map API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
