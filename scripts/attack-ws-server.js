/**
 * Cyber Attack WebSocket Server
 * Generates realistic simulated attack data and broadcasts via WebSocket.
 * Usage: node scripts/attack-ws-server.js
 * Listens on ws://localhost:3001
 */

const { WebSocketServer } = require('ws');

const PORT = 3001;

const CITIES = [
    { id: 'nyc', name: 'New York', country: 'US', lat: 40.7128, lng: -74.006, weight: 8 },
    { id: 'sf', name: 'San Francisco', country: 'US', lat: 37.7749, lng: -122.4194, weight: 6 },
    { id: 'chi', name: 'Chicago', country: 'US', lat: 41.8781, lng: -87.6298, weight: 5 },
    { id: 'dc', name: 'Washington DC', country: 'US', lat: 38.9072, lng: -77.0369, weight: 7 },
    { id: 'dal', name: 'Dallas', country: 'US', lat: 32.7767, lng: -96.797, weight: 4 },
    { id: 'mia', name: 'Miami', country: 'US', lat: 25.7617, lng: -80.1918, weight: 3 },
    { id: 'tor', name: 'Toronto', country: 'CA', lat: 43.651, lng: -79.347, weight: 3 },
    { id: 'mex', name: 'Mexico City', country: 'MX', lat: 19.4326, lng: -99.1332, weight: 2 },
    { id: 'lon', name: 'London', country: 'GB', lat: 51.5074, lng: -0.1278, weight: 8 },
    { id: 'fra', name: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821, weight: 6 },
    { id: 'par', name: 'Paris', country: 'FR', lat: 48.8566, lng: 2.3522, weight: 5 },
    { id: 'ams', name: 'Amsterdam', country: 'NL', lat: 52.3676, lng: 4.9041, weight: 5 },
    { id: 'sto', name: 'Stockholm', country: 'SE', lat: 59.3293, lng: 18.0686, weight: 3 },
    { id: 'buc', name: 'Bucharest', country: 'RO', lat: 44.4268, lng: 26.1025, weight: 3 },
    { id: 'mos', name: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173, weight: 9 },
    { id: 'spb', name: 'St. Petersburg', country: 'RU', lat: 59.9343, lng: 30.3351, weight: 5 },
    { id: 'dxb', name: 'Dubai', country: 'AE', lat: 25.2048, lng: 55.2708, weight: 4 },
    { id: 'riy', name: 'Riyadh', country: 'SA', lat: 24.7136, lng: 46.6753, weight: 3 },
    { id: 'teh', name: 'Tehran', country: 'IR', lat: 35.6892, lng: 51.389, weight: 5 },
    { id: 'ist', name: 'Istanbul', country: 'TR', lat: 41.0082, lng: 28.9784, weight: 3 },
    { id: 'bei', name: 'Beijing', country: 'CN', lat: 39.9042, lng: 116.4074, weight: 10 },
    { id: 'sha', name: 'Shanghai', country: 'CN', lat: 31.2304, lng: 121.4737, weight: 7 },
    { id: 'shn', name: 'Shenzhen', country: 'CN', lat: 22.5431, lng: 114.0579, weight: 5 },
    { id: 'tok', name: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503, weight: 6 },
    { id: 'seo', name: 'Seoul', country: 'KR', lat: 37.5665, lng: 126.978, weight: 5 },
    { id: 'sin', name: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198, weight: 5 },
    { id: 'mum', name: 'Mumbai', country: 'IN', lat: 19.076, lng: 72.8777, weight: 6 },
    { id: 'ban', name: 'Bangalore', country: 'IN', lat: 12.9716, lng: 77.5946, weight: 4 },
    { id: 'hcm', name: 'Ho Chi Minh', country: 'VN', lat: 10.8231, lng: 106.6297, weight: 3 },
    { id: 'sao', name: 'São Paulo', country: 'BR', lat: -23.5505, lng: -46.6333, weight: 5 },
    { id: 'bue', name: 'Buenos Aires', country: 'AR', lat: -34.6037, lng: -58.3816, weight: 3 },
    { id: 'bog', name: 'Bogotá', country: 'CO', lat: 4.711, lng: -74.0721, weight: 2 },
    { id: 'lag', name: 'Lagos', country: 'NG', lat: 6.5244, lng: 3.3792, weight: 4 },
    { id: 'cai', name: 'Cairo', country: 'EG', lat: 30.0444, lng: 31.2357, weight: 3 },
    { id: 'joh', name: 'Johannesburg', country: 'ZA', lat: -26.2041, lng: 28.0473, weight: 3 },
    { id: 'syd', name: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093, weight: 4 },
];

const ATTACK_TYPES = [
    { type: 'DDoS', color: '#ff2d2d' },
    { type: 'Phishing', color: '#ffd000' },
    { type: 'Malware', color: '#c44dff' },
    { type: 'Ransomware', color: '#ff8c00' },
    { type: 'Scanning', color: '#00c8ff' },
];

const ISPS = [
    'CloudFlare Inc.', 'Amazon AWS', 'Microsoft Azure', 'Google Cloud',
    'DigitalOcean', 'OVH SAS', 'Hetzner Online', 'Alibaba Cloud',
    'Tencent Cloud', 'China Telecom', 'Rostelecom', 'Deutsche Telekom',
    'NTT Communications', 'Korea Telecom', 'SingTel', 'Reliance Jio',
    'Verizon Business', 'AT&T Services', 'Comcast Cable', 'BT Group',
];

function weightedRandom(items) {
    const total = items.reduce((s, c) => s + c.weight, 0);
    let r = Math.random() * total;
    for (const item of items) {
        r -= item.weight;
        if (r <= 0) return item;
    }
    return items[items.length - 1];
}

function randomIP() {
    return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function generateAttack() {
    const source = weightedRandom(CITIES);
    let target = weightedRandom(CITIES);
    let attempts = 0;
    while (target.id === source.id && attempts < 10) {
        target = weightedRandom(CITIES);
        attempts++;
    }
    const at = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const severity = Math.random() < 0.05 ? 'critical'
        : Math.random() < 0.15 ? 'high'
        : Math.random() < 0.4 ? 'medium' : 'low';

    return {
        id: Date.now() + Math.random(),
        source: { id: source.id, name: source.name, country: source.country, lat: source.lat, lng: source.lng },
        target: { id: target.id, name: target.name, country: target.country, lat: target.lat, lng: target.lng },
        type: at.type,
        color: at.color,
        sourceIP: randomIP(),
        targetIP: randomIP(),
        isp: ISPS[Math.floor(Math.random() * ISPS.length)],
        severity,
        timestamp: Date.now(),
    };
}

// ─── START SERVER ──────────────────────────────

const wss = new WebSocketServer({ port: PORT });
let clientCount = 0;

wss.on('connection', (ws) => {
    clientCount++;
    console.log(`[+] Client connected (total: ${clientCount})`);
    ws.on('close', () => {
        clientCount--;
        console.log(`[-] Client disconnected (total: ${clientCount})`);
    });
});

// Broadcast attacks at variable rate (5–15 per second)
setInterval(() => {
    if (wss.clients.size === 0) return;
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
        const attack = generateAttack();
        const payload = JSON.stringify(attack);
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(payload);
            }
        });
    }
}, 150);

console.log(`\n🌍 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`   Cyber Attack WebSocket Server`);
console.log(`   Listening on ws://localhost:${PORT}`);
console.log(`   Broadcasting 5-15 attacks/sec`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
