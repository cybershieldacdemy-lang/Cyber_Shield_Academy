/**
 * ═══════════════════════════════════════════════════════════
 *  Cyber Attack Intelligence Server v1.0
 * ═══════════════════════════════════════════════════════════
 *
 *  Architecture:
 *    [Threat Intelligence APIs] → [This Server] → [WebSocket] → [Frontend Globe]
 *
 *  Data flow:
 *    1. Poll real threat feeds (AbuseIPDB, AlienVault OTX, GreyNoise, etc.)
 *    2. Resolve IPs to geolocation (ip-api.com)
 *    3. Classify attack type & severity
 *    4. Broadcast normalized events via WebSocket (ws://localhost:3001)
 *    5. Fallback to structured simulation when no API keys are configured
 *
 *  Usage:
 *    node server/index.js
 *
 *  Environment:
 *    Copy .env.example to .env and add your API keys.
 *    All keys are optional — the server runs without them.
 */

require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const {
    AbuseIPDB,
    AlienVaultOTX,
    GreyNoise,
    Shodan,
    VirusTotal,
    Simulation,
    ALL_FEEDS,
    ATTACK_COLORS,
} = require('./feeds');

// ═══════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════

const WS_PORT = parseInt(process.env.WS_PORT) || 3001;
const API_PORT = parseInt(process.env.API_PORT) || 3002;

// Event generation rate: broadcast 1-3 events per tick
const TICK_INTERVAL = 150;  // ms between broadcast ticks (≈ 7-20 events/sec)

// ═══════════════════════════════════════════════════════
//  INITIALIZE FEEDS
// ═══════════════════════════════════════════════════════

AbuseIPDB.init(process.env.ABUSEIPDB_API_KEY);
AlienVaultOTX.init(process.env.OTX_API_KEY);
GreyNoise.init(process.env.GREYNOISE_API_KEY);
Shodan.init(process.env.SHODAN_API_KEY);
VirusTotal.init(process.env.VIRUSTOTAL_API_KEY);

const realFeeds = [AbuseIPDB, AlienVaultOTX, GreyNoise, Shodan, VirusTotal].filter(
    (f) => f.isConfigured(),
);
const hasRealFeeds = realFeeds.length > 0;

// ═══════════════════════════════════════════════════════
//  STATISTICS
// ═══════════════════════════════════════════════════════

const stats = {
    totalBroadcast: 0,
    startTime: Date.now(),
    feedBreakdown: {},
    recentEvents: [],          // Last 50 events for /api/recent
    connectedClients: 0,
};

function recordEvent(event) {
    stats.totalBroadcast++;
    stats.feedBreakdown[event.feed] = (stats.feedBreakdown[event.feed] || 0) + 1;
    stats.recentEvents.unshift(event);
    if (stats.recentEvents.length > 50) stats.recentEvents.length = 50;
}

// ═══════════════════════════════════════════════════════
//  EXPRESS API SERVER
// ═══════════════════════════════════════════════════════

const app = express();

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

/**
 * GET /api/status — Server health & feed status
 */
app.get('/api/status', (req, res) => {
    const feeds = {};
    for (const feed of ALL_FEEDS) {
        feeds[feed.name] = {
            configured: feed.isConfigured(),
            type: feed.name === 'Simulation' ? 'fallback' : 'real',
        };
    }

    res.json({
        status: 'running',
        uptime: Math.floor((Date.now() - stats.startTime) / 1000),
        wsPort: WS_PORT,
        apiPort: API_PORT,
        connectedClients: stats.connectedClients,
        totalEventsProcessed: stats.totalBroadcast,
        feedBreakdown: stats.feedBreakdown,
        feeds,
        mode: hasRealFeeds ? 'live' : 'simulation',
    });
});

/**
 * GET /api/recent — Last 50 attack events (for page-load catch-up)
 */
app.get('/api/recent', (req, res) => {
    res.json({
        events: stats.recentEvents,
        total: stats.totalBroadcast,
    });
});

/**
 * GET /api/feeds — Detailed feed information
 */
app.get('/api/feeds', (req, res) => {
    const feedInfo = ALL_FEEDS.map((f) => ({
        name: f.name,
        configured: f.isConfigured(),
        type: f.name === 'Simulation' ? 'fallback' : 'real',
    }));
    res.json({ feeds: feedInfo, mode: hasRealFeeds ? 'live' : 'simulation' });
});

app.listen(API_PORT, () => {
    // Logged in startup banner
});

// ═══════════════════════════════════════════════════════
//  WEBSOCKET SERVER
// ═══════════════════════════════════════════════════════

const wss = new WebSocketServer({ port: WS_PORT });

// Tracking rooms for WebRTC and Chat natively
const roomClients = new Map(); // roomId -> Set of ws

wss.on('connection', (ws) => {
    stats.connectedClients++;
    log('WS', `Client connected (total: ${stats.connectedClients})`);

    // Only send recent intelligence events if NOT in a private room
    setTimeout(() => {
        if (!ws.roomId) {
            for (const evt of stats.recentEvents.slice(0, 10)) {
                try { ws.send(JSON.stringify(evt)); } catch { /* skip */ }
            }
        }
    }, 100);

    ws.on('message', (messageMsg) => {
        try {
            const data = JSON.parse(messageMsg.toString());
            
            // 1. Join Room
            if (data.type === 'join-room') {
                const { roomId } = data;
                ws.roomId = roomId;
                if (!roomClients.has(roomId)) roomClients.set(roomId, new Set());
                roomClients.get(roomId).add(ws);
                log('WS-ROOM', `Client joined room: ${roomId}`);
                return;
            }

            // 2. Chat or Signal (Routed to Room peers)
            if (data.type === 'chat' || data.type === 'signal') {
                const { roomId } = data;
                if (roomId && roomClients.has(roomId)) {
                    roomClients.get(roomId).forEach(client => {
                        // Broadcast to everyone else in the room
                        if (client !== ws && client.readyState === 1) {
                            client.send(JSON.stringify(data));
                        }
                    });
                }
                return;
            }

        } catch (e) {
            // Not JSON or other message, ignore
        }
    });

    ws.on('close', () => {
        stats.connectedClients--;
        log('WS', `Client disconnected (total: ${stats.connectedClients})`);
        
        // Remove from rooms if applicable
        if (ws.roomId && roomClients.has(ws.roomId)) {
            roomClients.get(ws.roomId).delete(ws);
            if (roomClients.get(ws.roomId).size === 0) {
                roomClients.delete(ws.roomId);
            }
        }
    });
});

function broadcast(event) {
    const payload = JSON.stringify(event);
    wss.clients.forEach((client) => {
        // Broadcast strictly to non-room clients (Threat Map listeners)!
        if (client.readyState === 1 && !client.roomId) {
            try { client.send(payload); } catch { /* skip */ }
        }
    });
}

// ═══════════════════════════════════════════════════════
//  FEED REFRESH SCHEDULER
// ═══════════════════════════════════════════════════════

async function refreshAllFeeds() {
    const tasks = [];

    if (AbuseIPDB.isConfigured()) {
        tasks.push(
            AbuseIPDB.refreshBlacklist().catch((e) =>
                console.error('[REFRESH] AbuseIPDB error:', e.message),
            ),
        );
    }
    if (AlienVaultOTX.isConfigured()) {
        tasks.push(
            AlienVaultOTX.refreshPulses().catch((e) =>
                console.error('[REFRESH] OTX error:', e.message),
            ),
        );
    }
    if (GreyNoise.isConfigured()) {
        tasks.push(
            GreyNoise.refreshData().catch((e) =>
                console.error('[REFRESH] GreyNoise error:', e.message),
            ),
        );
    }
    if (Shodan.isConfigured()) {
        tasks.push(
            Shodan.refreshData().catch((e) =>
                console.error('[REFRESH] Shodan error:', e.message),
            ),
        );
    }
    if (VirusTotal.isConfigured()) {
        tasks.push(
            VirusTotal.refreshData().catch((e) =>
                console.error('[REFRESH] VirusTotal error:', e.message),
            ),
        );
    }

    await Promise.allSettled(tasks);
}

// ═══════════════════════════════════════════════════════
//  EVENT GENERATION LOOP
// ═══════════════════════════════════════════════════════

async function generateAndBroadcast() {
    if (wss.clients.size === 0) return; // No clients, skip

    const events = [];

    if (hasRealFeeds) {
        // Poll real feeds (round-robin with randomization)
        for (const feed of realFeeds) {
            try {
                const feedEvents = await feed.poll(Math.ceil(Math.random() * 2));
                events.push(...feedEvents);
            } catch (e) {
                // Silent fail — don't crash the loop
            }
        }

        // Supplement with simulation if real feeds didn't produce enough
        if (events.length < 2) {
            const simEvents = await Simulation.poll(2 - events.length);
            events.push(...simEvents);
        }
    } else {
        // Pure simulation mode
        const simEvents = await Simulation.poll(Math.floor(Math.random() * 3) + 1);
        events.push(...simEvents);
    }

    // Broadcast all events
    for (const event of events) {
        broadcast(event);
        recordEvent(event);
    }
}

// ═══════════════════════════════════════════════════════
//  STARTUP
// ═══════════════════════════════════════════════════════

function log(tag, msg) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`[${time}] [${tag}] ${msg}`);
}

async function start() {
    // Banner
    console.log('');
    console.log('🌍 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Cyber Attack Intelligence Server v1.0');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   API Server:  http://localhost:${API_PORT}`);
    console.log(`   WebSocket:   ws://localhost:${WS_PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Data Sources:');

    const feedList = [
        { feed: AbuseIPDB, label: 'AbuseIPDB' },
        { feed: AlienVaultOTX, label: 'AlienVault OTX' },
        { feed: GreyNoise, label: 'GreyNoise' },
        { feed: Shodan, label: 'Shodan' },
        { feed: VirusTotal, label: 'VirusTotal' },
    ];

    for (const { feed, label } of feedList) {
        const icon = feed.isConfigured() ? '✓' : '✗';
        const status = feed.isConfigured() ? 'active' : 'no api key';
        console.log(`     ${icon} ${label.padEnd(20)} [${status}]`);
    }

    console.log(`     ✓ ${'GeoIP (ip-api.com)'.padEnd(20)} [active]`);
    console.log(`     ✓ ${'Simulation'.padEnd(20)} [${hasRealFeeds ? 'supplemental' : 'primary'}]`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (hasRealFeeds) {
        console.log(`   Mode: LIVE (${realFeeds.length} real feed(s) + simulation)`);
    } else {
        console.log('   Mode: SIMULATION (add API keys to .env for live data)');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initial feed refresh
    if (hasRealFeeds) {
        log('INIT', 'Refreshing threat intelligence feeds...');
        await refreshAllFeeds();
        log('INIT', 'Feed initialization complete');
    }

    // Start event generation loop
    setInterval(() => {
        generateAndBroadcast().catch((e) =>
            console.error('[LOOP] Event generation error:', e.message),
        );
    }, TICK_INTERVAL);

    // Periodic feed refresh (every 5 minutes)
    if (hasRealFeeds) {
        setInterval(() => {
            refreshAllFeeds().catch((e) =>
                console.error('[REFRESH] Periodic refresh error:', e.message),
            );
        }, 5 * 60 * 1000);
    }

    log('INIT', 'Server ready — waiting for clients...');
}

start().catch((e) => {
    console.error('Fatal startup error:', e);
    process.exit(1);
});

// ═══════════════════════════════════════════════════════
//  GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════

process.on('SIGINT', () => {
    console.log('\n[SHUTDOWN] Closing connections...');
    wss.clients.forEach((client) => client.close());
    wss.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    wss.clients.forEach((client) => client.close());
    wss.close();
    process.exit(0);
});
