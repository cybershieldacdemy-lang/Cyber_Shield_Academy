"use client";
import { useEffect, useRef, useState } from "react";

// Simulated attack data
const attackTypes = ["DDoS", "Malware", "Phishing", "SQL Injection", "Brute Force", "Ransomware", "XSS", "Zero-Day"];
const countries: { name: string; x: number; y: number }[] = [
    { name: "السعودية", x: 58, y: 42 },
    { name: "مصر", x: 50, y: 40 },
    { name: "الإمارات", x: 60, y: 44 },
    { name: "الصين", x: 75, y: 35 },
    { name: "روسيا", x: 62, y: 22 },
    { name: "أمريكا", x: 22, y: 32 },
    { name: "ألمانيا", x: 47, y: 25 },
    { name: "البرازيل", x: 32, y: 55 },
    { name: "الهند", x: 68, y: 40 },
    { name: "اليابان", x: 82, y: 32 },
    { name: "بريطانيا", x: 44, y: 23 },
    { name: "كوريا", x: 80, y: 33 },
];

interface Attack {
    id: number;
    fromIdx: number;
    toIdx: number;
    type: string;
    progress: number;
}

export default function ThreatMapPreview() {
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const [totalAttacks, setTotalAttacks] = useState(14832);
    const idRef = useRef(0);

    useEffect(() => {
        const generateAttack = () => {
            const fromIdx = Math.floor(Math.random() * countries.length);
            let toIdx = Math.floor(Math.random() * countries.length);
            while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * countries.length);

            const newAttack: Attack = {
                id: ++idRef.current,
                fromIdx,
                toIdx,
                type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
                progress: 100, // Full line rendered, CSS handles animation
            };
            setAttacks((prev) => [...prev.slice(-5), newAttack]);
            setTotalAttacks((prev) => prev + 1);
        };

        const timer = setInterval(generateAttack, 3000);
        generateAttack();
        return () => clearInterval(timer);
    }, []);

    // Auto-cleanup old attacks (every 4s instead of 80ms state polling)
    useEffect(() => {
        const cleanup = setInterval(() => {
            setAttacks((prev) => prev.slice(-5));
        }, 4000);
        return () => clearInterval(cleanup);
    }, []);

    return (
        <div className="glass-card overflow-hidden relative h-full" style={{ minHeight: 280 }}>
            <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="text-lg font-bold" style={{ color: "#1a1612" }}>
                    🌍 خريطة الهجمات الحية
                </h3>
                <a href="/threat-map" className="text-xs font-semibold hover:underline" style={{ color: "#c8962e" }}>
                    عرض الخريطة ←
                </a>
            </div>

            {/* Map area */}
            <div className="relative mx-4 mb-2 rounded-xl overflow-hidden" style={{ height: 200, background: "linear-gradient(180deg, #f5efe3, #ece4d4)" }}>
                {/* Grid dots */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: "radial-gradient(rgba(200, 150, 46, 0.2) 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                }} />

                {/* Country dots */}
                {countries.map((c, i) => (
                    <div key={i} className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%`, transform: "translate(-50%, -50%)" }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: "#c8962e", opacity: 0.6 }} />
                    </div>
                ))}

                {/* Attack lines — CSS animated */}
                <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
                    <defs>
                        <style>{`
                            @keyframes attack-dash { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
                            .attack-line { animation: attack-dash 2s linear forwards; stroke-dasharray: 200; }
                        `}</style>
                    </defs>
                    {attacks.map((atk) => {
                        const from = countries[atk.fromIdx];
                        const to = countries[atk.toIdx];
                        return (
                            <g key={atk.id}>
                                <line
                                    x1={`${from.x}%`} y1={`${from.y}%`}
                                    x2={`${to.x}%`} y2={`${to.y}%`}
                                    stroke="#e53e3e"
                                    strokeWidth="1.5"
                                    opacity={0.5}
                                    className="attack-line"
                                />
                                <circle cx={`${to.x}%`} cy={`${to.y}%`} r="3" fill="#e53e3e" opacity={0.8}>
                                    <animate attributeName="r" values="2;5;2" dur="1s" repeatCount="indefinite" />
                                </circle>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e53e3e" }} />
                    <span className="text-[11px] font-semibold" style={{ color: "#e53e3e" }}>مباشر</span>
                </div>
                <div className="text-[11px] font-bold" style={{ color: "#5c5549" }}>
                    إجمالي الهجمات: <span style={{ color: "#e53e3e" }}>{totalAttacks.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
