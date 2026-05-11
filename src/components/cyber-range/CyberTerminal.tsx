"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseCommand, LabState, initialLabState } from '@/lib/cyber-range/tool-engines';

interface ScenarioStep {
    id: string;
    order: number;
    title: string;
    description: string;
    validation_regex: string;
    hint: string;
    completed: boolean;
}

interface CyberTerminalProps {
    labId: string;
    scenarios: ScenarioStep[];
    onStepComplete: (stepId: string) => void;
    initialState?: LabState;
    onRequestHint?: () => void;
}

export default function CyberTerminal({ labId: _labId, scenarios, onStepComplete, initialState, onRequestHint }: CyberTerminalProps) {
    const [state, setState] = useState<LabState>(initialState || initialLabState);
    const [history, setHistory] = useState<{ type: 'input' | 'output' | 'system'; content: string }[]>([
        { type: 'system', content: '🛡️ CyberShield OS v3.0 — Cyber Range Environment\nType "help" for commands, "objectives" for mission, "hint" for help.\n' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [cmdHistoryIndex, setCmdHistoryIndex] = useState(-1);
    const [showObjectives, setShowObjectives] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Reset state when initialState changes (lab switch)
    useEffect(() => {
        if (initialState) {
            setState(initialState);
            setHistory([{ type: 'system', content: '🛡️ CyberShield OS v3.0 — Cyber Range Environment\nType "help" for commands, "objectives" for mission, "hint" for help.\n' }]);
            setCmdHistory([]);
            setElapsedTime(0);
        }
    }, [initialState]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const completedCount = scenarios.filter(s => s.completed).length;

    const handleCommand = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const cmd = inputValue.trim();
        if (!cmd) return;

        // Add to command history
        setCmdHistory(prev => [cmd, ...prev.slice(0, 49)]);
        setCmdHistoryIndex(-1);

        // Special commands handled by terminal
        if (cmd === '__OBJECTIVES__' || cmd === 'objectives') {
            setShowObjectives(prev => !prev);
            setInputValue('');
            return;
        }

        const newHistory = [...history, { type: 'input' as const, content: cmd }];

        // Parse command
        const { output, newState } = parseCommand(cmd, state);

        if (output === '__CLEAR__') {
            setHistory([]);
            setInputValue('');
            return;
        }

        if (output === '__HINT__') {
            // Find first incomplete objective and show its hint
            const nextStep = scenarios.find(s => !s.completed);
            if (nextStep?.hint) {
                newHistory.push({ type: 'system' as const, content: `💡 تلميح للمهمة ${nextStep.order}:\n${nextStep.hint}` });
            } else if (onRequestHint) {
                onRequestHint();
                newHistory.push({ type: 'system' as const, content: '🧠 تم فتح المساعد الذكي. اسأله عن أي شيء!' });
            } else {
                newHistory.push({ type: 'system' as const, content: '✅ جميع المهام مكتملة! أحسنت!' });
            }
            setHistory(newHistory);
            setInputValue('');
            return;
        }

        if (output === '__OBJECTIVES__') {
            setShowObjectives(prev => !prev);
            setInputValue('');
            return;
        }

        newHistory.push({ type: 'output' as const, content: output });
        setHistory(newHistory);
        setState(newState);
        setInputValue('');

        // Check for scenario completion
        scenarios.forEach(step => {
            if (!step.completed && step.validation_regex) {
                try {
                    const regex = new RegExp(step.validation_regex, 'i');
                    if (regex.test(cmd)) {
                        onStepComplete(step.id);
                        setHistory(prev => [...prev, {
                            type: 'system' as const,
                            content: `\n🎉 ━━━ OBJECTIVE COMPLETED ━━━\n   ✅ ${step.title}\n   📊 المهمة ${step.order} من ${scenarios.length}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
                        }]);
                    }
                } catch { /* skip */ }
            }
        });
    }, [inputValue, state, history, scenarios, onStepComplete, onRequestHint]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length > 0) {
                const newIndex = Math.min(cmdHistoryIndex + 1, cmdHistory.length - 1);
                setCmdHistoryIndex(newIndex);
                setInputValue(cmdHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (cmdHistoryIndex > 0) {
                const newIndex = cmdHistoryIndex - 1;
                setCmdHistoryIndex(newIndex);
                setInputValue(cmdHistory[newIndex]);
            } else {
                setCmdHistoryIndex(-1);
                setInputValue('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Simple tab completion
            const cmds = ['ls', 'cd', 'cat', 'pwd', 'whoami', 'nmap', 'curl', 'grep', 'find', 'hydra', 'sqlmap', 'nikto', 'dirb', 'ssh', 'sudo', 'john', 'base64', 'decode', 'head', 'tail', 'wc', 'ping', 'ifconfig', 'help', 'hint', 'objectives', 'man', 'clear'];
            const partial = inputValue.toLowerCase();
            const matches = cmds.filter(c => c.startsWith(partial));
            if (matches.length === 1) {
                setInputValue(matches[0] + ' ');
            } else if (matches.length > 1) {
                setHistory(prev => [...prev, { type: 'system', content: matches.join('  ') }]);
            }
        }
    };

    const prompt = `${state.currentUser}@cybershield:${state.cwd.length <= 1 ? '/' : '~/' + state.cwd.slice(2).join('/')}$`;

    return (
        <div
            className="flex-1 flex flex-col bg-cyber-950 font-mono text-sm overflow-hidden relative"
            onClick={() => inputRef.current?.focus()}
        >
            {/* ─── Top Bar ─── */}
            <div className="bg-cyber-900 border-b border-cyber-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 opacity-80"></div>
                    </div>
                    <span className="text-cyber-500 text-xs">cybershield://terminal</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    {/* Objectives Counter */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowObjectives(!showObjectives); }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyber-800 border border-cyber-700 hover:border-amber-600/40 transition-colors cursor-pointer"
                    >
                        <span className="text-amber-600">🎯</span>
                        <span className="text-cyber-300">{completedCount}/{scenarios.length}</span>
                    </button>
                    {/* Timer */}
                    <div className="flex items-center gap-1.5 text-cyber-500">
                        <span>⏱️</span>
                        <span className="font-mono">{formatTime(elapsedTime)}</span>
                    </div>
                    {/* User */}
                    <div className="text-green-500 font-bold">{state.currentUser}@lab</div>
                </div>
            </div>

            {/* ─── Objectives Overlay ─── */}
            {showObjectives && (
                <div className="absolute top-10 right-4 w-80 bg-cyber-900 border border-amber-600/30 rounded-xl p-4 z-10 shadow-[0_0_30px_rgba(200,150,46,0.15)]">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-amber-600 font-bold text-sm">🎯 أهداف المهمة</h3>
                        <button onClick={() => setShowObjectives(false)} className="text-cyber-500 hover:text-cyber-950 text-xs">✕</button>
                    </div>
                    <div className="space-y-2">
                        {scenarios.map(step => (
                            <div key={step.id} className={`p-2 rounded-lg text-xs ${step.completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-cyber-800 border border-cyber-700'}`}>
                                <div className="flex items-center gap-2">
                                    <span>{step.completed ? '✅' : '⬜'}</span>
                                    <span className={step.completed ? 'text-green-500 line-through' : 'text-cyber-100'}>
                                        {step.order}. {step.title}
                                    </span>
                                </div>
                                {!step.completed && (
                                    <p className="text-cyber-500 mt-1 mr-5 leading-relaxed">{step.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Terminal Output ─── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
                {history.map((entry, i) => (
                    <div key={i} className="leading-relaxed">
                        {entry.type === 'input' ? (
                            <div className="flex gap-2">
                                <span className="text-green-500 font-bold flex-shrink-0">{prompt}</span>
                                <span className="text-cyber-100">{entry.content}</span>
                            </div>
                        ) : entry.type === 'system' ? (
                            <pre className="text-amber-500/90 whitespace-pre-wrap font-mono text-xs py-1">{entry.content}</pre>
                        ) : (
                            <pre className="text-cyber-300 whitespace-pre-wrap font-mono">{entry.content}</pre>
                        )}
                    </div>
                ))}
                <div ref={terminalEndRef} />
            </div>

            {/* ─── Input Line ─── */}
            <form onSubmit={handleCommand} className="p-3 bg-cyber-900/50 flex items-center gap-2 border-t border-cyber-700 flex-shrink-0">
                <span className="text-green-500 font-bold flex-shrink-0 text-xs">{prompt}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-cyber-100 font-mono text-sm"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="Type a command..."
                />
            </form>
        </div>
    );
}
