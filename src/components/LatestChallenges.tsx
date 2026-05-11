"use client";
import Link from "next/link";

const latestChallenges = [
    {
        id: 1,
        title: "SQL Injection Master",
        category: "Web",
        difficulty: "متوسط",
        points: 250,
        solves: 128,
        diffColor: "#2da5c7",
        icon: "🌐",
    },
    {
        id: 2,
        title: "Hidden Message",
        category: "Steganography",
        difficulty: "سهل",
        points: 100,
        solves: 342,
        diffColor: "#38b2ac",
        icon: "🖼️",
    },
    {
        id: 3,
        title: "Binary Bomb",
        category: "Reverse",
        difficulty: "صعب",
        points: 500,
        solves: 34,
        diffColor: "#e53e3e",
        icon: "💣",
    },
    {
        id: 4,
        title: "Network Forensics v2",
        category: "Forensics",
        difficulty: "صعب",
        points: 400,
        solves: 56,
        diffColor: "#e53e3e",
        icon: "🔍",
    },
];

export default function LatestChallenges() {
    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: "#1a1612" }}>🚩 أحدث التحديات</h3>
                <Link href="/ctf" className="text-xs font-semibold hover:underline" style={{ color: "#c8962e" }}>
                    جميع التحديات ←
                </Link>
            </div>
            <div className="space-y-3">
                {latestChallenges.map((c) => (
                    <Link
                        key={c.id}
                        href="/ctf"
                        className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                        style={{ border: "1px solid rgba(200, 150, 46, 0.06)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200, 150, 46, 0.04)"; e.currentTarget.style.borderColor = "rgba(200, 150, 46, 0.15)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(200, 150, 46, 0.06)"; }}
                    >
                        <span className="text-xl">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: "#3d3730" }} dir="ltr">{c.title}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${c.diffColor}15`, color: c.diffColor, fontWeight: 600 }}>
                                    {c.difficulty}
                                </span>
                                <span className="text-[10px]" style={{ color: "#a89f8e" }}>{c.category}</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-black" style={{ color: "#c8962e" }}>{c.points} pts</div>
                            <div className="text-[10px]" style={{ color: "#a89f8e" }}>{c.solves} حل</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
