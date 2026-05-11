import { statements } from '@/lib/db';

export interface FirewallRule {
    id: string;
    ip: string;
    action: 'BLOCK' | 'ALLOW';
    reason?: string;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
}

/**
 * Check if an IP request should be allowed.
 * Strategy:
 * 1. If IP is in BLOCK list -> Deny (unless ALLOW override exists, but for now simple block).
 * 2. If IP is in ALLOW list -> Allow (bypasses block if we had complex logic).
 * 3. Default -> Allow.
 */
export function checkIP(ip: string): { allowed: boolean; reason?: string } {
    try {
        // Check for specific rules for this IP — uses cached prepared statement
        const rule = statements.checkFirewallIP.get(ip) as any;

        if (rule) {
            if (rule.action === 'BLOCK') {
                return { allowed: false, reason: rule.reason || 'Blocked by Administrative Firewall' };
            }
            if (rule.action === 'ALLOW') {
                return { allowed: true };
            }
        }

        // Future: CIDR checks could go here.

        return { allowed: true };
    } catch (error) {
        console.error('Firewall check error:', error);
        return { allowed: true };
    }
}

export function getFirewallRules(): FirewallRule[] {
    return statements.getAllFirewallRules.all() as FirewallRule[];
}

export function addFirewallRule(ip: string, action: 'BLOCK' | 'ALLOW', reason: string, createdBy: string) {
    const id = crypto.randomUUID();
    return statements.insertFirewallRule.run(id, ip, action, reason, createdBy);
}

export function deleteFirewallRule(id: string) {
    return statements.deleteFirewallRule.run(id);
}
