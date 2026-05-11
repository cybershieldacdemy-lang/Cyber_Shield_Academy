/**
 * Threat Intelligence Feed Integrations
 *
 * Each feed module exports:
 *   - isConfigured()  → boolean (API key present?)
 *   - poll()          → Promise<RawThreatEvent[]>
 *
 * Data flows:  External API → normalize → IP pool → geo resolve → broadcast
 */

const { resolveIP, batchResolve, getCached } = require('./geo');

// ═══════════════════════════════════════════════════════
//  ATTACK TYPE CLASSIFICATION
// ═══════════════════════════════════════════════════════

const ATTACK_COLORS = {
    DDoS: '#ff2d2d',
    Phishing: '#ffd000',
    Malware: '#c44dff',
    Ransomware: '#ff8c00',
    Scanning: '#00c8ff',
};

// AbuseIPDB category → attack type mapping
const ABUSE_CATEGORY_MAP = {
    3: 'Phishing',     // Fraud Orders
    4: 'DDoS',         // DDoS Attack
    5: 'Scanning',     // FTP Brute-Force
    6: 'DDoS',         // Ping of Death
    7: 'Phishing',     // Phishing
    9: 'Scanning',     // Open Proxy
    10: 'Phishing',    // Web Spam
    11: 'Phishing',    // Email Spam
    14: 'Scanning',    // Port Scan
    15: 'Malware',     // Hacking
    18: 'Scanning',    // Brute-Force
    19: 'Scanning',    // Bad Web Bot
    20: 'Malware',     // Exploited Host
    21: 'Malware',     // Web App Attack
    22: 'Scanning',    // SSH
    23: 'Malware',     // IoT Targeted
};

// OTX pulse tag → attack type mapping
function classifyFromTags(tags) {
    const t = (tags || []).map((s) => s.toLowerCase());
    if (t.some((x) => /ransomware|ransom/.test(x))) return 'Ransomware';
    if (t.some((x) => /malware|trojan|rat|backdoor|exploit|apt/.test(x))) return 'Malware';
    if (t.some((x) => /ddos|dos|flood|amplification/.test(x))) return 'DDoS';
    if (t.some((x) => /phish|spam|scam|credential/.test(x))) return 'Phishing';
    if (t.some((x) => /scan|brute|recon|probe|bot/.test(x))) return 'Scanning';
    return 'Scanning'; // default
}

function classifySeverity(score) {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

// Common target locations (attacks from threat feeds usually know source, not target)
const TARGET_POOL = [
    { lat: 40.7128, lng: -74.006, country: 'United States', countryCode: 'US', city: 'New York' },
    { lat: 37.7749, lng: -122.4194, country: 'United States', countryCode: 'US', city: 'San Francisco' },
    { lat: 38.9072, lng: -77.0369, country: 'United States', countryCode: 'US', city: 'Washington DC' },
    { lat: 41.8781, lng: -87.6298, country: 'United States', countryCode: 'US', city: 'Chicago' },
    { lat: 32.7767, lng: -96.797, country: 'United States', countryCode: 'US', city: 'Dallas' },
    { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', countryCode: 'GB', city: 'London' },
    { lat: 50.1109, lng: 8.6821, country: 'Germany', countryCode: 'DE', city: 'Frankfurt' },
    { lat: 48.8566, lng: 2.3522, country: 'France', countryCode: 'FR', city: 'Paris' },
    { lat: 52.3676, lng: 4.9041, country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam' },
    { lat: 35.6762, lng: 139.6503, country: 'Japan', countryCode: 'JP', city: 'Tokyo' },
    { lat: 37.5665, lng: 126.978, country: 'South Korea', countryCode: 'KR', city: 'Seoul' },
    { lat: 1.3521, lng: 103.8198, country: 'Singapore', countryCode: 'SG', city: 'Singapore' },
    { lat: -33.8688, lng: 151.2093, country: 'Australia', countryCode: 'AU', city: 'Sydney' },
    { lat: 43.651, lng: -79.347, country: 'Canada', countryCode: 'CA', city: 'Toronto' },
    { lat: -23.5505, lng: -46.6333, country: 'Brazil', countryCode: 'BR', city: 'São Paulo' },
    { lat: 19.076, lng: 72.8777, country: 'India', countryCode: 'IN', city: 'Mumbai' },
];

// Weighted toward US/EU (realistic attack target distribution)
const TARGET_WEIGHTS = [12, 8, 10, 6, 5, 9, 8, 5, 6, 5, 4, 4, 3, 3, 3, 3];

function pickTarget() {
    const total = TARGET_WEIGHTS.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < TARGET_POOL.length; i++) {
        r -= TARGET_WEIGHTS[i];
        if (r <= 0) return TARGET_POOL[i];
    }
    return TARGET_POOL[0];
}

// ═══════════════════════════════════════════════════════
//  FEED: AbuseIPDB
// ═══════════════════════════════════════════════════════

const AbuseIPDB = {
    name: 'AbuseIPDB',
    _key: null,
    _blacklist: [],      // Cached blacklist IPs
    _lastFetch: 0,
    _pollInterval: 30 * 60 * 1000, // Refresh blacklist every 30 min

    init(apiKey) {
        this._key = apiKey;
    },

    isConfigured() {
        return !!this._key;
    },

    async refreshBlacklist() {
        if (!this._key) return;
        const now = Date.now();
        if (now - this._lastFetch < this._pollInterval && this._blacklist.length > 0) return;

        try {
            console.log('[AbuseIPDB] Fetching blacklist...');
            const res = await fetch(
                'https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=85&limit=200',
                {
                    headers: {
                        Key: this._key,
                        Accept: 'application/json',
                    },
                },
            );

            if (res.status === 429) {
                console.warn('[AbuseIPDB] Rate limited — will retry later');
                return;
            }
            if (!res.ok) {
                console.error(`[AbuseIPDB] HTTP ${res.status}: ${res.statusText}`);
                return;
            }

            const json = await res.json();
            this._blacklist = (json.data || []).map((entry) => ({
                ip: entry.ipAddress,
                score: entry.abuseConfidenceScore || 50,
                lastReported: entry.lastReportedAt,
            }));
            this._lastFetch = now;
            console.log(`[AbuseIPDB] Loaded ${this._blacklist.length} blacklisted IPs`);

            // Pre-resolve geolocation for blacklisted IPs in batches
            const ips = this._blacklist.map((e) => e.ip);
            await batchResolve(ips);
            console.log(`[AbuseIPDB] Geo-resolved ${ips.length} IPs`);
        } catch (err) {
            console.error('[AbuseIPDB] Fetch failed:', err.message);
        }
    },

    /**
     * Pick random IPs from blacklist and create attack events.
     */
    async poll(count = 3) {
        if (this._blacklist.length === 0) return [];
        const events = [];

        for (let i = 0; i < count; i++) {
            const entry = this._blacklist[Math.floor(Math.random() * this._blacklist.length)];
            const srcGeo = getCached(entry.ip);
            if (!srcGeo) continue;

            const tgt = pickTarget();
            // Avoid same-country attacks most of the time
            if (srcGeo.countryCode === tgt.countryCode && Math.random() > 0.15) continue;

            events.push({
                source_ip: entry.ip,
                target_ip: generateTargetIP(),
                source_geo: srcGeo,
                target_geo: tgt,
                attack_type: classifyFromScore(entry.score),
                severity: classifySeverity(entry.score),
                timestamp: Date.now(),
                feed: 'abuseipdb',
                isp: srcGeo.isp || '',
            });
        }
        return events;
    },
};

function classifyFromScore(score) {
    // Higher confidence → more dangerous attack types
    if (score >= 95) return Math.random() > 0.5 ? 'DDoS' : 'Ransomware';
    if (score >= 80) return Math.random() > 0.5 ? 'Malware' : 'DDoS';
    if (score >= 60) return Math.random() > 0.5 ? 'Phishing' : 'Scanning';
    return 'Scanning';
}

// ═══════════════════════════════════════════════════════
//  FEED: AlienVault OTX
// ═══════════════════════════════════════════════════════

const AlienVaultOTX = {
    name: 'AlienVault OTX',
    _key: null,
    _indicators: [],     // Cached IP indicators with attack types
    _lastFetch: 0,
    _pollInterval: 5 * 60 * 1000, // Refresh pulses every 5 min

    init(apiKey) {
        this._key = apiKey;
    },

    isConfigured() {
        return !!this._key;
    },

    async refreshPulses() {
        if (!this._key) return;
        const now = Date.now();
        if (now - this._lastFetch < this._pollInterval && this._indicators.length > 0) return;

        try {
            console.log('[OTX] Fetching recent pulses...');
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const res = await fetch(
                `https://otx.alienvault.com/api/v1/pulses/subscribed?limit=10&modified_since=${since}`,
                {
                    headers: { 'X-OTX-API-KEY': this._key },
                },
            );

            if (!res.ok) {
                console.error(`[OTX] HTTP ${res.status}: ${res.statusText}`);
                return;
            }

            const json = await res.json();
            const newIndicators = [];

            for (const pulse of json.results || []) {
                const attackType = classifyFromTags(pulse.tags);
                for (const ind of pulse.indicators || []) {
                    if (ind.type === 'IPv4') {
                        newIndicators.push({
                            ip: ind.indicator,
                            attackType,
                            pulseName: pulse.name || '',
                            tags: pulse.tags || [],
                        });
                    }
                }
            }

            if (newIndicators.length > 0) {
                this._indicators = newIndicators;
                this._lastFetch = now;
                console.log(`[OTX] Loaded ${newIndicators.length} IP indicators from ${(json.results || []).length} pulses`);

                // Batch resolve geolocation
                const ips = newIndicators.map((e) => e.ip);
                await batchResolve(ips);
                console.log(`[OTX] Geo-resolved ${ips.length} IPs`);
            } else {
                console.log('[OTX] No new IPv4 indicators found');
                this._lastFetch = now;
            }
        } catch (err) {
            console.error('[OTX] Fetch failed:', err.message);
        }
    },

    async poll(count = 2) {
        if (this._indicators.length === 0) return [];
        const events = [];

        for (let i = 0; i < count; i++) {
            const ind = this._indicators[Math.floor(Math.random() * this._indicators.length)];
            const srcGeo = getCached(ind.ip);
            if (!srcGeo) continue;

            const tgt = pickTarget();
            if (srcGeo.countryCode === tgt.countryCode && Math.random() > 0.15) continue;

            events.push({
                source_ip: ind.ip,
                target_ip: generateTargetIP(),
                source_geo: srcGeo,
                target_geo: tgt,
                attack_type: ind.attackType,
                severity: ind.attackType === 'Ransomware' ? 'critical'
                    : ind.attackType === 'Malware' ? 'high'
                    : ind.attackType === 'DDoS' ? 'high'
                    : 'medium',
                timestamp: Date.now(),
                feed: 'otx',
                isp: srcGeo.isp || '',
                pulse: ind.pulseName,
            });
        }
        return events;
    },
};

// ═══════════════════════════════════════════════════════
//  FEED: GreyNoise
// ═══════════════════════════════════════════════════════

const GreyNoise = {
    name: 'GreyNoise',
    _key: null,
    _noiseIPs: [],
    _lastFetch: 0,
    _pollInterval: 60 * 60 * 1000, // Refresh every hour (50 queries/day limit)

    init(apiKey) {
        this._key = apiKey;
    },

    isConfigured() {
        return !!this._key;
    },

    async refreshData() {
        if (!this._key) return;
        const now = Date.now();
        if (now - this._lastFetch < this._pollInterval && this._noiseIPs.length > 0) return;

        try {
            console.log('[GreyNoise] Checking internet noise...');
            // Use RIOT API for bulk IP intel (community endpoint)
            // Since community API is per-IP, we'll check a few known noisy IPs
            const sampleIPs = AbuseIPDB._blacklist.slice(0, 5).map((e) => e.ip);
            const results = [];

            for (const ip of sampleIPs) {
                try {
                    const res = await fetch(`https://api.greynoise.io/v3/community/${ip}`, {
                        headers: { key: this._key },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.noise || data.riot) {
                            results.push({
                                ip,
                                classification: data.classification || 'unknown',
                                name: data.name || '',
                                noise: data.noise,
                            });
                        }
                    }
                    // Respect rate limits
                    await sleep(1200);
                } catch { /* skip individual failures */ }
            }

            this._noiseIPs = results;
            this._lastFetch = now;
            console.log(`[GreyNoise] Classified ${results.length} IPs`);
        } catch (err) {
            console.error('[GreyNoise] Fetch failed:', err.message);
        }
    },

    async poll(count = 1) {
        if (this._noiseIPs.length === 0) return [];
        const events = [];

        for (let i = 0; i < count; i++) {
            const entry = this._noiseIPs[Math.floor(Math.random() * this._noiseIPs.length)];
            const srcGeo = getCached(entry.ip);
            if (!srcGeo) continue;

            const tgt = pickTarget();
            events.push({
                source_ip: entry.ip,
                target_ip: generateTargetIP(),
                source_geo: srcGeo,
                target_geo: tgt,
                attack_type: entry.classification === 'malicious' ? 'Malware' : 'Scanning',
                severity: entry.classification === 'malicious' ? 'high' : 'low',
                timestamp: Date.now(),
                feed: 'greynoise',
                isp: srcGeo.isp || '',
            });
        }
        return events;
    },
};

// ═══════════════════════════════════════════════════════
//  FEED: Shodan
// ═══════════════════════════════════════════════════════

const Shodan = {
    name: 'Shodan',
    _key: null,
    _honeypotIPs: [],
    _lastFetch: 0,
    _pollInterval: 30 * 60 * 1000,

    init(apiKey) {
        this._key = apiKey;
    },

    isConfigured() {
        return !!this._key;
    },

    async refreshData() {
        if (!this._key) return;
        const now = Date.now();
        if (now - this._lastFetch < this._pollInterval && this._honeypotIPs.length > 0) return;

        try {
            console.log('[Shodan] Fetching honeypot data...');
            // Use Shodan's search endpoint for recently seen scanners
            const res = await fetch(
                `https://api.shodan.io/shodan/host/search?key=${this._key}&query=tag:honeypot&page=1`,
            );

            if (!res.ok) {
                console.error(`[Shodan] HTTP ${res.status}: ${res.statusText}`);
                return;
            }

            const data = await res.json();
            this._honeypotIPs = (data.matches || []).slice(0, 50).map((m) => ({
                ip: m.ip_str,
                port: m.port,
                org: m.org || '',
                product: m.product || '',
            }));
            this._lastFetch = now;
            console.log(`[Shodan] Loaded ${this._honeypotIPs.length} entries`);

            const ips = this._honeypotIPs.map((e) => e.ip);
            await batchResolve(ips);
        } catch (err) {
            console.error('[Shodan] Fetch failed:', err.message);
        }
    },

    async poll(count = 1) {
        if (this._honeypotIPs.length === 0) return [];
        const events = [];

        for (let i = 0; i < count; i++) {
            const entry = this._honeypotIPs[Math.floor(Math.random() * this._honeypotIPs.length)];
            const srcGeo = getCached(entry.ip);
            if (!srcGeo) continue;

            const tgt = pickTarget();
            events.push({
                source_ip: entry.ip,
                target_ip: generateTargetIP(),
                source_geo: srcGeo,
                target_geo: tgt,
                attack_type: 'Scanning',
                severity: 'medium',
                timestamp: Date.now(),
                feed: 'shodan',
                isp: srcGeo.isp || entry.org || '',
            });
        }
        return events;
    },
};

// ═══════════════════════════════════════════════════════
//  FEED: VirusTotal
// ═══════════════════════════════════════════════════════

const VirusTotal = {
    name: 'VirusTotal',
    _key: null,
    _maliciousIPs: [],
    _lastFetch: 0,
    _pollInterval: 15 * 60 * 1000, // 4 req/min limit

    init(apiKey) {
        this._key = apiKey;
    },

    isConfigured() {
        return !!this._key;
    },

    async refreshData() {
        if (!this._key) return;
        const now = Date.now();
        if (now - this._lastFetch < this._pollInterval && this._maliciousIPs.length > 0) return;

        try {
            console.log('[VirusTotal] Checking IP reputation...');
            // Check a sample of known malicious IPs from other feeds
            const sampleIPs = AbuseIPDB._blacklist.slice(0, 3).map((e) => e.ip);

            for (const ip of sampleIPs) {
                try {
                    const res = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
                        headers: { 'x-apikey': this._key },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const stats = data.data?.attributes?.last_analysis_stats || {};
                        const malicious = stats.malicious || 0;
                        if (malicious > 0) {
                            this._maliciousIPs.push({
                                ip,
                                malicious,
                                total: (stats.harmless || 0) + malicious + (stats.suspicious || 0),
                            });
                        }
                    }
                    // Strict rate limit: 4/min
                    await sleep(16000);
                } catch { /* skip */ }
            }

            this._lastFetch = now;
            console.log(`[VirusTotal] Found ${this._maliciousIPs.length} malicious IPs`);

            const ips = this._maliciousIPs.map((e) => e.ip);
            if (ips.length > 0) await batchResolve(ips);
        } catch (err) {
            console.error('[VirusTotal] Fetch failed:', err.message);
        }
    },

    async poll(count = 1) {
        if (this._maliciousIPs.length === 0) return [];
        const events = [];

        for (let i = 0; i < count; i++) {
            const entry = this._maliciousIPs[Math.floor(Math.random() * this._maliciousIPs.length)];
            const srcGeo = getCached(entry.ip);
            if (!srcGeo) continue;

            const tgt = pickTarget();
            const ratio = entry.malicious / entry.total;

            events.push({
                source_ip: entry.ip,
                target_ip: generateTargetIP(),
                source_geo: srcGeo,
                target_geo: tgt,
                attack_type: ratio > 0.5 ? 'Malware' : 'Scanning',
                severity: ratio > 0.7 ? 'critical' : ratio > 0.4 ? 'high' : 'medium',
                timestamp: Date.now(),
                feed: 'virustotal',
                isp: srcGeo.isp || '',
                vtDetections: `${entry.malicious}/${entry.total}`,
            });
        }
        return events;
    },
};

// ═══════════════════════════════════════════════════════
//  STRUCTURED SIMULATION (fallback)
// ═══════════════════════════════════════════════════════

const SIMULATION_SOURCES = [
    { lat: 39.9042, lng: 116.4074, country: 'China', countryCode: 'CN', city: 'Beijing' },
    { lat: 31.2304, lng: 121.4737, country: 'China', countryCode: 'CN', city: 'Shanghai' },
    { lat: 22.5431, lng: 114.0579, country: 'China', countryCode: 'CN', city: 'Shenzhen' },
    { lat: 55.7558, lng: 37.6173, country: 'Russia', countryCode: 'RU', city: 'Moscow' },
    { lat: 59.9343, lng: 30.3351, country: 'Russia', countryCode: 'RU', city: 'St. Petersburg' },
    { lat: 35.6892, lng: 51.389, country: 'Iran', countryCode: 'IR', city: 'Tehran' },
    { lat: 37.5665, lng: 126.978, country: 'South Korea', countryCode: 'KR', city: 'Seoul' },
    { lat: 6.5244, lng: 3.3792, country: 'Nigeria', countryCode: 'NG', city: 'Lagos' },
    { lat: -23.5505, lng: -46.6333, country: 'Brazil', countryCode: 'BR', city: 'São Paulo' },
    { lat: 44.4268, lng: 26.1025, country: 'Romania', countryCode: 'RO', city: 'Bucharest' },
    { lat: 19.076, lng: 72.8777, country: 'India', countryCode: 'IN', city: 'Mumbai' },
    { lat: 10.8231, lng: 106.6297, country: 'Vietnam', countryCode: 'VN', city: 'Ho Chi Minh' },
    { lat: 40.7128, lng: -74.006, country: 'United States', countryCode: 'US', city: 'New York' },
    { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', countryCode: 'GB', city: 'London' },
    { lat: 50.1109, lng: 8.6821, country: 'Germany', countryCode: 'DE', city: 'Frankfurt' },
    { lat: 25.2048, lng: 55.2708, country: 'UAE', countryCode: 'AE', city: 'Dubai' },
];
const SIM_WEIGHTS = [10, 7, 5, 9, 5, 5, 5, 4, 5, 3, 6, 3, 4, 3, 3, 2];
const SIM_TYPES = ['DDoS', 'Phishing', 'Malware', 'Ransomware', 'Scanning'];
const SIM_ISPS = [
    'China Telecom', 'Alibaba Cloud', 'Tencent Cloud', 'Rostelecom',
    'Iran Telecom', 'KT Corp', 'MTN Nigeria', 'Telefonica Brasil',
    'RCS & RDS', 'Reliance Jio', 'Viettel', 'Comcast Cable',
    'BT Group', 'Deutsche Telekom', 'Etisalat',
];

const Simulation = {
    name: 'Simulation',

    isConfigured() {
        return true; // Always available
    },

    async poll(count = 3) {
        const events = [];
        for (let i = 0; i < count; i++) {
            const src = weightedPick(SIMULATION_SOURCES, SIM_WEIGHTS);
            let tgt = pickTarget();
            // Avoid same-city
            while (tgt.city === src.city) tgt = pickTarget();

            const type = SIM_TYPES[Math.floor(Math.random() * SIM_TYPES.length)];
            const severity = Math.random() < 0.04 ? 'critical'
                : Math.random() < 0.15 ? 'high'
                : Math.random() < 0.4 ? 'medium' : 'low';

            events.push({
                source_ip: generateSourceIP(),
                target_ip: generateTargetIP(),
                source_geo: { ...src },
                target_geo: { ...tgt },
                attack_type: type,
                severity,
                timestamp: Date.now(),
                feed: 'simulation',
                isp: SIM_ISPS[Math.floor(Math.random() * SIM_ISPS.length)],
            });
        }
        return events;
    },
};

// ═══════════════════════════════════════════════════════
//  SHARED UTILITIES
// ═══════════════════════════════════════════════════════

function weightedPick(items, weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    return items[items.length - 1];
}

function generateSourceIP() {
    // Generate realistic-looking non-private IPs
    const first = [1, 2, 5, 14, 27, 31, 36, 42, 45, 46, 49, 58, 59, 60, 61, 77, 78, 79, 80, 81,
        91, 92, 93, 94, 95, 101, 103, 106, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
        121, 122, 123, 124, 125, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148,
        149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163,
        171, 175, 176, 177, 178, 179, 180, 181, 182, 183, 185, 186, 187, 188, 189,
        190, 191, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205,
        206, 207, 208, 209, 210, 211, 212, 213, 216, 217, 218, 219, 220, 221, 222, 223];
    return `${first[Math.floor(Math.random() * first.length)]}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`;
}

function generateTargetIP() {
    // Common datacenter/enterprise IP ranges
    const ranges = ['208.', '204.', '199.', '198.', '192.0.', '172.', '104.', '35.', '34.', '13.'];
    const prefix = ranges[Math.floor(Math.random() * ranges.length)];
    const parts = prefix.split('.').length;
    let ip = prefix;
    for (let i = parts; i < 4; i++) ip += Math.floor(Math.random() * 256) + (i < 3 ? '.' : '');
    return ip;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ═══════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════

const ALL_FEEDS = [AbuseIPDB, AlienVaultOTX, GreyNoise, Shodan, VirusTotal, Simulation];

module.exports = {
    AbuseIPDB,
    AlienVaultOTX,
    GreyNoise,
    Shodan,
    VirusTotal,
    Simulation,
    ALL_FEEDS,
    ATTACK_COLORS,
};
