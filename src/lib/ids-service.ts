import { statements } from '@/lib/db';

export interface IdsAlert {
    id: string;
    type: 'BRUTE_FORCE' | 'INJECTION_ATTEMPT' | 'FIREWALL_PROBING' | 'PERMISSION_VIOLATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    sourceIp: string;
    count: number;
    lastSeen: string;
    details: string;
}

export function detectThreats(): IdsAlert[] {
    const alerts: IdsAlert[] = [];

    // 1. Detect Brute Force (Multiple failed logins from same IP)
    const loginFailures = statements.idsLoginFailures.all() as any[];

    loginFailures.forEach(f => {
        alerts.push({
            id: `bf-${f.ip}`,
            type: 'BRUTE_FORCE',
            severity: f.count > 20 ? 'CRITICAL' : 'HIGH',
            sourceIp: f.ip,
            count: f.count,
            lastSeen: f.lastSeen,
            details: `Detected ${f.count} failed login attempts in the last hour.`
        });
    });

    // 2. Detect Injection Attempts (SQLi/XSS caught by API Guard)
    const injectionAttempts = statements.idsInjectionAttempts.all() as any[];

    injectionAttempts.forEach(f => {
        alerts.push({
            id: `inj-${f.ip}`,
            type: 'INJECTION_ATTEMPT',
            severity: 'CRITICAL',
            sourceIp: f.ip,
            count: f.count,
            lastSeen: f.lastSeen,
            details: `Detected ${f.count} injection/malicious payload attempts.`
        });
    });

    // 3. Detect Firewall Probing (High volume of blocked requests)
    const firewallBlocks = statements.idsFirewallBlocks.all() as any[];

    firewallBlocks.forEach(f => {
        alerts.push({
            id: `fw-${f.ip}`,
            type: 'FIREWALL_PROBING',
            severity: f.count > 50 ? 'HIGH' : 'MEDIUM',
            sourceIp: f.ip,
            count: f.count,
            lastSeen: f.lastSeen,
            details: `Source is checking blocked ports/paths (${f.count} blocked requests).`
        });
    });

    return alerts.sort((a, _b) => (a.severity === 'CRITICAL' ? -1 : 1));
}

export function getThreatLevel(alerts: IdsAlert[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (alerts.some(a => a.severity === 'CRITICAL')) return 'CRITICAL';
    if (alerts.some(a => a.severity === 'HIGH')) return 'HIGH';
    if (alerts.length > 0) return 'MEDIUM';
    return 'LOW';
}
