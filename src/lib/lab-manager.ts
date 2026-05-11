/**
 * 🐳 Lab Environment Manager
 * 
 * Manages Docker-based vulnerable lab instances per user.
 * Each lab starts an isolated container with:
 * - Unique network namespace
 * - Time-limited sessions (auto-stop after 2 hours)
 * - Resource limits (CPU/Memory)
 * - VPN-accessible target IP
 * 
 * In development: Uses simulation mode (no real Docker).
 * In production: Spawns actual containers.
 */
import db from '@/lib/db';
import logger from '@/lib/logger';

interface LabInstance {
  id: string;
  labId: string;
  userId: string;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  targetIP: string;
  containerPort: number;
  startedAt: string;
  expiresAt: string;
  flags: string[];
}

// Active lab instances (in-memory for dev, Redis/DB for prod)
const activeInstances = new Map<string, LabInstance>();

// ─── Lab Container Images ───
const LAB_IMAGES: Record<string, { image: string; ports: number[]; flags: string[] }> = {
  'web-vuln': {
    image: 'cybershield/lab-web-vuln:latest',
    ports: [80, 443],
    flags: ['FLAG{sql_injection_found}', 'FLAG{xss_reflected}', 'FLAG{admin_panel_access}'],
  },
  'network-scan': {
    image: 'cybershield/lab-network:latest',
    ports: [21, 22, 80, 445, 3306],
    flags: ['FLAG{open_ports_identified}', 'FLAG{ftp_anonymous}', 'FLAG{smb_share_found}'],
  },
  'linux-privesc': {
    image: 'cybershield/lab-linux-privesc:latest',
    ports: [22],
    flags: ['FLAG{user_shell_obtained}', 'FLAG{root_flag_captured}'],
  },
  'crypto-challenge': {
    image: 'cybershield/lab-crypto:latest',
    ports: [8080],
    flags: ['FLAG{caesar_decoded}', 'FLAG{rsa_cracked}'],
  },
  'forensics-disk': {
    image: 'cybershield/lab-forensics:latest',
    ports: [80],
    flags: ['FLAG{hidden_file_found}', 'FLAG{deleted_data_recovered}'],
  },
  'wifi-wpa2': {
    image: 'cybershield/lab-wifi:latest',
    ports: [80, 8080],
    flags: ['FLAG{handshake_captured}', 'FLAG{password_cracked}'],
  },
};

// ─── Start Lab Instance ───
export function startLabInstance(userId: string, labId: string): LabInstance {
  // Check if user already has an active lab
  const existingKey = `${userId}:${labId}`;
  const existing = activeInstances.get(existingKey);
  if (existing && existing.status === 'running') {
    return existing;
  }

  // Check max concurrent labs per user (limit: 2)
  let userLabCount = 0;
  for (const [, inst] of activeInstances) {
    if (inst.userId === userId && inst.status === 'running') userLabCount++;
  }
  if (userLabCount >= 2) {
    throw new Error('الحد الأقصى من المختبرات المتزامنة هو 2. أوقف مختبراً آخر أولاً.');
  }

  const labConfig = LAB_IMAGES[labId] || LAB_IMAGES['web-vuln'];
  const instanceId = crypto.randomUUID();

  // Generate pseudo-random target IP (10.x.x.x range)
  const hash = Math.abs(hashCode(`${userId}:${labId}:${Date.now()}`));
  const targetIP = `10.${(hash >> 16) & 0xFF}.${(hash >> 8) & 0xFF}.${hash & 0xFE | 1}`;
  const containerPort = 10000 + (hash % 50000);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

  const instance: LabInstance = {
    id: instanceId,
    labId,
    userId,
    status: 'running',
    targetIP,
    containerPort,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    flags: labConfig.flags,
  };

  activeInstances.set(existingKey, instance);

  // Log the lab start
  try {
    db.prepare(`
      INSERT INTO audit_logs (action, user_id, ip_address, user_agent, resource, resource_id, details, severity)
      VALUES ('LAB_START', ?, '127.0.0.1', 'system', 'lab', ?, ?, 'low')
    `).run(userId, labId, JSON.stringify({ instanceId, targetIP, expiresAt: expiresAt.toISOString() }));
  } catch { /* skip */ }

  logger.info('system', `Lab started: ${labId} for user ${userId}`, { instanceId, targetIP });

  // In production: spawn Docker container here
  // exec(`docker run -d --name ${instanceId} --network lab-net --ip ${targetIP} --memory=512m --cpus=0.5 ${labConfig.image}`);

  return instance;
}

// ─── Stop Lab Instance ───
export function stopLabInstance(userId: string, labId: string): boolean {
  const key = `${userId}:${labId}`;
  const instance = activeInstances.get(key);
  
  if (!instance) return false;

  instance.status = 'stopped';
  activeInstances.delete(key);

  logger.info('system', `Lab stopped: ${labId} for user ${userId}`, { instanceId: instance.id });

  // In production: docker stop + docker rm
  // exec(`docker stop ${instance.id} && docker rm ${instance.id}`);

  return true;
}

// ─── Get Lab Instance Status ───
export function getLabInstance(userId: string, labId: string): LabInstance | null {
  const key = `${userId}:${labId}`;
  const instance = activeInstances.get(key);
  
  if (!instance) return null;

  // Check if expired
  if (new Date(instance.expiresAt) < new Date()) {
    stopLabInstance(userId, labId);
    return null;
  }

  return instance;
}

// ─── Get All Active Labs for User ───
export function getUserActiveLabs(userId: string): LabInstance[] {
  const labs: LabInstance[] = [];
  for (const [, inst] of activeInstances) {
    if (inst.userId === userId && inst.status === 'running') {
      labs.push(inst);
    }
  }
  return labs;
}

// ─── Validate Flag Submission ───
export function validateLabFlag(userId: string, labId: string, submittedFlag: string): {
  correct: boolean;
  flagIndex: number;
  totalFlags: number;
  message: string;
} {
  const instance = getLabInstance(userId, labId);
  const labConfig = LAB_IMAGES[labId];
  const flags = instance?.flags || labConfig?.flags || [];

  const normalized = submittedFlag.trim().toUpperCase();
  const flagIndex = flags.findIndex(f => f.toUpperCase() === normalized);

  if (flagIndex >= 0) {
    return {
      correct: true,
      flagIndex,
      totalFlags: flags.length,
      message: `🎉 العلم ${flagIndex + 1}/${flags.length} صحيح!`,
    };
  }

  return {
    correct: false,
    flagIndex: -1,
    totalFlags: flags.length,
    message: 'العلم غير صحيح. حاول مرة أخرى.',
  };
}

// ─── Auto-cleanup expired instances every 5 minutes ───
setInterval(() => {
  const now = new Date();
  for (const [key, inst] of activeInstances) {
    if (new Date(inst.expiresAt) < now) {
      activeInstances.delete(key);
      logger.info('system', `Lab auto-expired: ${inst.labId} for ${inst.userId}`);
    }
  }
}, 5 * 60 * 1000);

// ─── Helper ───
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

// ─── Lab Stats ───
export function getLabStats() {
  let running = 0;
  for (const [, inst] of activeInstances) {
    if (inst.status === 'running') running++;
  }
  return {
    activeLabs: running,
    maxConcurrent: 100, // Configurable
    availableImages: Object.keys(LAB_IMAGES).length,
  };
}
