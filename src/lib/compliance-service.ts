import db from '@/lib/db';

export interface ComplianceControl {
    id: string;
    standard: string;
    domain: string;
    code: string;
    description: string;
    status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
    notes?: string;
    updatedAt?: string;
}

// Static Definition of Standards
// In a real app, this might come from a DB or external JSON
const STANDARDS_LIBRARY = [
    // NCA-ECC (National Cybersecurity Authority - Essential Cybersecurity Controls)
    { standard: 'NCA-ECC', domain: 'Governance', code: 'ECC-1-1', description: 'Develop and implement a cybersecurity strategy.' },
    { standard: 'NCA-ECC', domain: 'Governance', code: 'ECC-1-2', description: 'Define cybersecurity roles and responsibilities.' },
    { standard: 'NCA-ECC', domain: 'Defense', code: 'ECC-2-1', description: 'Asset Management and Classification.' },
    { standard: 'NCA-ECC', domain: 'Defense', code: 'ECC-2-2', description: 'Identity and Access Management (IAM).' },
    { standard: 'NCA-ECC', domain: 'Defense', code: 'ECC-2-3', description: 'Information System Protection (Backup, Patching).' },
    { standard: 'NCA-ECC', domain: 'Resilience', code: 'ECC-3-1', description: 'Cybersecurity Incident Management.' },

    // ISO 27001 (International Standard)
    { standard: 'ISO 27001', domain: 'A.5 Policies', code: 'A.5.1', description: 'Policies for information security.' },
    { standard: 'ISO 27001', domain: 'A.9 Access', code: 'A.9.1', description: 'Business requirements of access control.' },
    { standard: 'ISO 27001', domain: 'A.12 Operations', code: 'A.12.3', description: 'Backup.' },
    { standard: 'ISO 27001', domain: 'A.12 Operations', code: 'A.12.6', description: 'Technical vulnerability management.' },
];

export function getComplianceStatus(): ComplianceControl[] {
    // 1. Fetch assessments from DB
    const assessments = db.prepare('SELECT * FROM compliance_assessments').all() as any[];
    const assessmentMap = new Map(assessments.map(a => [`${a.standardId}:${a.controlId}`, a]));

    // 2. Merge with Standards Library
    return STANDARDS_LIBRARY.map(std => {
        const key = `${std.standard}:${std.code}`;
        const assessment = assessmentMap.get(key);

        return {
            id: key,
            standard: std.standard,
            domain: std.domain,
            code: std.code,
            description: std.description,
            status: assessment?.status || 'NON_COMPLIANT',
            notes: assessment?.notes || '',
            updatedAt: assessment?.updatedAt
        };
    });
}

export function updateComplianceStatus(standardId: string, controlId: string, status: string, notes: string) {
    const id = `${standardId}:${controlId}`;

    const stmt = db.prepare(`
        INSERT INTO compliance_assessments (id, standardId, controlId, status, notes, updatedAt)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(standardId, controlId) DO UPDATE SET
            status = excluded.status,
            notes = excluded.notes,
            updatedAt = CURRENT_TIMESTAMP
    `);

    return stmt.run(id, standardId, controlId, status, notes);
}
