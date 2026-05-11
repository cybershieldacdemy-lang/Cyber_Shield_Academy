"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════ */

const GLOBE_RADIUS = 100;
const ARC_SEGMENTS = 64;
const TRAIL_LENGTH = 16;
const MAX_ARCS = 80;

interface CityData {
    id: string; name: string; nameAr: string; country: string;
    lat: number; lng: number; weight: number;
}

const CITIES: CityData[] = [
    { id: "nyc", name: "New York", nameAr: "نيويورك", country: "US", lat: 40.7128, lng: -74.006, weight: 8 },
    { id: "sf", name: "San Francisco", nameAr: "سان فرانسيسكو", country: "US", lat: 37.7749, lng: -122.4194, weight: 6 },
    { id: "chi", name: "Chicago", nameAr: "شيكاغو", country: "US", lat: 41.8781, lng: -87.6298, weight: 5 },
    { id: "dc", name: "Washington DC", nameAr: "واشنطن", country: "US", lat: 38.9072, lng: -77.0369, weight: 7 },
    { id: "dal", name: "Dallas", nameAr: "دالاس", country: "US", lat: 32.7767, lng: -96.797, weight: 4 },
    { id: "mia", name: "Miami", nameAr: "ميامي", country: "US", lat: 25.7617, lng: -80.1918, weight: 3 },
    { id: "tor", name: "Toronto", nameAr: "تورونتو", country: "CA", lat: 43.651, lng: -79.347, weight: 3 },
    { id: "mex", name: "Mexico City", nameAr: "مكسيكو", country: "MX", lat: 19.4326, lng: -99.1332, weight: 2 },
    { id: "lon", name: "London", nameAr: "لندن", country: "GB", lat: 51.5074, lng: -0.1278, weight: 8 },
    { id: "fra", name: "Frankfurt", nameAr: "فرانكفورت", country: "DE", lat: 50.1109, lng: 8.6821, weight: 6 },
    { id: "par", name: "Paris", nameAr: "باريس", country: "FR", lat: 48.8566, lng: 2.3522, weight: 5 },
    { id: "ams", name: "Amsterdam", nameAr: "أمستردام", country: "NL", lat: 52.3676, lng: 4.9041, weight: 5 },
    { id: "sto", name: "Stockholm", nameAr: "ستوكهولم", country: "SE", lat: 59.3293, lng: 18.0686, weight: 3 },
    { id: "buc", name: "Bucharest", nameAr: "بوخارست", country: "RO", lat: 44.4268, lng: 26.1025, weight: 3 },
    { id: "mos", name: "Moscow", nameAr: "موسكو", country: "RU", lat: 55.7558, lng: 37.6173, weight: 9 },
    { id: "spb", name: "St. Petersburg", nameAr: "سانت بطرسبرغ", country: "RU", lat: 59.9343, lng: 30.3351, weight: 5 },
    { id: "dxb", name: "Dubai", nameAr: "دبي", country: "AE", lat: 25.2048, lng: 55.2708, weight: 4 },
    { id: "riy", name: "Riyadh", nameAr: "الرياض", country: "SA", lat: 24.7136, lng: 46.6753, weight: 3 },
    { id: "teh", name: "Tehran", nameAr: "طهران", country: "IR", lat: 35.6892, lng: 51.389, weight: 5 },
    { id: "ist", name: "Istanbul", nameAr: "إسطنبول", country: "TR", lat: 41.0082, lng: 28.9784, weight: 3 },
    { id: "bei", name: "Beijing", nameAr: "بكين", country: "CN", lat: 39.9042, lng: 116.4074, weight: 10 },
    { id: "sha", name: "Shanghai", nameAr: "شنغهاي", country: "CN", lat: 31.2304, lng: 121.4737, weight: 7 },
    { id: "shn", name: "Shenzhen", nameAr: "شنتشن", country: "CN", lat: 22.5431, lng: 114.0579, weight: 5 },
    { id: "tok", name: "Tokyo", nameAr: "طوكيو", country: "JP", lat: 35.6762, lng: 139.6503, weight: 6 },
    { id: "seo", name: "Seoul", nameAr: "سيول", country: "KR", lat: 37.5665, lng: 126.978, weight: 5 },
    { id: "sin", name: "Singapore", nameAr: "سنغافورة", country: "SG", lat: 1.3521, lng: 103.8198, weight: 5 },
    { id: "mum", name: "Mumbai", nameAr: "مومباي", country: "IN", lat: 19.076, lng: 72.8777, weight: 6 },
    { id: "ban", name: "Bangalore", nameAr: "بنغالور", country: "IN", lat: 12.9716, lng: 77.5946, weight: 4 },
    { id: "hcm", name: "Ho Chi Minh", nameAr: "هو تشي منه", country: "VN", lat: 10.8231, lng: 106.6297, weight: 3 },
    { id: "sao", name: "São Paulo", nameAr: "ساو باولو", country: "BR", lat: -23.5505, lng: -46.6333, weight: 5 },
    { id: "bue", name: "Buenos Aires", nameAr: "بوينس آيرس", country: "AR", lat: -34.6037, lng: -58.3816, weight: 3 },
    { id: "bog", name: "Bogotá", nameAr: "بوغوتا", country: "CO", lat: 4.711, lng: -74.0721, weight: 2 },
    { id: "lag", name: "Lagos", nameAr: "لاغوس", country: "NG", lat: 6.5244, lng: 3.3792, weight: 4 },
    { id: "cai", name: "Cairo", nameAr: "القاهرة", country: "EG", lat: 30.0444, lng: 31.2357, weight: 3 },
    { id: "joh", name: "Johannesburg", nameAr: "جوهانسبرغ", country: "ZA", lat: -26.2041, lng: 28.0473, weight: 3 },
    { id: "syd", name: "Sydney", nameAr: "سيدني", country: "AU", lat: -33.8688, lng: 151.2093, weight: 4 },
];

const ATTACK_TYPES = [
    { type: "DDoS", icon: "🌊", color: "#FF3B3B", descAr: "هجوم حجب الخدمة الموزع — إغراق الخادم بطلبات وهمية لتعطيله", descEn: "Distributed Denial of Service — overwhelms server with fake requests" },
    { type: "Phishing", icon: "🎣", color: "#FFD000", descAr: "تصيّد احتيالي — رسائل مزيفة لسرقة بيانات المستخدم", descEn: "Fake messages designed to steal user credentials" },
    { type: "Malware", icon: "🦠", color: "#C44DFF", descAr: "برمجيات خبيثة — تثبيت برامج ضارة للتحكم بالنظام", descEn: "Malicious software installed to control the system" },
    { type: "Ransomware", icon: "🔒", color: "#FF8C00", descAr: "برمجيات الفدية — تشفير البيانات وطلب فدية مالية", descEn: "Encrypts data and demands ransom payment" },
    { type: "SQLi", icon: "💉", color: "#00D4FF", descAr: "حقن SQL — استغلال ثغرات قواعد البيانات لسرقة المعلومات", descEn: "SQL injection — exploits database vulnerabilities" },
];

const COUNTRY_NAMES: Record<string, string> = {
    US: "United States", CN: "China", RU: "Russia", GB: "United Kingdom",
    DE: "Germany", FR: "France", NL: "Netherlands", SE: "Sweden",
    JP: "Japan", KR: "South Korea", SG: "Singapore", IN: "India",
    BR: "Brazil", AR: "Argentina", CO: "Colombia", NG: "Nigeria",
    EG: "Egypt", ZA: "South Africa", AU: "Australia", AE: "UAE",
    SA: "Saudi Arabia", IR: "Iran", TR: "Turkey", CA: "Canada",
    MX: "Mexico", VN: "Vietnam", RO: "Romania",
};

const COUNTRY_NAMES_AR: Record<string, string> = {
    US: "الولايات المتحدة", CN: "الصين", RU: "روسيا", GB: "بريطانيا",
    DE: "ألمانيا", FR: "فرنسا", NL: "هولندا", SE: "السويد",
    JP: "اليابان", KR: "كوريا الجنوبية", SG: "سنغافورة", IN: "الهند",
    BR: "البرازيل", AR: "الأرجنتين", CO: "كولومبيا", NG: "نيجيريا",
    EG: "مصر", ZA: "جنوب أفريقيا", AU: "أستراليا", AE: "الإمارات",
    SA: "السعودية", IR: "إيران", TR: "تركيا", CA: "كندا",
    MX: "المكسيك", VN: "فيتنام", RO: "رومانيا",
};

const ISPS = [
    "CloudFlare Inc.", "Amazon AWS", "Microsoft Azure", "Google Cloud",
    "DigitalOcean", "OVH SAS", "Hetzner Online", "Alibaba Cloud",
    "Tencent Cloud", "China Telecom", "Rostelecom", "Deutsche Telekom",
    "NTT Communications", "Korea Telecom", "SingTel", "Reliance Jio",
    "Verizon Business", "AT&T Services", "Comcast Cable", "BT Group",
];

const SEVERITY_CONFIG: Record<string, { label: string; labelAr: string; color: string; bg: string }> = {
    low: { label: "LOW", labelAr: "منخفض", color: "#38b2ac", bg: "rgba(56,178,172,0.15)" },
    medium: { label: "MEDIUM", labelAr: "متوسط", color: "#FFD000", bg: "rgba(255,208,0,0.15)" },
    high: { label: "HIGH", labelAr: "مرتفع", color: "#FF8C00", bg: "rgba(255,140,0,0.15)" },
    critical: { label: "CRITICAL", labelAr: "حرج", color: "#FF3B3B", bg: "rgba(255,59,59,0.15)" },
};

const CONTINENT_PATHS: [number, number][][] = [
    [[-170,65],[-168,72],[-145,70],[-140,72],[-130,72],[-120,75],[-100,75],[-90,73],[-85,75],[-80,73],[-70,73],[-60,65],[-55,52],[-57,47],[-66,44],[-68,47],[-70,43],[-74,40],[-80,32],[-82,25],[-88,18],[-87,15],[-83,10],[-79,8],[-77,8],[-80,10],[-85,12],[-87,15],[-90,16],[-92,19],[-97,18],[-105,20],[-105,24],[-110,30],[-117,32],[-122,37],[-124,40],[-124,48],[-130,55],[-135,57],[-140,60],[-150,60],[-160,58],[-165,60],[-170,65]],
    [[-77,8],[-72,12],[-67,11],[-60,8],[-52,3],[-50,-1],[-48,-6],[-35,-5],[-35,-10],[-37,-15],[-39,-18],[-40,-22],[-42,-23],[-45,-23],[-48,-28],[-50,-30],[-52,-33],[-55,-34],[-58,-36],[-62,-38],[-65,-42],[-65,-46],[-67,-50],[-68,-54],[-72,-54],[-72,-50],[-73,-45],[-74,-42],[-76,-38],[-73,-36],[-71,-30],[-70,-25],[-70,-18],[-75,-15],[-76,-10],[-78,-5],[-80,0],[-79,5],[-77,8]],
    [[-10,36],[-8,38],[-9,42],[-3,44],[0,43],[3,43],[6,46],[7,48],[5,50],[3,51],[5,54],[8,55],[10,57],[12,56],[13,55],[18,55],[20,57],[22,55],[24,57],[26,56],[28,56],[30,60],[28,63],[26,66],[20,68],[18,70],[25,71],[28,70],[30,70],[32,65],[36,64],[40,68],[38,60],[35,57],[30,55],[28,50],[25,45],[22,42],[20,40],[15,38],[12,38],[10,44],[7,44],[3,38],[0,36],[-5,36],[-10,36]],
    [[-17,15],[-16,12],[-15,11],[-12,8],[-8,5],[-5,5],[0,6],[5,4],[10,4],[10,2],[9,1],[12,-5],[20,-10],[28,-16],[33,-22],[35,-26],[33,-30],[30,-34],[27,-34],[22,-34],[18,-33],[15,-28],[12,-18],[12,-5],[9,1],[10,2],[10,4],[15,6],[20,8],[24,10],[30,12],[32,12],[35,12],[38,14],[42,12],[44,12],[48,8],[50,12],[44,15],[42,17],[36,22],[35,28],[32,31],[30,31],[25,32],[15,33],[10,36],[5,36],[0,36],[-5,36],[-10,34],[-13,28],[-17,22],[-17,15]],
    [[40,68],[50,70],[60,72],[70,73],[80,72],[90,72],[100,70],[110,68],[120,68],[130,65],[135,60],[140,55],[135,48],[130,42],[128,38],[125,35],[122,30],[118,25],[115,22],[110,20],[108,15],[105,10],[100,5],[100,1],[104,1],[108,-7],[115,-8],[120,-8],[128,-5],[130,-3],[135,-5],[140,-8],[140,-3],[145,0],[145,-5],[150,-6],[148,-2],[142,0],[138,5],[137,10],[132,15],[128,18],[125,20],[122,25],[120,28],[118,32],[105,22],[100,22],[97,18],[95,15],[92,22],[88,22],[85,25],[80,28],[76,30],[72,25],[68,24],[65,25],[60,25],[58,27],[55,25],[51,24],[48,30],[45,30],[42,37],[40,37],[36,35],[30,35],[28,40],[30,42],[35,42],[38,45],[40,48],[42,50],[50,52],[55,50],[60,55],[65,55],[70,58],[65,60],[60,60],[55,58],[50,57],[42,55],[40,60],[38,60],[36,64],[40,68]],
    [[113,-12],[115,-15],[114,-22],[116,-25],[118,-30],[120,-33],[125,-35],[130,-33],[135,-35],[138,-34],[140,-38],[145,-38],[148,-37],[150,-34],[153,-28],[150,-23],[147,-20],[146,-18],[143,-14],[139,-12],[136,-12],[132,-14],[130,-13],[128,-15],[126,-13],[123,-15],[120,-13],[118,-14],[116,-13],[113,-12]],
    [[-45,60],[-42,60],[-38,65],[-30,68],[-22,70],[-18,75],[-20,78],[-25,80],[-35,82],[-45,82],[-52,80],[-55,78],[-55,75],[-50,70],[-48,65],[-45,60]],
    [[-10,51],[-6,52],[-5,54],[-3,56],[-5,58],[-3,59],[-2,57],[0,56],[2,53],[0,51],[-3,50],[-5,50],[-10,51]],
    [[130,31],[131,33],[132,34],[135,34],[137,35],[139,35],[140,38],[140,40],[141,42],[143,44],[145,45],[144,43],[142,40],[141,38],[140,36],[138,35],[135,33],[132,32],[130,31]],
];

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

interface AttackData {
    id: number;
    source: CityData; target: CityData;
    type: string; color: string;
    sourceIP: string; targetIP: string;
    isp: string;
    severity: "low" | "medium" | "high" | "critical";
    timestamp: number;
    feed?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeBackendEvent(raw: any): AttackData | null {
    if (raw.source_ip || raw.source_geo) {
        const sg = raw.source_geo as { lat: number; lng: number; country?: string; countryCode?: string; city?: string } | undefined;
        const tg = raw.target_geo as { lat: number; lng: number; country?: string; countryCode?: string; city?: string } | undefined;
        if (!sg || !tg || !sg.lat || !tg.lat) return null;
        const at = ATTACK_TYPES.find(a => a.type === raw.attack_type) || ATTACK_TYPES[4];
        return {
            id: Date.now() + Math.random(),
            source: { id: (sg.city || "unknown").toLowerCase().replace(/\s+/g, "_"), name: sg.city || "Unknown", nameAr: sg.city || "غير معروف", country: sg.countryCode || (sg.country || "??").slice(0, 2).toUpperCase(), lat: sg.lat, lng: sg.lng, weight: 5 },
            target: { id: (tg.city || "unknown").toLowerCase().replace(/\s+/g, "_"), name: tg.city || "Unknown", nameAr: tg.city || "غير معروف", country: tg.countryCode || (tg.country || "??").slice(0, 2).toUpperCase(), lat: tg.lat, lng: tg.lng, weight: 5 },
            type: (raw.attack_type as string) || "SQLi", color: at.color,
            sourceIP: (raw.source_ip as string) || randomIP(), targetIP: (raw.target_ip as string) || randomIP(),
            isp: (raw.isp as string) || "", severity: ((raw.severity as string) || "medium") as AttackData["severity"],
            timestamp: typeof raw.timestamp === "number" ? raw.timestamp : Date.now(), feed: (raw.feed as string) || "backend",
        };
    }
    return raw as AttackData;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ActiveArc { data: AttackData; progress: number; speed: number; curve: THREE.QuadraticBezierCurve3; line: THREE.Line; head: THREE.Sprite; colorRGB: { r: number; g: number; b: number }; }
interface ActiveRipple { mesh: THREE.Mesh; life: number; maxLife: number; }

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

function latLngTo3D(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

function randomIP() { return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`; }

function weightedRandom(items: CityData[]): CityData {
    const total = items.reduce((s, c) => s + c.weight, 0);
    let r = Math.random() * total;
    for (const item of items) { r -= item.weight; if (r <= 0) return item; }
    return items[items.length - 1];
}

function createGlowTexture(color: string): THREE.CanvasTexture {
    const c = document.createElement("canvas"); c.width = 64; c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.15, color); g.addColorStop(0.6, color + "55"); g.addColorStop(1, "transparent");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function ThreatMapClient() {
    // ─── REFS ───
    const containerRef = useRef<HTMLDivElement>(null);
    const attackQueueRef = useRef<AttackData[]>([]);
    const activeArcsRef = useRef<ActiveArc[]>([]);
    const activeRipplesRef = useRef<ActiveRipple[]>([]);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const pausedRef = useRef(false);
    const filterRef = useRef<string | null>(null);
    const totalRef = useRef(0);
    const critRef = useRef(0);
    const srcStatsRef = useRef<Record<string, number>>({});
    const tgtStatsRef = useRef<Record<string, number>>({});
    const typeStatsRef = useRef<Record<string, number>>({});
    const rateWindowRef = useRef<number[]>([]);
    const recentRef = useRef<AttackData[]>([]);
    const labelMap = useRef<Map<string, HTMLSpanElement>>(new Map());
    const glowCache = useRef<Map<string, THREE.CanvasTexture>>(new Map());

    // ─── STATE ───
    const [paused, setPaused] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [totalAttacks, setTotalAttacks] = useState(0);
    const [criticalAlerts, setCriticalAlerts] = useState(0);
    const [attackRate, setAttackRate] = useState(0);
    const [topSources, setTopSources] = useState<[string, number][]>([]);
    const [topTargets, setTopTargets] = useState<[string, number][]>([]);
    const [typeDistribution, setTypeDistribution] = useState<[string, number][]>([]);
    const [recentAttacks, setRecentAttacks] = useState<AttackData[]>([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [feedMode, setFeedMode] = useState<string>("offline");
    const [selectedAttack, setSelectedAttack] = useState<AttackData | null>(null);
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(true);
    const [severityFilter, setSeverityFilter] = useState<string | null>(null);

    // ─── CALLBACKS ───
    const getGlowTex = useCallback((color: string) => {
        if (!glowCache.current.has(color)) glowCache.current.set(color, createGlowTexture(color));
        return glowCache.current.get(color)!;
    }, []);

    const toggleFilter = useCallback((type: string) => {
        setActiveFilter(prev => { const n = prev === type ? null : type; filterRef.current = n; return n; });
    }, []);

    const togglePause = useCallback(() => {
        setPaused(prev => { pausedRef.current = !prev; return !prev; });
    }, []);

    const processAttack = useCallback((data: AttackData) => {
        if (pausedRef.current) return;
        if (filterRef.current && data.type !== filterRef.current) return;
        attackQueueRef.current.push(data);
        totalRef.current++;
        rateWindowRef.current.push(Date.now());
        if (data.severity === "critical") critRef.current++;
        const sn = COUNTRY_NAMES[data.source.country] || data.source.country;
        const tn = COUNTRY_NAMES[data.target.country] || data.target.country;
        srcStatsRef.current[sn] = (srcStatsRef.current[sn] || 0) + 1;
        tgtStatsRef.current[tn] = (tgtStatsRef.current[tn] || 0) + 1;
        typeStatsRef.current[data.type] = (typeStatsRef.current[data.type] || 0) + 1;
        recentRef.current = [data, ...recentRef.current.slice(0, 19)];
    }, []);

    // ─── WEBSOCKET + SIMULATION ───
    useEffect(() => {
        let ws: WebSocket | null = null;
        let simInterval: ReturnType<typeof setInterval> | undefined;

        function startSim() {
            if (simInterval) return;
            simInterval = setInterval(() => {
                if (pausedRef.current) return;
                const n = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < n; i++) {
                    const src = weightedRandom(CITIES);
                    let tgt = weightedRandom(CITIES);
                    let a = 0;
                    while (tgt.id === src.id && a < 10) { tgt = weightedRandom(CITIES); a++; }
                    const at = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
                    const sev: AttackData["severity"] = Math.random() < 0.05 ? "critical" : Math.random() < 0.15 ? "high" : Math.random() < 0.4 ? "medium" : "low";
                    processAttack({
                        id: Date.now() + Math.random(), source: src, target: tgt,
                        type: at.type, color: at.color,
                        sourceIP: randomIP(), targetIP: randomIP(),
                        isp: ISPS[Math.floor(Math.random() * ISPS.length)],
                        severity: sev, timestamp: Date.now(),
                    });
                }
            }, 150);
        }

        try {
            ws = new WebSocket("ws://localhost:3001");
            ws.onopen = () => { setWsConnected(true); if (simInterval) { clearInterval(simInterval); simInterval = undefined; } fetch("http://localhost:3002/api/status").then(r => r.json()).then(d => setFeedMode(d.mode || "live")).catch(() => setFeedMode("live")); };
            ws.onmessage = (e) => { try { const raw = JSON.parse(e.data); const normalized = normalizeBackendEvent(raw); if (normalized) processAttack(normalized); } catch { /* skip */ } };
            ws.onerror = () => startSim();
            ws.onclose = () => { setWsConnected(false); setFeedMode("offline"); startSim(); };
        } catch { startSim(); }

        const wsTimeout = setTimeout(() => { if (!ws || ws.readyState !== WebSocket.OPEN) startSim(); }, 2000);
        return () => { clearTimeout(wsTimeout); if (ws) ws.close(); if (simInterval) clearInterval(simInterval); };
    }, [processAttack]);

    // ─── STATS UPDATE ───
    useEffect(() => {
        const iv = setInterval(() => {
            setTotalAttacks(totalRef.current);
            setCriticalAlerts(critRef.current);
            const now = Date.now();
            rateWindowRef.current = rateWindowRef.current.filter(t => now - t < 5000);
            setAttackRate(Math.round(rateWindowRef.current.length / 5));
            setTopSources(Object.entries(srcStatsRef.current).sort((a, b) => b[1] - a[1]).slice(0, 6));
            setTopTargets(Object.entries(tgtStatsRef.current).sort((a, b) => b[1] - a[1]).slice(0, 6));
            setTypeDistribution(Object.entries(typeStatsRef.current).sort((a, b) => b[1] - a[1]));
            setRecentAttacks([...recentRef.current]);
        }, 400);
        return () => clearInterval(iv);
    }, []);

    /* ═══════════════════════════════════════════════════
       THREE.JS SETUP
       ═══════════════════════════════════════════════════ */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const W = container.clientWidth; const H = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0B0F1A);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, W / H, 1, 2000);
        camera.position.set(0, 40, 280);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // ── Orbit Controls ──
        let orbPhi = Math.PI / 2.5, orbTheta = 0, orbRadius = 280;
        let isDragging = false, dragX = 0, dragY = 0;
        const autoRotSpeed = 0.0008;

        const onMouseDown = (e: MouseEvent) => { isDragging = true; dragX = e.clientX; dragY = e.clientY; };
        const onMouseMove = (e: MouseEvent) => { if (!isDragging) return; orbTheta -= (e.clientX - dragX) * 0.005; orbPhi = Math.max(0.3, Math.min(Math.PI - 0.3, orbPhi - (e.clientY - dragY) * 0.005)); dragX = e.clientX; dragY = e.clientY; };
        const onMouseUp = () => { isDragging = false; };
        const onWheel = (e: WheelEvent) => { e.preventDefault(); orbRadius = Math.max(150, Math.min(600, orbRadius + e.deltaY * 0.3)); };

        let lastTouchX = 0, lastTouchY = 0, lastPinchDist = 0;
        const onTouchStart = (e: TouchEvent) => { if (e.touches.length === 1) { isDragging = true; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; } else if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; lastPinchDist = Math.sqrt(dx * dx + dy * dy); } };
        const onTouchMove = (e: TouchEvent) => { e.preventDefault(); if (e.touches.length === 1 && isDragging) { orbTheta -= (e.touches[0].clientX - lastTouchX) * 0.005; orbPhi = Math.max(0.3, Math.min(Math.PI - 0.3, orbPhi - (e.touches[0].clientY - lastTouchY) * 0.005)); lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; } else if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; const dist = Math.sqrt(dx * dx + dy * dy); if (lastPinchDist > 0) orbRadius = Math.max(150, Math.min(600, orbRadius * (lastPinchDist / dist))); lastPinchDist = dist; } };
        const onTouchEnd = () => { isDragging = false; lastPinchDist = 0; };

        renderer.domElement.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
        renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: false });
        renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: false });
        renderer.domElement.addEventListener("touchend", onTouchEnd);

        // ── Globe ──
        const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
        const globeMat = new THREE.ShaderMaterial({
            vertexShader: `varying vec3 vNormal; varying vec3 vViewDir; void main() { vec4 mvPos = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vViewDir = normalize(-mvPos.xyz); gl_Position = projectionMatrix * mvPos; }`,
            fragmentShader: `varying vec3 vNormal; varying vec3 vViewDir; void main() { float rim = 1.0 - abs(dot(vNormal, vViewDir)); rim = pow(rim, 2.5); vec3 base = vec3(0.03, 0.04, 0.08); vec3 rimCol = vec3(0.0, 0.35, 0.65); vec3 col = mix(base, rimCol, rim); gl_FragColor = vec4(col, 0.95); }`,
            transparent: true,
        });
        scene.add(new THREE.Mesh(globeGeo, globeMat));

        // ── Atmosphere ──
        const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.18, 64, 64);
        const atmoMat = new THREE.ShaderMaterial({
            vertexShader: `varying vec3 vNormal; varying vec3 vViewDir; void main() { vec4 mvPos = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vViewDir = normalize(-mvPos.xyz); gl_Position = projectionMatrix * mvPos; }`,
            fragmentShader: `varying vec3 vNormal; varying vec3 vViewDir; void main() { float i = pow(0.55 - dot(vNormal, vViewDir), 2.0); gl_FragColor = vec4(0.0, 0.5, 1.0, i * 0.25); }`,
            transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
        });
        scene.add(new THREE.Mesh(atmoGeo, atmoMat));

        // ── Grid ──
        const gridMat = new THREE.LineBasicMaterial({ color: 0x0a1a2f, transparent: true, opacity: 0.15 });
        for (let lat = -60; lat <= 80; lat += 20) { const pts: THREE.Vector3[] = []; for (let lng = -180; lng <= 180; lng += 3) pts.push(latLngTo3D(lat, lng, GLOBE_RADIUS * 1.001)); scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat)); }
        for (let lng = -180; lng < 180; lng += 30) { const pts: THREE.Vector3[] = []; for (let lat = -80; lat <= 80; lat += 3) pts.push(latLngTo3D(lat, lng, GLOBE_RADIUS * 1.001)); scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat)); }

        // ── Continents ──
        const contMat = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.3 });
        for (const coords of CONTINENT_PATHS) { const pts = coords.map(([lng, lat]) => latLngTo3D(lat, lng, GLOBE_RADIUS * 1.002)); scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), contMat)); }

        // ── City Markers ──
        const cityGlow = createGlowTexture("#00D4FF");
        for (const city of CITIES) { const pos = latLngTo3D(city.lat, city.lng, GLOBE_RADIUS * 1.006); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cityGlow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.position.copy(pos); s.scale.setScalar(2.2); scene.add(s); }

        // ── Stars ──
        const starPos = new Float32Array(4500);
        for (let i = 0; i < 4500; i++) starPos[i] = (Math.random() - 0.5) * 2000;
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x1a2540, size: 0.6, transparent: true, opacity: 0.5 })));

        // ── Animation Loop ──
        const clock = new THREE.Clock();
        let animId: number;

        const animate = () => {
            animId = requestAnimationFrame(animate);
            const dt = Math.min(clock.getDelta(), 0.05);

            if (!isDragging) orbTheta += autoRotSpeed;
            camera.position.x = orbRadius * Math.sin(orbPhi) * Math.cos(orbTheta);
            camera.position.y = orbRadius * Math.cos(orbPhi);
            camera.position.z = orbRadius * Math.sin(orbPhi) * Math.sin(orbTheta);
            camera.lookAt(0, 0, 0);

            // Process queue
            while (attackQueueRef.current.length > 0 && activeArcsRef.current.length < MAX_ARCS) {
                const d = attackQueueRef.current.shift()!;
                const sp = latLngTo3D(d.source.lat, d.source.lng, GLOBE_RADIUS * 1.006);
                const ep = latLngTo3D(d.target.lat, d.target.lng, GLOBE_RADIUS * 1.006);
                const dist = sp.distanceTo(ep);
                const mp = sp.clone().add(ep).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.35);
                const curve = new THREE.QuadraticBezierCurve3(sp, mp, ep);
                const pts = curve.getPoints(ARC_SEGMENTS);
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const colors = new Float32Array((ARC_SEGMENTS + 1) * 3);
                geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
                geo.setDrawRange(0, 0);
                const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
                const line = new THREE.Line(geo, mat);
                scene.add(line);
                const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTex(d.color), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
                head.scale.setScalar(d.severity === "critical" ? 6 : 3.5);
                head.position.copy(sp);
                scene.add(head);
                const c3 = new THREE.Color(d.color);
                const speed = d.type === "SQLi" ? 0.7 : d.type === "DDoS" ? 0.5 : 0.3 + Math.random() * 0.3;
                activeArcsRef.current.push({ data: d, progress: 0, speed, curve, line, head, colorRGB: { r: c3.r, g: c3.g, b: c3.b } });
            }

            // Update arcs
            const liveArcs: ActiveArc[] = [];
            for (const arc of activeArcsRef.current) {
                arc.progress += arc.speed * dt;
                if (arc.progress >= 1) {
                    const ip = latLngTo3D(arc.data.target.lat, arc.data.target.lng, GLOBE_RADIUS * 1.006);
                    const rg = new THREE.RingGeometry(0.5, 1.2, 32);
                    const rm = new THREE.MeshBasicMaterial({ color: new THREE.Color(arc.data.color), transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
                    const ring = new THREE.Mesh(rg, rm);
                    ring.position.copy(ip);
                    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), ip.clone().normalize());
                    scene.add(ring);
                    activeRipplesRef.current.push({ mesh: ring, life: 0, maxLife: arc.data.severity === "critical" ? 1.5 : 0.8 });
                    scene.remove(arc.line); scene.remove(arc.head);
                    arc.line.geometry.dispose(); (arc.line.material as THREE.Material).dispose();
                    (arc.head.material as THREE.SpriteMaterial).dispose();
                    continue;
                }
                const headIdx = Math.floor(arc.progress * ARC_SEGMENTS);
                const colorAttr = arc.line.geometry.getAttribute("color") as THREE.BufferAttribute;
                for (let i = 0; i <= ARC_SEGMENTS; i++) {
                    if (i > headIdx) { colorAttr.setXYZ(i, 0, 0, 0); }
                    else { const fade = Math.max(0, 1 - (headIdx - i) / TRAIL_LENGTH); colorAttr.setXYZ(i, arc.colorRGB.r * fade, arc.colorRGB.g * fade, arc.colorRGB.b * fade); }
                }
                colorAttr.needsUpdate = true;
                arc.line.geometry.setDrawRange(0, headIdx + 1);
                arc.head.position.copy(arc.curve.getPoint(Math.min(arc.progress, 1)));
                liveArcs.push(arc);
            }
            activeArcsRef.current = liveArcs;

            // Ripples
            const liveRipples: ActiveRipple[] = [];
            for (const rip of activeRipplesRef.current) {
                rip.life += dt;
                if (rip.life >= rip.maxLife) { scene.remove(rip.mesh); rip.mesh.geometry.dispose(); (rip.mesh.material as THREE.Material).dispose(); continue; }
                const t = rip.life / rip.maxLife;
                rip.mesh.scale.setScalar(1 + t * 12);
                (rip.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.6;
                liveRipples.push(rip);
            }
            activeRipplesRef.current = liveRipples;

            // Labels
            const cW = container.clientWidth; const cH = container.clientHeight;
            const camNorm = camera.position.clone().normalize();
            labelMap.current.forEach((el, cityId) => {
                const city = CITIES.find(c => c.id === cityId);
                if (!city) return;
                const p3 = latLngTo3D(city.lat, city.lng, GLOBE_RADIUS * 1.02);
                const facing = camNorm.dot(p3.clone().normalize());
                if (facing < 0.15) { el.style.opacity = "0"; return; }
                const proj = p3.clone().project(camera);
                el.style.transform = `translate(${(proj.x * 0.5 + 0.5) * cW + 5}px, ${(-proj.y * 0.5 + 0.5) * cH - 5}px)`;
                el.style.opacity = String(Math.min(0.7, (facing - 0.15) * 1.5));
            });

            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => { const w = container.clientWidth; const h = container.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animId); window.removeEventListener("resize", onResize);
            renderer.domElement.removeEventListener("mousedown", onMouseDown); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp);
            renderer.domElement.removeEventListener("wheel", onWheel); renderer.domElement.removeEventListener("touchstart", onTouchStart); renderer.domElement.removeEventListener("touchmove", onTouchMove); renderer.domElement.removeEventListener("touchend", onTouchEnd);
            renderer.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
            for (const arc of activeArcsRef.current) { scene.remove(arc.line); scene.remove(arc.head); arc.line.geometry.dispose(); (arc.line.material as THREE.Material).dispose(); (arc.head.material as THREE.SpriteMaterial).dispose(); }
            for (const rip of activeRipplesRef.current) { scene.remove(rip.mesh); rip.mesh.geometry.dispose(); (rip.mesh.material as THREE.Material).dispose(); }
        };
    }, [getGlowTex]);

    /* ═══════════════════════════════════════════════════
       RENDER — CYBERPUNK 3-PANEL DASHBOARD
       ═══════════════════════════════════════════════════ */

    const typeColor = (t: string) => ATTACK_TYPES.find(a => a.type === t)?.color || "#888";
    const typeIcon = (t: string) => ATTACK_TYPES.find(a => a.type === t)?.icon || "⚡";
    const typeDesc = (t: string) => ATTACK_TYPES.find(a => a.type === t)?.descAr || "";
    const typeTotal = typeDistribution.reduce((s, [, n]) => s + n, 0) || 1;
    const filteredRecent = severityFilter ? recentAttacks.filter(a => a.severity === severityFilter) : recentAttacks;

    return (
        <div className="tm-root">
            {/* City Labels Layer */}
            <div className="tm-labels">
                {CITIES.map(city => (
                    <span key={city.id} ref={el => { if (el) labelMap.current.set(city.id, el); }} className="tm-city-label">{city.name}</span>
                ))}
            </div>

            {/* ═══════════════════════════════════════════════
                TOP STATUS BAR
                ═══════════════════════════════════════════════ */}
            <header className="tm-topbar">
                <div className="tm-topbar-left">
                    <div className="tm-live-dot" />
                    <h1 className="tm-title">CYBER THREAT MAP</h1>
                    <span className={`tm-badge ${wsConnected ? "tm-badge-live" : "tm-badge-sim"}`}>
                        {wsConnected ? feedMode === "live" ? "● LIVE INTEL" : "● WS CONNECTED" : "● LOCAL SIM"}
                    </span>
                </div>
                <div className="tm-topbar-stats">
                    <div className="tm-stat"><span className="tm-stat-label">ATTACKS</span><span className="tm-stat-value" style={{ color: "#00D4FF" }}>{totalAttacks.toLocaleString()}</span></div>
                    <div className="tm-stat-divider" />
                    <div className="tm-stat"><span className="tm-stat-label">PER SEC</span><span className="tm-stat-value" style={{ color: "#FFD000" }}>{attackRate}</span></div>
                    <div className="tm-stat-divider" />
                    <div className="tm-stat"><span className="tm-stat-label">CRITICAL</span><span className="tm-stat-value tm-critical-glow" style={{ color: "#FF3B3B" }}>{criticalAlerts}</span></div>
                </div>
                <div className="tm-topbar-controls">
                    <button className="tm-panel-toggle" onClick={() => setLeftOpen(!leftOpen)} title="Toggle Control Panel">☰</button>
                    <button className={`tm-ctrl-btn ${paused ? "tm-ctrl-active" : ""}`} onClick={togglePause}>{paused ? "▶ RESUME" : "⏸ PAUSE"}</button>
                    <button className="tm-panel-toggle" onClick={() => setRightOpen(!rightOpen)} title="Toggle Details Panel">☰</button>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════
                FILTER BAR
                ═══════════════════════════════════════════════ */}
            <div className="tm-filterbar">
                {ATTACK_TYPES.map(at => (
                    <button key={at.type} onClick={() => toggleFilter(at.type)} className={`tm-filter-btn ${activeFilter === at.type ? "active" : ""}`} style={{ "--fc": at.color } as React.CSSProperties}>
                        <span className="tm-filter-dot" style={{ background: at.color }} />
                        {at.icon} {at.type}
                    </button>
                ))}
                <button onClick={() => { setActiveFilter(null); filterRef.current = null; }} className={`tm-filter-btn ${!activeFilter ? "active" : ""}`} style={{ "--fc": "#00D4FF" } as React.CSSProperties}>
                    ALL
                </button>
            </div>

            {/* ═══════════════════════════════════════════════
                LEFT PANEL — CONTROL CENTER
                ═══════════════════════════════════════════════ */}
            <aside className={`tm-left-panel ${leftOpen ? "open" : "closed"}`}>
                {/* Live Stats */}
                <div className="tm-panel-section">
                    <div className="tm-section-title"><span className="tm-section-icon">📊</span>إحصائيات مباشرة</div>
                    <div className="tm-live-stats-grid">
                        <div className="tm-mini-stat">
                            <span className="tm-mini-value" style={{ color: "#00D4FF" }}>{totalAttacks.toLocaleString()}</span>
                            <span className="tm-mini-label">إجمالي الهجمات</span>
                        </div>
                        <div className="tm-mini-stat">
                            <span className="tm-mini-value" style={{ color: "#FFD000" }}>{attackRate}/s</span>
                            <span className="tm-mini-label">معدل الهجمات</span>
                        </div>
                        <div className="tm-mini-stat">
                            <span className="tm-mini-value" style={{ color: "#FF3B3B" }}>{criticalAlerts}</span>
                            <span className="tm-mini-label">تنبيهات حرجة</span>
                        </div>
                        <div className="tm-mini-stat">
                            <span className="tm-mini-value" style={{ color: "#7A00FF" }}>{Object.keys(srcStatsRef.current).length}</span>
                            <span className="tm-mini-label">دول مهاجمة</span>
                        </div>
                    </div>
                </div>

                {/* Severity Filter */}
                <div className="tm-panel-section">
                    <div className="tm-section-title"><span className="tm-section-icon">⚡</span>فلترة حسب الخطورة</div>
                    <div className="tm-severity-filters">
                        {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                            <button key={key} onClick={() => setSeverityFilter(severityFilter === key ? null : key)}
                                className={`tm-severity-btn ${severityFilter === key ? "active" : ""}`}
                                style={{ "--sc": cfg.color, "--sb": cfg.bg } as React.CSSProperties}>
                                {cfg.labelAr}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Attackers */}
                <div className="tm-panel-section">
                    <div className="tm-section-title"><span className="tm-section-icon" style={{ color: "#FF3B3B" }}>▲</span>أكثر الدول هجوماً</div>
                    {topSources.slice(0, 5).map(([c, n], i) => {
                        const maxVal = topSources[0]?.[1] || 1;
                        return (
                            <div key={c} className="tm-rank-row">
                                <span className="tm-rank-num">{i + 1}</span>
                                <span className="tm-rank-label">{c}</span>
                                <div className="tm-rank-bar-wrap"><div className="tm-rank-bar" style={{ width: `${(n / maxVal) * 100}%`, background: "linear-gradient(90deg, #FF3B3B44, #FF3B3B)" }} /></div>
                                <span className="tm-rank-value" style={{ color: "#FF6B6B" }}>{n}</span>
                            </div>
                        );
                    })}
                    {topSources.length === 0 && <div className="tm-empty">جاري جمع البيانات...</div>}
                </div>

                {/* Top Targets */}
                <div className="tm-panel-section">
                    <div className="tm-section-title"><span className="tm-section-icon" style={{ color: "#00D4FF" }}>▼</span>أكثر الدول استهدافاً</div>
                    {topTargets.slice(0, 5).map(([c, n], i) => {
                        const maxVal = topTargets[0]?.[1] || 1;
                        return (
                            <div key={c} className="tm-rank-row">
                                <span className="tm-rank-num">{i + 1}</span>
                                <span className="tm-rank-label">{c}</span>
                                <div className="tm-rank-bar-wrap"><div className="tm-rank-bar" style={{ width: `${(n / maxVal) * 100}%`, background: "linear-gradient(90deg, #00D4FF44, #00D4FF)" }} /></div>
                                <span className="tm-rank-value" style={{ color: "#00D4FF" }}>{n}</span>
                            </div>
                        );
                    })}
                    {topTargets.length === 0 && <div className="tm-empty">جاري جمع البيانات...</div>}
                </div>

                {/* Attack Types Distribution */}
                <div className="tm-panel-section">
                    <div className="tm-section-title"><span className="tm-section-icon" style={{ color: "#C44DFF" }}>◆</span>توزيع أنواع الهجمات</div>
                    {typeDistribution.map(([type, count]) => {
                        const pct = (count / typeTotal) * 100;
                        return (
                            <div key={type} className="tm-type-row">
                                <div className="tm-type-header">
                                    <span style={{ color: typeColor(type) }}>{typeIcon(type)} {type}</span>
                                    <span className="tm-type-pct">{pct.toFixed(1)}%</span>
                                </div>
                                <div className="tm-type-bar-bg"><div className="tm-type-bar-fill" style={{ width: `${pct}%`, background: typeColor(type) }} /></div>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* ═══════════════════════════════════════════════
                CENTER — 3D GLOBE
                ═══════════════════════════════════════════════ */}
            <div ref={containerRef} className="tm-globe-container" />

            {/* ═══════════════════════════════════════════════
                RIGHT PANEL — ATTACK DETAILS + FEED
                ═══════════════════════════════════════════════ */}
            <aside className={`tm-right-panel ${rightOpen ? "open" : "closed"}`}>
                {/* Selected Attack Detail */}
                {selectedAttack ? (
                    <div className="tm-panel-section tm-detail-card">
                        <div className="tm-section-title"><span className="tm-section-icon">🎯</span>تفاصيل الهجوم</div>
                        <div className="tm-detail-type" style={{ color: typeColor(selectedAttack.type) }}>
                            {typeIcon(selectedAttack.type)} {selectedAttack.type}
                        </div>
                        <div className="tm-detail-severity">
                            <span className="tm-sev-badge" style={{ color: SEVERITY_CONFIG[selectedAttack.severity].color, background: SEVERITY_CONFIG[selectedAttack.severity].bg }}>
                                {SEVERITY_CONFIG[selectedAttack.severity].labelAr}
                            </span>
                        </div>
                        <div className="tm-detail-route">
                            <div className="tm-route-city">
                                <span className="tm-route-flag">🔴</span>
                                <div>
                                    <div className="tm-route-name">{selectedAttack.source.name}</div>
                                    <div className="tm-route-country">{COUNTRY_NAMES_AR[selectedAttack.source.country] || selectedAttack.source.country}</div>
                                </div>
                            </div>
                            <div className="tm-route-arrow">⟶</div>
                            <div className="tm-route-city">
                                <span className="tm-route-flag">🟢</span>
                                <div>
                                    <div className="tm-route-name">{selectedAttack.target.name}</div>
                                    <div className="tm-route-country">{COUNTRY_NAMES_AR[selectedAttack.target.country] || selectedAttack.target.country}</div>
                                </div>
                            </div>
                        </div>
                        <div className="tm-detail-meta">
                            <div className="tm-meta-row"><span className="tm-meta-label">IP المصدر</span><span className="tm-meta-value" dir="ltr">{selectedAttack.sourceIP}</span></div>
                            <div className="tm-meta-row"><span className="tm-meta-label">IP الهدف</span><span className="tm-meta-value" dir="ltr">{selectedAttack.targetIP}</span></div>
                            <div className="tm-meta-row"><span className="tm-meta-label">مزود الخدمة</span><span className="tm-meta-value" dir="ltr">{selectedAttack.isp}</span></div>
                            <div className="tm-meta-row"><span className="tm-meta-label">الوقت</span><span className="tm-meta-value" dir="ltr">{new Date(selectedAttack.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span></div>
                        </div>
                        <div className="tm-detail-desc">
                            <div className="tm-desc-title">🧠 وصف الهجوم</div>
                            <p className="tm-desc-text">{typeDesc(selectedAttack.type)}</p>
                        </div>
                        <div className="tm-detail-actions">
                            <Link href="/labs" className="tm-action-btn tm-action-lab">🧪 ادخل المختبر</Link>
                            <Link href="/courses" className="tm-action-btn tm-action-learn">📚 تعلّم المزيد</Link>
                        </div>
                        <button className="tm-close-detail" onClick={() => setSelectedAttack(null)}>✕ إغلاق</button>
                    </div>
                ) : (
                    <div className="tm-panel-section tm-detail-empty">
                        <div className="tm-empty-icon">🎯</div>
                        <p>اضغط على أي هجوم في القائمة أدناه لعرض تفاصيله</p>
                    </div>
                )}

                {/* Live Feed */}
                <div className="tm-panel-section tm-feed-section">
                    <div className="tm-section-title">
                        <span className="tm-section-icon">📡</span>البث المباشر
                        <span className="tm-feed-dot" />
                    </div>
                    <div className="tm-feed-list">
                        {filteredRecent.slice(0, 15).map(atk => (
                            <button key={atk.id} className="tm-feed-item" onClick={() => setSelectedAttack(atk)}
                                style={{ borderLeftColor: typeColor(atk.type) }}>
                                <div className="tm-feed-top">
                                    <span style={{ color: typeColor(atk.type), fontWeight: 700 }}>{typeIcon(atk.type)} {atk.type}</span>
                                    <span className="tm-feed-time">{new Date(atk.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
                                </div>
                                <div className="tm-feed-route">
                                    <span>{atk.source.name}</span>
                                    <span className="tm-feed-arrow">→</span>
                                    <span>{atk.target.name}</span>
                                </div>
                                <div className="tm-feed-bottom">
                                    <span className="tm-feed-ip" dir="ltr">{atk.sourceIP}</span>
                                    {atk.severity === "critical" && <span className="tm-feed-critical">⚠ CRITICAL</span>}
                                    {atk.severity === "high" && <span className="tm-feed-high">HIGH</span>}
                                </div>
                            </button>
                        ))}
                        {filteredRecent.length === 0 && <div className="tm-empty">في انتظار البيانات...</div>}
                    </div>
                </div>
            </aside>

            {/* ═══════════════════════════════════════════════
                STYLES
                ═══════════════════════════════════════════════ */}
            <style>{`
                /* ── ROOT ── */
                .tm-root { position: relative; width: 100%; height: 100vh; background: #0B0F1A; overflow: hidden; font-family: 'Courier New', monospace; direction: ltr; }

                /* ── LABELS ── */
                .tm-labels { position: absolute; inset: 0; z-index: 2; pointer-events: none; overflow: hidden; }
                .tm-city-label { position: absolute; top: 0; left: 0; font-size: 8px; color: rgba(0,212,255,0.7); white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0; transition: opacity 0.4s; text-shadow: 0 0 4px rgba(0,212,255,0.3); }

                /* ── TOP BAR ── */
                .tm-topbar { position: absolute; top: 0; left: 0; right: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: rgba(11, 15, 26, 0.98); border-bottom: 1px solid rgba(0,212,255,0.12); }
                .tm-topbar-left { display: flex; align-items: center; gap: 12px; }
                .tm-live-dot { width: 10px; height: 10px; border-radius: 50%; background: #FF3B3B; box-shadow: 0 0 8px #FF3B3B, 0 0 20px #FF3B3B55; animation: tm-pulse 1.5s ease-in-out infinite; }
                .tm-title { font-size: 16px; font-weight: 700; color: #e2e8f0; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
                .tm-badge { font-size: 9px; padding: 3px 10px; border-radius: 4px; letter-spacing: 1px; animation: tm-blink 2s step-end infinite; }
                .tm-badge-live { border: 1px solid rgba(0,255,100,0.5); color: #0f8; }
                .tm-badge-sim { border: 1px solid rgba(255,200,0,0.4); color: #ffa; }
                .tm-topbar-stats { display: flex; gap: 24px; align-items: center; }
                .tm-stat { text-align: center; }
                .tm-stat-label { display: block; font-size: 9px; color: #475569; letter-spacing: 1.5px; }
                .tm-stat-value { display: block; font-size: 22px; font-weight: 700; }
                .tm-stat-divider { width: 1px; height: 32px; background: rgba(0,212,255,0.1); }
                .tm-critical-glow { text-shadow: 0 0 10px #FF3B3B; animation: tm-pulse 1s ease-in-out infinite; }
                .tm-topbar-controls { display: flex; gap: 8px; align-items: center; }
                .tm-panel-toggle { width: 36px; height: 36px; border: 1px solid rgba(0,212,255,0.15); border-radius: 6px; background: rgba(11,15,26,0.8); color: #64748b; font-size: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .tm-panel-toggle:hover { border-color: #00D4FF; color: #00D4FF; }
                .tm-ctrl-btn { padding: 8px 16px; font-size: 11px; font-family: inherit; font-weight: 700; letter-spacing: 1px; cursor: pointer; border-radius: 6px; border: 1px solid rgba(0,212,255,0.3); background: #001428; color: #00D4FF; transition: all 0.2s; }
                .tm-ctrl-btn:hover { border-color: #00D4FF; box-shadow: 0 0 15px rgba(0,212,255,0.2); }
                .tm-ctrl-active { border-color: #FF8C0088; background: rgba(255,140,0,0.1); color: #FF8C00; }

                /* ── FILTER BAR ── */
                .tm-filterbar { position: absolute; top: 62px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; z-index: 20; padding: 5px 10px; background: #0b0f1a; border-radius: 10px; border: 1px solid rgba(0,212,255,0.15); }
                .tm-filter-btn { padding: 5px 12px; font-size: 10px; font-family: inherit; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(100,150,200,0.12); border-radius: 6px; background: transparent; color: #475569; display: flex; align-items: center; gap: 5px; }
                .tm-filter-btn.active { border-color: var(--fc); background: color-mix(in srgb, var(--fc) 12%, transparent); color: var(--fc); box-shadow: 0 0 10px color-mix(in srgb, var(--fc) 20%, transparent); }
                .tm-filter-btn:hover { border-color: var(--fc); color: var(--fc); }
                .tm-filter-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

                /* ── PANELS (SHARED) ── */
                .tm-panel-section { padding: 14px; background: #0b0f1a; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1); margin-bottom: 8px; }
                .tm-section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; color: #94a3b8; direction: rtl; }
                .tm-section-icon { font-size: 14px; }
                .tm-empty { font-size: 10px; color: #1e293b; text-align: center; padding: 12px; direction: rtl; }

                /* ── LEFT PANEL ── */
                .tm-left-panel { position: absolute; left: 0; top: 96px; width: 280px; bottom: 0; z-index: 15; padding: 8px 10px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(0,212,255,0.15) transparent; transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
                .tm-left-panel.closed { transform: translateX(-100%); }
                .tm-left-panel::-webkit-scrollbar { width: 4px; }
                .tm-left-panel::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.15); border-radius: 2px; }

                /* Live Stats Grid */
                .tm-live-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
                .tm-mini-stat { background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.06); border-radius: 8px; padding: 10px; text-align: center; }
                .tm-mini-value { display: block; font-size: 18px; font-weight: 700; }
                .tm-mini-label { display: block; font-size: 9px; color: #475569; margin-top: 4px; direction: rtl; }

                /* Severity Filters */
                .tm-severity-filters { display: flex; gap: 4px; flex-wrap: wrap; direction: rtl; }
                .tm-severity-btn { padding: 4px 10px; font-size: 10px; font-family: inherit; font-weight: 600; cursor: pointer; border-radius: 6px; border: 1px solid rgba(100,150,200,0.1); background: transparent; color: #475569; transition: all 0.2s; }
                .tm-severity-btn.active { border-color: var(--sc); background: var(--sb); color: var(--sc); }
                .tm-severity-btn:hover { border-color: var(--sc); color: var(--sc); }

                /* Rank Rows */
                .tm-rank-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 11px; }
                .tm-rank-num { color: #334155; font-weight: 700; width: 16px; text-align: center; }
                .tm-rank-label { color: #94a3b8; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .tm-rank-bar-wrap { width: 50px; height: 3px; background: rgba(100,150,200,0.06); border-radius: 2px; overflow: hidden; }
                .tm-rank-bar { height: 100%; border-radius: 2px; transition: width 0.5s; }
                .tm-rank-value { font-weight: 700; font-size: 12px; min-width: 28px; text-align: right; }

                /* Type Distribution */
                .tm-type-row { margin-bottom: 6px; }
                .tm-type-header { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; }
                .tm-type-pct { color: #475569; }
                .tm-type-bar-bg { height: 3px; background: rgba(100,150,200,0.06); border-radius: 2px; overflow: hidden; }
                .tm-type-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }

                /* ── GLOBE ── */
                .tm-globe-container { position: absolute; inset: 0; z-index: 0; cursor: grab; }

                /* ── RIGHT PANEL ── */
                .tm-right-panel { position: absolute; right: 0; top: 96px; width: 340px; bottom: 0; z-index: 15; padding: 8px 10px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(0,212,255,0.15) transparent; transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
                .tm-right-panel.closed { transform: translateX(100%); }
                .tm-right-panel::-webkit-scrollbar { width: 4px; }
                .tm-right-panel::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.15); border-radius: 2px; }

                /* Detail Card */
                .tm-detail-card { border: 1px solid rgba(0,212,255,0.12); position: relative; }
                .tm-detail-type { font-size: 20px; font-weight: 700; margin-bottom: 8px; text-align: center; }
                .tm-detail-severity { text-align: center; margin-bottom: 12px; }
                .tm-sev-badge { display: inline-block; padding: 3px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
                .tm-detail-route { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; padding: 10px; background: rgba(0,20,40,0.4); border-radius: 8px; border: 1px solid rgba(0,212,255,0.06); }
                .tm-route-city { display: flex; align-items: center; gap: 8px; }
                .tm-route-flag { font-size: 16px; }
                .tm-route-name { color: #e2e8f0; font-size: 12px; font-weight: 700; }
                .tm-route-country { color: #475569; font-size: 10px; direction: rtl; }
                .tm-route-arrow { color: #FFD000; font-size: 22px; font-weight: 700; }

                .tm-detail-meta { margin-bottom: 12px; }
                .tm-meta-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(0,212,255,0.04); font-size: 10px; direction: rtl; }
                .tm-meta-label { color: #64748b; }
                .tm-meta-value { color: #94a3b8; font-weight: 600; }

                .tm-detail-desc { margin-bottom: 14px; padding: 10px; background: rgba(122,0,255,0.06); border-radius: 8px; border: 1px solid rgba(122,0,255,0.1); direction: rtl; }
                .tm-desc-title { font-size: 11px; color: #C44DFF; font-weight: 700; margin-bottom: 6px; }
                .tm-desc-text { font-size: 11px; color: #94a3b8; line-height: 1.7; margin: 0; font-family: 'Noto Kufi Arabic', sans-serif; }

                .tm-detail-actions { display: flex; gap: 6px; margin-bottom: 8px; }
                .tm-action-btn { flex: 1; padding: 10px; text-align: center; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none; transition: all 0.2s; font-family: 'Noto Kufi Arabic', sans-serif; }
                .tm-action-lab { background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05)); border: 1px solid rgba(0,212,255,0.2); color: #00D4FF; }
                .tm-action-lab:hover { background: rgba(0,212,255,0.2); box-shadow: 0 0 15px rgba(0,212,255,0.2); }
                .tm-action-learn { background: linear-gradient(135deg, rgba(122,0,255,0.15), rgba(122,0,255,0.05)); border: 1px solid rgba(122,0,255,0.2); color: #C44DFF; }
                .tm-action-learn:hover { background: rgba(122,0,255,0.2); box-shadow: 0 0 15px rgba(122,0,255,0.2); }
                .tm-close-detail { width: 100%; padding: 6px; font-size: 10px; font-family: inherit; cursor: pointer; border: 1px solid rgba(100,150,200,0.1); border-radius: 6px; background: transparent; color: #475569; transition: all 0.2s; }
                .tm-close-detail:hover { color: #FF3B3B; border-color: #FF3B3B44; }

                .tm-detail-empty { text-align: center; padding: 30px 14px; direction: rtl; }
                .tm-empty-icon { font-size: 32px; margin-bottom: 10px; opacity: 0.4; }
                .tm-detail-empty p { font-size: 11px; color: #334155; margin: 0; font-family: 'Noto Kufi Arabic', sans-serif; line-height: 1.8; }

                /* Feed */
                .tm-feed-section { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
                .tm-feed-dot { width: 6px; height: 6px; border-radius: 50%; background: #0f0; box-shadow: 0 0 5px #0f0; animation: tm-pulse 1.5s ease-in-out infinite; margin-left: auto; }
                .tm-feed-list { display: flex; flex-direction: column; gap: 3px; overflow-y: auto; max-height: calc(100vh - 420px); scrollbar-width: thin; scrollbar-color: rgba(0,212,255,0.1) transparent; }
                .tm-feed-item { display: block; width: 100%; padding: 7px 9px; border-radius: 6px; border: none; border-left: 3px solid; background: rgba(0,20,40,0.4); cursor: pointer; text-align: left; font-family: inherit; font-size: 10px; transition: all 0.15s; animation: tm-slideIn 0.3s ease-out; }
                .tm-feed-item:hover { background: rgba(0,40,80,0.5); transform: translateX(-2px); }
                .tm-feed-top { display: flex; justify-content: space-between; margin-bottom: 2px; }
                .tm-feed-time { color: #334155; }
                .tm-feed-route { color: #94a3b8; }
                .tm-feed-route span { color: #cbd5e1; }
                .tm-feed-arrow { color: #334155; margin: 0 4px; }
                .tm-feed-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 2px; }
                .tm-feed-ip { color: #1e293b; font-size: 9px; }
                .tm-feed-critical { color: #FF3B3B; font-weight: 700; font-size: 9px; animation: tm-blink 1s step-end infinite; }
                .tm-feed-high { color: #FF8C00; font-weight: 600; font-size: 9px; }

                /* ── ANIMATIONS ── */
                @keyframes tm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                @keyframes tm-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes tm-slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

                /* ── RESPONSIVE ── */
                @media (max-width: 1200px) {
                    .tm-left-panel { width: 240px; }
                    .tm-right-panel { width: 300px; }
                }
                @media (max-width: 900px) {
                    .tm-left-panel { width: 260px; }
                    .tm-right-panel { width: 300px; }
                    .tm-left-panel, .tm-right-panel { background: rgba(11,15,26,0.95); }
                    .tm-topbar-stats { display: none; }
                }
                @media (max-width: 640px) {
                    .tm-left-panel, .tm-right-panel { width: 100%; top: 55px; padding: 8px; }
                    .tm-topbar { padding: 8px 12px; }
                    .tm-title { font-size: 12px; letter-spacing: 2px; }
                    .tm-filterbar { top: 50px; flex-wrap: wrap; }
                    .tm-filter-btn { font-size: 9px; padding: 4px 8px; }
                }
            `}</style>
        </div>
    );
}
