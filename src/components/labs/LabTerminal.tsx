'use client';

import React, { useEffect, useRef, useState } from 'react';
import '@xterm/xterm/css/xterm.css';

interface LabTerminalProps {
    ipAddress?: string;
}

export default function LabTerminal({ ipAddress = '10.10.x.x' }: LabTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [term, setTerm] = useState<any>(null);
    const [fitAddon, setFitAddon] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && terminalRef.current && !term) {
            const initTerminal = async () => {
                const { Terminal } = await import('@xterm/xterm');
                const { FitAddon } = await import('@xterm/addon-fit');

                const newTerm = new Terminal({
                    cursorBlink: true,
                    theme: {
                        background: '#06080a',
                        foreground: '#00ff00',
                        cursor: '#00ff00'
                    },
                    fontFamily: 'monospace',
                    fontSize: 14,
                });

                const newFitAddon = new FitAddon();
                newTerm.loadAddon(newFitAddon);
                
                newTerm.open(terminalRef.current!);
                newFitAddon.fit();

                newTerm.writeln('\x1b[1;32mWelcome to CyberShield Web Terminal\x1b[0m');
                newTerm.writeln(`\x1b[1;34mConnected to target: ${ipAddress}\x1b[0m`);
                newTerm.writeln('Type \x1b[1;33mhelp\x1b[0m to see available commands.\n');
                
                newTerm.write('\x1b[1;36mroot@cybershield\x1b[0m:\x1b[1;34m~\x1b[0m# ');

                let input = '';
                newTerm.onKey(({ key, domEvent }) => {
                    const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

                    if (domEvent.keyCode === 13) {
                        // Enter
                        newTerm.write('\r\n');
                        handleCommand(input, newTerm);
                        input = '';
                        newTerm.write('\x1b[1;36mroot@cybershield\x1b[0m:\x1b[1;34m~\x1b[0m# ');
                    } else if (domEvent.keyCode === 8) {
                        // Backspace
                        if (input.length > 0) {
                            input = input.substring(0, input.length - 1);
                            newTerm.write('\b \b');
                        }
                    } else if (printable) {
                        input += key;
                        newTerm.write(key);
                    }
                });

                setTerm(newTerm);
                setFitAddon(newFitAddon);

                const resizeObserver = new ResizeObserver(() => {
                    newFitAddon.fit();
                });
                resizeObserver.observe(terminalRef.current!);

                return () => resizeObserver.disconnect();
            };

            initTerminal();
        }

        return () => {
            if (term) {
                term.dispose();
            }
        };
    }, []);

    const handleCommand = (cmd: string, terminal: any) => {
        const command = cmd.trim().toLowerCase();
        if (command === '') return;
        
        switch (command) {
            case 'help':
                terminal.writeln('Available commands:');
                terminal.writeln('  \x1b[1;33mls\x1b[0m      List files');
                terminal.writeln('  \x1b[1;33mcat\x1b[0m     Read file content');
                terminal.writeln('  \x1b[1;33mping\x1b[0m    Ping a host');
                terminal.writeln('  \x1b[1;33mclear\x1b[0m   Clear terminal screen');
                terminal.writeln('  \x1b[1;33mnmap\x1b[0m    Scan ports (Simulated)');
                break;
            case 'ls':
                terminal.writeln('flag.txt  notes.md  secret_script.sh');
                break;
            case 'cat flag.txt':
                terminal.writeln('nice try, but you have to exploit the service running on port 80 first!');
                break;
            case 'clear':
                terminal.clear();
                break;
            case `nmap ${ipAddress}`:
                terminal.writeln(`Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toISOString()}`);
                terminal.writeln(`Nmap scan report for ${ipAddress}`);
                terminal.writeln('Host is up (0.0020s latency).');
                terminal.writeln('Not shown: 998 closed tcp ports (reset)');
                terminal.writeln('PORT   STATE SERVICE');
                terminal.writeln('22/tcp open  ssh');
                terminal.writeln('80/tcp open  http');
                terminal.writeln('\r\nNmap done: 1 IP address (1 host up) scanned in 0.23 seconds');
                break;
            default:
                if (command.startsWith('ping')) {
                    terminal.writeln(`PING ${command.split(' ')[1] || '8.8.8.8'} (8.8.8.8): 56 data bytes`);
                    terminal.writeln('64 bytes from 8.8.8.8: icmp_seq=0 ttl=118 time=14.300 ms');
                    terminal.writeln('64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=15.100 ms');
                } else {
                    terminal.writeln(`bash: ${command}: command not found`);
                }
                break;
        }
    };

    return (
        <div className="w-full h-full bg-[#06080a] border border-cyber-800/50 rounded-xl overflow-hidden relative shadow-[0_0_20px_rgba(0,255,0,0.05)]">
            <div className="h-8 bg-cyber-900/80 border-b border-cyber-800/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="text-xs text-cyber-500 ml-2 font-mono">Terminal - {ipAddress}</span>
            </div>
            <div className="p-4 h-[calc(100%-2rem)]">
                <div ref={terminalRef} className="w-full h-full" />
            </div>
        </div>
    );
}
