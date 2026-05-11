/**
 * 🧰 Cyber Range Tool Engines — Enhanced
 * 20+ simulated cybersecurity tools running entirely in the browser.
 * Each command is a JavaScript function operating on a virtual state.
 */

export interface VFSNode {
    [key: string]: string | VFSNode;
}

export interface NetworkHost {
    ip: string;
    hostname: string;
    ports: { port: number; service: string; version: string; banner?: string }[];
    vulnerabilities: { id: string; name: string; tool_required: string; payload_regex: string; effect: (state: LabState) => string }[];
    webPaths?: Record<string, string>;
    sshCredentials?: Record<string, string>;
}

export interface LabState {
    cwd: string[];
    vfs: VFSNode;
    network: NetworkHost[];
    discovered_ips: string[];
    discovered_ports: Record<string, number[]>;
    exploited_ids: string[];
    sshSessions: Record<string, boolean>;
    currentUser: string;
    env: Record<string, string>;
}

export const initialLabState: LabState = {
    cwd: ['/'],
    vfs: {
        '/': {
            'etc': {
                'passwd': 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash',
                'hostname': 'cybershield-lab-01'
            },
            'home': {
                'user': {
                    'readme.txt': 'Welcome to the CyberShield Cyber Range.\nType "help" for available commands.\nType "objectives" to see your mission.',
                    '.bash_history': 'ls\ncd /etc\ncat passwd'
                }
            },
            'var': {
                'log': {
                    'auth.log': '[2026-04-19 10:00:01] session opened for user root',
                    'apache2': {
                        'access.log': '192.168.1.5 - - [19/Apr/2026:10:05:22] "GET / HTTP/1.1" 200 612'
                    }
                }
            }
        }
    },
    network: [
        {
            ip: '10.0.5.22',
            hostname: 'alpha-web-prod',
            ports: [
                { port: 80, service: 'http', version: 'Apache/2.4.41 (Ubuntu)' },
                { port: 22, service: 'ssh', version: 'OpenSSH 8.2p1' }
            ],
            vulnerabilities: [],
            webPaths: { '/': '<h1>Alpha Web Server</h1>' }
        }
    ],
    discovered_ips: [],
    discovered_ports: {},
    exploited_ids: [],
    sshSessions: {},
    currentUser: 'user',
    env: {}
};

// ═══════════════════════════════════════════════════════════
// 🔧 MAIN COMMAND PARSER
// ═══════════════════════════════════════════════════════════

export function parseCommand(cmdLine: string, state: LabState): { output: string; newState: LabState } {
    const parts = cmdLine.trim().split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let output = '';
    const newState = JSON.parse(JSON.stringify(state)) as LabState;

    // Restore function references for vulnerabilities
    state.network.forEach((host, i) => {
        if (newState.network[i]) {
            newState.network[i].vulnerabilities = host.vulnerabilities;
        }
    });

    switch (mainCmd) {
        case 'ls': output = handleLs(args, newState); break;
        case 'cd': { const r = handleCd(args, newState); output = r.output; newState.cwd = r.newCwd; break; }
        case 'cat': output = handleCat(args, newState); break;
        case 'pwd': output = '/' + newState.cwd.slice(1).join('/'); break;
        case 'whoami': output = newState.currentUser; break;
        case 'id': output = `uid=${newState.currentUser === 'root' ? '0' : '1000'}(${newState.currentUser}) gid=${newState.currentUser === 'root' ? '0' : '1000'}(${newState.currentUser})`; break;
        case 'hostname': output = getNodeValue(['/', 'etc', 'hostname'], newState.vfs) || 'localhost'; break;
        case 'uname': output = 'Linux cybershield-lab 5.15.0-generic #1 SMP x86_64 GNU/Linux'; break;
        case 'date': output = new Date().toUTCString(); break;
        case 'echo': output = args.join(' '); break;
        case 'head': output = handleHead(args, newState); break;
        case 'tail': output = handleTail(args, newState); break;
        case 'wc': output = handleWc(args, newState); break;
        case 'grep': output = handleGrep(args, newState); break;
        case 'find': output = handleFind(args, newState); break;
        case 'ifconfig': case 'ip': output = handleIfconfig(newState); break;
        case 'ping': output = handlePing(args, newState); break;
        case 'nmap': output = handleNmap(args, newState); break;
        case 'curl': case 'wget': output = handleCurl(args, newState); break;
        case 'nikto': output = handleNikto(args, newState); break;
        case 'dirb': case 'gobuster': output = handleDirb(args, newState); break;
        case 'hydra': output = handleHydra(args, newState); break;
        case 'sqlmap': output = handleSqlmap(args, newState); break;
        case 'msfconsole': output = handleMsfconsole(); break;
        case 'john': output = handleJohn(args, newState); break;
        case 'base64': output = handleBase64(args); break;
        case 'decode': output = handleDecode(args); break;
        case 'ssh': output = handleSsh(args, newState); break;
        case 'sudo': output = handleSudo(args, newState); break;
        case 'history': output = 'Command history is tracked in-session.\nUse ↑/↓ arrow keys to navigate.'; break;
        case 'man': output = handleMan(args); break;
        case 'clear': output = '__CLEAR__'; break;
        case 'help': output = getHelpText(); break;
        case 'hint': output = '__HINT__'; break;
        case 'objectives': output = '__OBJECTIVES__'; break;
        case 'exit': case 'logout': output = 'Cannot exit — you are in the lab environment.\nUse "help" to see available commands.'; break;
        default: output = `bash: ${mainCmd}: command not found. Type "help" for available commands.`; break;
    }

    return { output, newState };
}

// ═══════════════════════════════════════════════════════════
// 📁 FILESYSTEM COMMANDS
// ═══════════════════════════════════════════════════════════

function getNode(path: string[], vfs: VFSNode): string | VFSNode | null {
    let current: any = vfs;
    for (const part of path) {
        if (part === '/') continue;
        if (current[part] === undefined) return null;
        current = current[part];
    }
    return current;
}

function getNodeValue(path: string[], vfs: VFSNode): string {
    const node = getNode(path, vfs);
    return typeof node === 'string' ? node : '';
}

function handleLs(args: string[], state: LabState): string {
    const showAll = args.includes('-la') || args.includes('-a') || args.includes('-al');
    const pathArg = args.find(a => !a.startsWith('-'));
    let targetPath = state.cwd;

    if (pathArg) {
        targetPath = pathArg.startsWith('/')
            ? ['/', ...pathArg.split('/').filter(Boolean)]
            : [...state.cwd, ...pathArg.split('/').filter(Boolean)];
    }

    const node = getNode(targetPath, state.vfs);
    if (typeof node === 'object' && node !== null) {
        const entries = Object.keys(node);
        if (!showAll) {
            return entries.filter(e => !e.startsWith('.')).join('  ');
        }
        // Detailed listing
        const lines = ['total ' + entries.length, 'drwxr-xr-x  .', 'drwxr-xr-x  ..'];
        entries.forEach(name => {
            const child = node[name];
            const isDir = typeof child === 'object';
            const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
            const size = isDir ? '4096' : String(typeof child === 'string' ? child.length : 0).padStart(6);
            lines.push(`${perm}  ${state.currentUser} ${state.currentUser} ${size} Apr 19 08:00 ${name}`);
        });
        return lines.join('\n');
    }
    if (typeof node === 'string') return `ls: cannot list '${pathArg}': Not a directory`;
    return `ls: cannot access '${pathArg || '/'}': No such file or directory`;
}

function handleCd(args: string[], state: LabState): { output: string; newCwd: string[] } {
    if (args.length === 0 || args[0] === '~') {
        return { output: '', newCwd: ['/', 'home', state.currentUser] };
    }
    if (args[0] === '..') {
        if (state.cwd.length <= 1) return { output: '', newCwd: ['/'] };
        return { output: '', newCwd: state.cwd.slice(0, -1) };
    }
    if (args[0] === '/') return { output: '', newCwd: ['/'] };

    const targetDir = args[0];
    const parts = targetDir.split('/').filter(Boolean);
    let targetPath: string[];

    if (targetDir.startsWith('/')) {
        targetPath = ['/', ...parts];
    } else {
        targetPath = [...state.cwd];
        for (const part of parts) {
            if (part === '..') {
                if (targetPath.length > 1) targetPath.pop();
            } else if (part !== '.') {
                targetPath.push(part);
            }
        }
    }

    const node = getNode(targetPath, state.vfs);
    if (node && typeof node === 'object') {
        return { output: '', newCwd: targetPath };
    }
    return { output: `-bash: cd: ${targetDir}: No such directory`, newCwd: state.cwd };
}

function handleCat(args: string[], state: LabState): string {
    if (args.length === 0) return 'usage: cat <file>';
    const fileName = args[0];

    // Absolute path
    if (fileName.startsWith('/')) {
        const parts = ['/', ...fileName.split('/').filter(Boolean)];
        const node = getNode(parts, state.vfs);
        if (typeof node === 'string') {
            // Special permission check for sensitive files
            if (fileName.includes('/root/') && state.currentUser !== 'root' && !state.env.SUDO_ACTIVE) {
                return `cat: ${fileName}: Permission denied`;
            }
            return node;
        }
        if (node && typeof node === 'object') return `cat: ${fileName}: Is a directory`;
        return `cat: ${fileName}: No such file or directory`;
    }

    // Relative path
    const node = getNode([...state.cwd, ...fileName.split('/').filter(Boolean)], state.vfs);
    if (typeof node === 'string') return node;
    if (node && typeof node === 'object') return `cat: ${fileName}: Is a directory`;
    return `cat: ${fileName}: No such file or directory`;
}

function handleHead(args: string[], state: LabState): string {
    let n = 10;
    let file = '';
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[i + 1]) || 10; i++; }
        else if (!args[i].startsWith('-')) file = args[i];
    }
    if (!file) return 'usage: head [-n NUM] <file>';
    const content = handleCat([file], state);
    if (content.startsWith('cat:')) return content.replace('cat:', 'head:');
    return content.split('\n').slice(0, n).join('\n');
}

function handleTail(args: string[], state: LabState): string {
    let n = 10;
    let file = '';
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[i + 1]) || 10; i++; }
        else if (!args[i].startsWith('-')) file = args[i];
    }
    if (!file) return 'usage: tail [-n NUM] <file>';
    const content = handleCat([file], state);
    if (content.startsWith('cat:')) return content.replace('cat:', 'tail:');
    return content.split('\n').slice(-n).join('\n');
}

function handleWc(args: string[], state: LabState): string {
    const file = args.find(a => !a.startsWith('-'));
    if (!file) return 'usage: wc <file>';
    const content = handleCat([file], state);
    if (content.startsWith('cat:')) return content.replace('cat:', 'wc:');
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    return `  ${lines}  ${words}  ${chars} ${file}`;
}

function handleGrep(args: string[], state: LabState): string {
    if (args.length < 2) return 'usage: grep <pattern> <file>\n  Options: -i (case insensitive), -r (recursive)';
    const caseInsensitive = args.includes('-i');
    const recursive = args.includes('-r');
    const nonFlagArgs = args.filter(a => !a.startsWith('-'));
    const pattern = nonFlagArgs[0];
    const target = nonFlagArgs[1];

    if (recursive) {
        return grepRecursive(pattern, state.cwd, state.vfs, caseInsensitive);
    }

    const content = handleCat([target], state);
    if (content.startsWith('cat:')) return content.replace('cat:', 'grep:');

    const flags = caseInsensitive ? 'i' : '';
    try {
        const regex = new RegExp(pattern, flags);
        const matches = content.split('\n').filter(line => regex.test(line));
        if (matches.length === 0) return `(no matches found for '${pattern}')`;
        return matches.join('\n');
    } catch {
        // Simple string search fallback
        const matches = content.split('\n').filter(line =>
            caseInsensitive ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern)
        );
        if (matches.length === 0) return `(no matches found for '${pattern}')`;
        return matches.join('\n');
    }
}

function grepRecursive(pattern: string, path: string[], vfs: VFSNode, ignoreCase: boolean): string {
    const results: string[] = [];
    const node = getNode(path, vfs);
    if (!node || typeof node === 'string') return '';

    for (const [name, child] of Object.entries(node)) {
        const fullPath = [...path.slice(1), name].join('/');
        if (typeof child === 'string') {
            const lines = child.split('\n');
            lines.forEach(line => {
                const match = ignoreCase ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern);
                if (match) results.push(`/${fullPath}: ${line}`);
            });
        } else {
            results.push(grepRecursive(pattern, [...path, name], vfs, ignoreCase));
        }
    }
    return results.filter(Boolean).join('\n');
}

function handleFind(args: string[], state: LabState): string {
    const nameFlag = args.indexOf('-name');
    const permFlag = args.indexOf('-perm');
    const typeFlag = args.indexOf('-type');
    const startPath = args[0] && !args[0].startsWith('-') ? args[0] : '/';

    let namePattern = '';
    if (nameFlag !== -1 && args[nameFlag + 1]) {
        namePattern = args[nameFlag + 1].replace(/"/g, '').replace(/'/g, '');
    }

    let permSearch = '';
    if (permFlag !== -1 && args[permFlag + 1]) {
        permSearch = args[permFlag + 1];
    }

    const results: string[] = [];
    const searchPath = startPath === '/' ? ['/'] : ['/', ...startPath.split('/').filter(Boolean)];

    findRecursive(searchPath, state.vfs, namePattern, permSearch, results);

    // Special case: finding SUID files
    if (permSearch.includes('4000') || permSearch.includes('suid')) {
        results.push('/usr/bin/vim [SUID -rwsr-xr-x]');
        results.push('/usr/bin/find [SUID -rwsr-xr-x]');
        results.push('/usr/bin/passwd [SUID -rwsr-xr-x]');
    }

    if (results.length === 0) return '(no files found matching criteria)';
    return results.join('\n');
}

function findRecursive(path: string[], vfs: VFSNode, namePattern: string, _permSearch: string, results: string[]): void {
    const node = getNode(path, vfs);
    if (!node || typeof node === 'string') return;

    for (const [name, child] of Object.entries(node)) {
        const fullPath = '/' + [...path.slice(1), name].join('/');

        if (namePattern) {
            const pattern = namePattern.replace(/\*/g, '.*');
            try {
                if (new RegExp(pattern, 'i').test(name)) {
                    results.push(fullPath);
                }
            } catch {
                if (name.includes(namePattern.replace(/\*/g, ''))) results.push(fullPath);
            }
        } else {
            results.push(fullPath);
        }

        if (typeof child === 'object') {
            findRecursive([...path, name], vfs, namePattern, _permSearch, results);
        }
    }
}

// ═══════════════════════════════════════════════════════════
// 🌐 NETWORK COMMANDS
// ═══════════════════════════════════════════════════════════

function handleIfconfig(state: LabState): string {
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 15432  bytes 18534216 (17.6 MiB)
        TX packets 8721  bytes 1023456 (999.4 KiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0

Known targets: ${state.network.map(h => h.ip).join(', ') || 'none discovered'}`;
}

function handlePing(args: string[], state: LabState): string {
    if (args.length === 0) return 'usage: ping <ip>';
    const target = args[0];
    const host = state.network.find(h => h.ip === target);
    if (host) {
        return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.8 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.6 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.7 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max = 0.6/0.7/0.8 ms`;
    }
    return `PING ${target}: Host unreachable`;
}

function handleNmap(args: string[], state: LabState): string {
    if (args.length === 0) return 'Nmap 7.94SVN ( https://nmap.org )\nUsage: nmap <target-ip>';
    const target = args.find(a => !a.startsWith('-')) || '';
    const host = state.network.find(h => h.ip === target);

    if (!host) {
        return `Starting Nmap 7.94SVN...
Note: Host seems down. If it is really up, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 2.12 seconds`;
    }

    // Mark as discovered
    if (!state.discovered_ips.includes(target)) {
        state.discovered_ips.push(target);
    }
    state.discovered_ports[target] = host.ports.map(p => p.port);

    const portLines = host.ports.map(p =>
        `${String(p.port).padEnd(8)}open  ${p.service.padEnd(12)} ${p.version}`
    ).join('\n');

    return `Starting Nmap 7.94SVN ( https://nmap.org )
Nmap scan report for ${host.hostname} (${host.ip})
Host is up (0.0023s latency).

PORT     STATE SERVICE      VERSION
${portLines}

Service detection performed. Nmap done: 1 IP address (1 host up) scanned in 1.45 seconds`;
}

function handleCurl(args: string[], state: LabState): string {
    if (args.length === 0) return 'usage: curl <url>';
    let url = args.find(a => !a.startsWith('-')) || '';
    url = url.replace(/^["']|["']$/g, '');

    // Extract IP and path
    const match = url.match(/(?:https?:\/\/)?(\d+\.\d+\.\d+\.\d+)(:\d+)?(\/[^\s]*)?/);
    if (!match) return `curl: (6) Could not resolve host: ${url}`;

    const ip = match[1];
    const port = match[2] ? parseInt(match[2].slice(1)) : 80;
    const path = match[3] || '/';

    const host = state.network.find(h => h.ip === ip);
    if (!host) return `curl: (7) Failed to connect to ${ip} port ${port}: Connection refused`;

    // Check if port is open
    if (!host.ports.find(p => p.port === port)) {
        return `curl: (7) Failed to connect to ${ip} port ${port}: Connection refused`;
    }

    // Check webPaths
    if (host.webPaths) {
        // Try exact path first, then fuzzy match
        for (const [webPath, content] of Object.entries(host.webPaths)) {
            if (path === webPath || decodeURIComponent(path) === webPath ||
                path.includes(webPath.split('?')[0]) ||
                webPath.includes(path)) {
                // Check for vulnerability triggers
                host.vulnerabilities?.forEach(vuln => {
                    try {
                        if (new RegExp(vuln.payload_regex, 'i').test(url) || new RegExp(vuln.payload_regex, 'i').test(decodeURIComponent(url))) {
                            if (!state.exploited_ids.includes(vuln.id)) {
                                state.exploited_ids.push(vuln.id);
                            }
                        }
                    } catch { /* skip */ }
                });

                return content;
            }
        }
    }

    // Check vulnerability payloads in URL
    let vulnTriggered = '';
    host.vulnerabilities?.forEach(vuln => {
        try {
            if (new RegExp(vuln.payload_regex, 'i').test(url) || new RegExp(vuln.payload_regex, 'i').test(decodeURIComponent(url))) {
                vulnTriggered = vuln.effect(state);
                if (!state.exploited_ids.includes(vuln.id)) {
                    state.exploited_ids.push(vuln.id);
                }
            }
        } catch { /* skip */ }
    });

    if (vulnTriggered) return vulnTriggered;

    return `<!DOCTYPE html>\n<html>\n<head><title>${host.hostname}</title></head>\n<body><h1>${host.hostname}</h1></body>\n</html>`;
}

function handleNikto(args: string[], state: LabState): string {
    if (args.length === 0) return 'Usage: nikto -h <target>';
    const hostFlag = args.indexOf('-h');
    const target = hostFlag !== -1 && args[hostFlag + 1] ? args[hostFlag + 1] : args[0];

    const host = state.network.find(h => h.ip === target);
    if (!host) return `- Nikto v2.5.0\n+ ERROR: Cannot resolve hostname/IP: ${target}`;

    const findings: string[] = [
        `- Nikto v2.5.0`,
        `+ Target IP:          ${host.ip}`,
        `+ Target Hostname:    ${host.hostname}`,
        `+ Target Port:        80`,
        `+ Start Time:         ${new Date().toISOString()}`,
        `+ Server: ${host.ports.find(p => p.port === 80)?.version || 'Unknown'}`,
        `+ /: Server leaks inusual headers via HTTP methods.`,
    ];

    if (host.webPaths) {
        const paths = Object.keys(host.webPaths);
        if (paths.includes('/admin/') || paths.includes('/admin')) {
            findings.push('+ OSVDB-3092: /admin/: Admin directory found -- possible enumeration target');
        }
        if (paths.includes('/backup/') || paths.includes('/backup')) {
            findings.push('+ OSVDB-3092: /backup/: Backup directory found -- sensitive data exposure');
        }
        if (paths.includes('/robots.txt')) {
            findings.push('+ /robots.txt: Contains interesting paths. See: https://developer.mozilla.org/en-US/docs/Glossary/Robots.txt');
        }
    }

    host.vulnerabilities?.forEach(v => {
        findings.push(`+ VULN: ${v.name} [${v.id}]`);
    });

    findings.push(`+ ${Math.floor(Math.random() * 50) + 10} requests: 0 error(s)`);
    findings.push(`+ End Time: ${new Date().toISOString()}`);

    return findings.join('\n');
}

function handleDirb(args: string[], state: LabState): string {
    if (args.length === 0) return 'Usage: dirb <url> / gobuster dir -u <url>';
    const target = args[0].replace(/https?:\/\//, '');
    const host = state.network.find(h => target.startsWith(h.ip));
    if (!host) return `DIRB: Could not connect to ${target}`;

    const lines: string[] = [
        `DIRB v2.22`,
        `URL_BASE: http://${host.ip}/`,
        `WORDLIST_FILES: /usr/share/dirb/common.txt`,
        `---- Scanning URL: http://${host.ip}/ ----`,
    ];

    if (host.webPaths) {
        Object.keys(host.webPaths).forEach(path => {
            if (path !== '/') {
                lines.push(`+ http://${host.ip}${path} (CODE:200|SIZE:${Math.floor(Math.random() * 5000) + 100})`);
            }
        });
    }

    lines.push(`\n---- END ----`);
    return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
// ⚔️ EXPLOITATION COMMANDS
// ═══════════════════════════════════════════════════════════

function handleHydra(args: string[], state: LabState): string {
    if (args.length === 0) return 'Hydra v9.5 (use: hydra -l <user> -P <wordlist> ssh://<target>)';

    const cmdStr = args.join(' ');
    const sshMatch = cmdStr.match(/ssh:\/\/(\d+\.\d+\.\d+\.\d+)/);
    const userMatch = cmdStr.match(/-l\s+(\S+)/);
    const passMatch = cmdStr.match(/-P\s+(\S+)/);

    if (!sshMatch) return '[ERROR] No target specified. Use: hydra -l <user> -P <wordlist> ssh://<target>';

    const targetIp = sshMatch[1];
    const user = userMatch?.[1] || 'admin';
    const host = state.network.find(h => h.ip === targetIp);

    if (!host) return `[ERROR] Host ${targetIp} unreachable.`;
    if (!host.ports.find(p => p.service === 'ssh')) return `[ERROR] SSH service not found on ${targetIp}`;

    // Check if there are SSH credentials for this host
    const creds = host.sshCredentials;
    if (creds && creds[user]) {
        const password = creds[user];
        // Read wordlist to see if password is there
        let wordlistContent = '';
        if (passMatch?.[1]) {
            const node = getNode(['/', ...passMatch[1].split('/').filter(Boolean)], state.vfs);
            if (typeof node === 'string') wordlistContent = node;
        }

        const passwordInList = wordlistContent.split('\n').includes(password);

        if (passwordInList) {
            return `Hydra v9.5 (https://github.com/vanhauser-thc/thc-hydra)
[DATA] max 4 tasks per 1 server, overall 4 tasks
[DATA] attacking ssh://${targetIp}:22/
[ATTEMPT] target ${targetIp} - login "${user}" - pass "123456" - 1 of 9
[ATTEMPT] target ${targetIp} - login "${user}" - pass "password" - 2 of 9
[ATTEMPT] target ${targetIp} - login "${user}" - pass "admin" - 3 of 9
[22][ssh] host: ${targetIp}   login: ${user}   password: ${password}
1 of 1 target successfully completed, 1 valid password found`;
        }
    }

    return `Hydra v9.5
[DATA] attacking ssh://${targetIp}:22/
[STATUS] 9 tries done, 0 valid passwords found
0 of 1 target completed, 0 valid password found
[ERROR] All passwords exhausted. Try a different wordlist.`;
}

function handleSqlmap(args: string[], state: LabState): string {
    if (args.length === 0) return 'Usage: sqlmap -u <url> --dbs';
    const cmdStr = args.join(' ');
    const urlMatch = cmdStr.match(/-u\s+["']?(\S+)["']?/);
    const url = urlMatch?.[1] || args[0];

    // Find matching host
    const ipMatch = url.match(/(\d+\.\d+\.\d+\.\d+)/);
    if (!ipMatch) return '[❌] Error: Invalid URL';

    const host = state.network.find(h => h.ip === ipMatch[1]);
    if (!host) return `[❌] Connection failed to ${ipMatch[1]}`;

    // Check for SQL injection vulnerability
    const sqlVuln = host.vulnerabilities?.find(v => v.id.includes('sql'));
    if (sqlVuln) {
        if (!state.exploited_ids.includes(sqlVuln.id)) {
            state.exploited_ids.push(sqlVuln.id);
        }
        return `        ___
       __H__
 ___ ___[']_____ ___ ___  {1.8#stable}
|_ -| . ["]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|

[INFO] testing connection to the target URL
[INFO] testing if the target URL content is stable
[INFO] testing 'AND boolean-based blind'
[INFO] testing 'OR boolean-based blind'
[SUCCESS] target URL is vulnerable to SQL injection

[INFO] fetching database names
available databases [2]:
[*] information_schema
[*] ${host.hostname.replace(/-/g, '_')}_db

[INFO] fetching tables from ${host.hostname.replace(/-/g, '_')}_db
+------------------+
| users            |
| orders           |
| products         |
| sessions         |
+------------------+

[INFO] fetching entries from 'users' table
+----+----------+----------------------------------+
| id | username | password_hash                    |
+----+----------+----------------------------------+
| 1  | admin    | 5f4dcc3b5aa765d61d8327deb882cf99 |
| 2  | john     | 482c811da5d5b4bc6d497ffa98491e38 |
+----+----------+----------------------------------+

${sqlVuln.effect(state)}`;
    }

    return `[INFO] testing connection to the target URL
[WARNING] target URL is not vulnerable to SQL injection
[INFO] all parameters appear to be properly sanitized
0 vulnerabilities found.`;
}

function handleMsfconsole(): string {
    return `
     .                                         .
   . .                                         . .
 @@@@@@@  @@@@@  @@@@  @@@@  @@@@@@ @@@@@  @@@  @@@@@@@
 @@@ @@@ @@  @@ @@  @@ @@  @@ @@    @@  @@  @@@  @@
 @@@ @@@ @@@@@@ @@@@@@ @@@@@@ @@@@@@ @@@@@@  @@@  @@
 @@@ @@@ @@     @@     @@     @@     @@  @@  @@@  @@
 @@@ @@@  @@@@@  @@@@@  @@@@@  @@     @@  @@  @@@   @@@@

  [ metasploit v6.3.44 ]
  [ exploits: 2358 | auxiliary: 1203 | post: 412 ]
  [ payloads: 592 | encoders: 46 | nops: 16 ]

Type 'help' for a list of commands. Use 'search <keyword>' to find modules.
For this lab, use specialized tools like sqlmap, hydra, or nikto.

msf6 > `;
}

function handleJohn(args: string[], state: LabState): string {
    if (args.length === 0) return 'John the Ripper 1.9.0\nUsage: john <hash-file>';

    const hashFile = args.find(a => !a.startsWith('-'));
    if (!hashFile) return 'john: No password files specified';

    const content = handleCat([hashFile], state);
    if (content.startsWith('cat:')) return content.replace('cat:', 'john:');

    // Look for MD5 hashes in the content
    const hashes = content.match(/[a-f0-9]{32}/g);
    if (!hashes || hashes.length === 0) return 'No password hashes found in file.';

    const cracked: Record<string, string> = {
        '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
        '482c811da5d5b4bc6d497ffa98491e38': 'password123',
        '5e884898da28047151d0e56f8dc62927': 'hello',
        '21232f297a57a5a743894a0e4a801fc3': 'admin',
        'e10adc3949ba59abbe56e057f20f883e': '123456',
    };

    const results: string[] = ['Loaded ' + hashes.length + ' password hashes (Raw-MD5)', 'Press Ctrl-C to abort...'];

    hashes.forEach(hash => {
        if (cracked[hash]) {
            results.push(`${hash}:${cracked[hash]}       (cracked!)`);
        }
    });

    if (results.length === 2) {
        results.push('Session completed, 0 passwords cracked');
    } else {
        results.push(`\n${results.length - 2} password(s) cracked, 0 left`);
    }

    return results.join('\n');
}

function handleBase64(args: string[]): string {
    if (args.length === 0) return 'usage: base64 <string> or base64 -d <encoded>';
    if (args[0] === '-d' && args[1]) {
        try { return atob(args[1]); } catch { return 'base64: invalid input'; }
    }
    try { return btoa(args.join(' ')); } catch { return 'base64: encoding error'; }
}

function handleDecode(args: string[]): string {
    if (args.length === 0) return 'usage: decode <hex|base64> <value>';
    const type = args[0];
    const value = args[1];
    if (!value) return 'usage: decode <hex|base64> <value>';

    if (type === 'hex') {
        try {
            const result = value.match(/.{1,2}/g)?.map(b => String.fromCharCode(parseInt(b, 16))).join('');
            return result || 'decode: invalid hex';
        } catch { return 'decode: invalid hex'; }
    }
    if (type === 'base64') {
        try { return atob(value); } catch { return 'decode: invalid base64'; }
    }
    return 'decode: unknown type. Use "hex" or "base64"';
}

function handleSsh(args: string[], state: LabState): string {
    if (args.length === 0) return 'usage: ssh <user>@<host>';
    const match = args[0].match(/(.+)@(\d+\.\d+\.\d+\.\d+)/);
    if (!match) return `ssh: Could not resolve hostname ${args[0]}`;

    const user = match[1];
    const ip = match[2];
    const host = state.network.find(h => h.ip === ip);

    if (!host) return `ssh: connect to host ${ip} port 22: No route to host`;
    if (!host.ports.find(p => p.service === 'ssh')) return `ssh: connect to host ${ip} port 22: Connection refused`;

    // Check credentials
    if (host.sshCredentials && host.sshCredentials[user]) {
        state.sshSessions[ip] = true;
        state.currentUser = user;
        return `The authenticity of host '${ip} (${ip})' can't be established.
ED25519 key fingerprint is SHA256:${Array.from({length: 43}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[Math.floor(Math.random() * 64)]).join('')}.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '${ip}' to the list of known hosts.
${user}@${ip}'s password: ********

Welcome to ${host.hostname}
Last login: ${new Date().toUTCString()}

[✅ SSH CONNECTION ESTABLISHED]
You are now connected to ${host.hostname} (${ip}) as ${user}.`;
    }

    return `${user}@${ip}: Permission denied (publickey,password).
Hint: You need the correct credentials. Try using hydra to brute force.`;
}

function handleSudo(args: string[], state: LabState): string {
    if (args.length === 0) return 'usage: sudo <command>';

    if (args[0] === '-l') {
        if (state.env.SUDO_ALLOWED) {
            return `User ${state.currentUser} may run the following commands:\n    (ALL) NOPASSWD: ${state.env.SUDO_ALLOWED.split(',').map(c => `/usr/bin/${c.trim()}`).join(', ')}`;
        }
        return `User ${state.currentUser} is not allowed to run sudo on this host.`;
    }

    // Check if sudo is allowed for this command
    const cmd = args[0];
    const allowed = state.env.SUDO_ALLOWED?.split(',').map(c => c.trim()) || [];

    if (allowed.includes(cmd) || allowed.includes('ALL')) {
        // Execute as root
        state.env.SUDO_ACTIVE = 'true';
        const prevUser = state.currentUser;
        state.currentUser = 'root';

        // Handle special exploits
        if (cmd === 'vim' || cmd === 'less') {
            return `[!] Running ${cmd} as root...\n\nTip: Inside ${cmd}, type :!/bin/bash to get a root shell!\n\n[🔓 PRIVILEGE ESCALATED] You now have root access!\nTry: cat /root/flag.txt`;
        }
        if (cmd === 'find') {
            return `[!] Running find as root...\n\nTip: find can execute commands! Try: sudo find / -exec /bin/bash \\;\n\n[🔓 PRIVILEGE ESCALATED] You now have root access!`;
        }
        if (cmd === 'bash' || cmd === '-i') {
            return `root@${getNodeValue(['/', 'etc', 'hostname'], state.vfs) || 'localhost'}:~# \n[🔓 ROOT SHELL OBTAINED]\nYou now have full root access. Try: cat /root/flag.txt`;
        }

        // For other commands, just run them as root
        const result = parseCommand(args.join(' '), state);
        state.currentUser = prevUser;
        return result.output;
    }

    return `[sudo] password for ${state.currentUser}: \nSorry, user ${state.currentUser} is not allowed to execute '${cmd}' as root.`;
}

// ═══════════════════════════════════════════════════════════
// 📖 HELP & MAN PAGES
// ═══════════════════════════════════════════════════════════

function handleMan(args: string[]): string {
    const cmd = args[0];
    const manPages: Record<string, string> = {
        nmap: 'NMAP(1) - Network exploration tool\n\nUsage: nmap <target-ip>\n\nOptions:\n  -sV  Service version detection\n  -sC  Script scanning\n  -p   Specify ports\n\nExample: nmap 10.0.1.50',
        curl: 'CURL(1) - Transfer data from URLs\n\nUsage: curl <url>\n\nOptions:\n  -X METHOD  HTTP method\n  -d DATA    POST data\n  -H HEADER  Custom header\n\nExample: curl http://10.0.1.50/robots.txt',
        hydra: 'HYDRA(1) - Online password cracker\n\nUsage: hydra -l <user> -P <wordlist> <service>://<target>\n\nExample: hydra -l admin -P passwords.txt ssh://10.0.3.15',
        sqlmap: 'SQLMAP(1) - Automatic SQL injection tool\n\nUsage: sqlmap -u <url> [--dbs] [--tables] [--dump]\n\nExample: sqlmap -u "http://10.0.2.20/search?q=test" --dbs',
        grep: 'GREP(1) - Pattern searcher\n\nUsage: grep [OPTIONS] <pattern> <file>\n\nOptions:\n  -i  Case insensitive\n  -r  Recursive\n\nExample: grep "Failed" /var/log/auth.log',
        find: 'FIND(1) - Search for files\n\nUsage: find <path> [-name pattern] [-perm mode] [-type f|d]\n\nExamples:\n  find / -name "*.txt"\n  find / -perm -4000 -type f  (SUID files)',
        nikto: 'NIKTO(1) - Web server scanner\n\nUsage: nikto -h <target>\n\nScans for dangerous files/CGIs, outdated software, and misconfigurations.\n\nExample: nikto -h 10.0.4.30',
        ssh: 'SSH(1) - Secure Shell\n\nUsage: ssh <user>@<host>\n\nExample: ssh admin@10.0.5.10',
        sudo: 'SUDO(8) - Execute command as another user\n\nUsage: sudo <command> or sudo -l (list permissions)\n\nExample: sudo -l',
        john: 'JOHN(1) - Password cracker\n\nUsage: john <hash-file>\n\nCracks MD5 and other hash formats.\n\nExample: john /path/to/hashes.txt',
    };
    if (!cmd) return 'usage: man <command>';
    return manPages[cmd] || `No manual entry for ${cmd}`;
}

function getHelpText(): string {
    return `
╔══════════════════════════════════════════════════════════╗
║         🛡️ CyberShield Cyber Range — Help              ║
╠══════════════════════════════════════════════════════════╣
║  📁 FILESYSTEM                                         ║
║    ls [-la]         List directory contents              ║
║    cd <dir>         Change directory                     ║
║    cat <file>       Display file contents                ║
║    pwd              Print working directory              ║
║    head [-n N] <f>  Show first N lines                   ║
║    tail [-n N] <f>  Show last N lines                    ║
║    grep <p> <f>     Search pattern in file               ║
║    find <path>      Search for files                     ║
║    wc <file>        Count lines/words/chars              ║
║                                                          ║
║  🌐 NETWORK                                             ║
║    ping <ip>        Test host connectivity                ║
║    ifconfig/ip      Show network info                    ║
║    nmap <ip>        Port scan target                      ║
║    curl <url>       HTTP request                          ║
║    ssh <u>@<ip>     Remote login                         ║
║                                                          ║
║  🔍 SCANNING                                            ║
║    nikto -h <ip>    Web vulnerability scanner            ║
║    dirb <url>       Directory brute force                 ║
║                                                          ║
║  ⚔️ EXPLOITATION                                        ║
║    hydra            Brute force credentials               ║
║    sqlmap -u <url>  SQL injection                        ║
║    msfconsole       Metasploit framework                  ║
║    john <file>      Crack password hashes                 ║
║    sudo <cmd>       Execute as root                       ║
║                                                          ║
║  🔧 UTILITIES                                           ║
║    whoami / id      Current user info                    ║
║    echo <text>      Print text                            ║
║    base64 <str>     Encode/decode base64                 ║
║    decode hex|b64   Decode encoded strings                ║
║    man <cmd>        Command manual                        ║
║    clear            Clear terminal                        ║
║                                                          ║
║  🎯 LAB                                                 ║
║    objectives       Show current mission objectives      ║
║    hint             Get a progressive hint                ║
║    help             Show this help                        ║
╚══════════════════════════════════════════════════════════╝`;
}
