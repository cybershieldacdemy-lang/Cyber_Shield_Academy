/**
 * GeoIP Resolution Module
 * Resolves IP addresses to geographic coordinates using ip-api.com.
 * Features: LRU cache (10k entries), batch resolution, rate limiting.
 */

const GEO_CACHE = new Map();
const MAX_CACHE = 10000;

// ip-api.com free tier: 45 requests/minute
let requestQueue = [];
let processing = false;
const BATCH_INTERVAL = 1500; // ms between batch requests

/**
 * Resolve a single IP to geolocation.
 * Returns cached result immediately if available.
 */
async function resolveIP(ip) {
    if (!ip || isPrivateIP(ip)) return null;
    if (GEO_CACHE.has(ip)) return GEO_CACHE.get(ip);

    try {
        const res = await fetch(
            `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,lat,lon,isp,org,as`,
        );
        const data = await res.json();
        if (data.status === 'success') {
            const geo = normalize(data);
            cacheSet(ip, geo);
            return geo;
        }
    } catch (err) {
        console.error(`[GEO] Failed to resolve ${ip}:`, err.message);
    }
    return null;
}

/**
 * Batch-resolve up to 100 IPs in a single request.
 * ip-api.com supports POST /batch (free, no key needed).
 */
async function batchResolve(ips) {
    const unique = [...new Set(ips)].filter((ip) => ip && !isPrivateIP(ip));
    const uncached = unique.filter((ip) => !GEO_CACHE.has(ip));

    if (uncached.length > 0) {
        // Process in chunks of 100 (ip-api.com batch limit)
        for (let i = 0; i < uncached.length; i += 100) {
            const chunk = uncached.slice(i, i + 100);
            try {
                const res = await fetch(
                    'http://ip-api.com/batch?fields=status,query,country,countryCode,city,lat,lon,isp,org,as',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(chunk),
                    },
                );
                const results = await res.json();
                for (const r of results) {
                    if (r.status === 'success') {
                        cacheSet(r.query, normalize(r));
                    }
                }
            } catch (err) {
                console.error('[GEO] Batch resolve failed:', err.message);
            }
            // Respect rate limit between batches
            if (i + 100 < uncached.length) {
                await sleep(BATCH_INTERVAL);
            }
        }
    }

    return ips.map((ip) => GEO_CACHE.get(ip) || null);
}

/**
 * Get cached geo for an IP (no API call).
 */
function getCached(ip) {
    return GEO_CACHE.get(ip) || null;
}

// ─── Internal helpers ──────────────────────────────────

function normalize(data) {
    return {
        lat: data.lat,
        lng: data.lon,
        country: data.country,
        countryCode: data.countryCode,
        city: data.city || 'Unknown',
        isp: data.isp || '',
        org: data.org || '',
        asn: data.as || '',
    };
}

function cacheSet(ip, geo) {
    // Simple LRU: evict oldest when full
    if (GEO_CACHE.size >= MAX_CACHE) {
        const firstKey = GEO_CACHE.keys().next().value;
        GEO_CACHE.delete(firstKey);
    }
    GEO_CACHE.set(ip, geo);
}

function isPrivateIP(ip) {
    return (
        ip.startsWith('10.') ||
        ip.startsWith('127.') ||
        ip.startsWith('192.168.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
        ip === '0.0.0.0' ||
        ip === '255.255.255.255'
    );
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

module.exports = { resolveIP, batchResolve, getCached, GEO_CACHE };
