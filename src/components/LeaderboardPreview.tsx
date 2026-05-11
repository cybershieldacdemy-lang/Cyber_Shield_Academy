"use client";

const topUsers = [
    { rank: 1, name: "أحمد الخبير", xp: 12500, level: "Cyber Legend", badge: "🏆", color: "#c8962e" },
    { rank: 2, name: "سارة المحللة", xp: 11200, level: "Elite Hacker", badge: "🥈", color: "#a89f8e" },
    { rank: 3, name: "محمد الباحث", xp: 9800, level: "Elite Hacker", badge: "🥉", color: "#b87333" },
    { rank: 4, name: "نورة الحافظة", xp: 8400, level: "Pro Hacker", badge: "⭐", color: "#5c5549" },
    { rank: 5, name: "خالد المدافع", xp: 7100, level: "Pro Hacker", badge: "⭐", color: "#5c5549" },
];

export default function LeaderboardPreview() {
    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: "#1a1612" }}>🏆 المتصدرون</h3>
                <a href="/leaderboard" className="text-xs font-semibold hover:underline" style={{ color: "#c8962e" }}>
                    عرض الكل ←
                </a>
            </div>
            <div className="space-y-3">
                {topUsers.map((u) => (
                    <div
                        key={u.rank}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                        style={{
                            background: u.rank <= 3 ? `rgba(200, 150, 46, ${0.06 - u.rank * 0.015})` : "transparent",
                            border: u.rank <= 3 ? "1px solid rgba(200, 150, 46, 0.1)" : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200, 150, 46, 0.06)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = u.rank <= 3 ? `rgba(200, 150, 46, ${0.06 - u.rank * 0.015})` : "transparent"; }}
                    >
                        <span className="text-lg w-8 text-center">{u.badge}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{
                            background: `linear-gradient(135deg, ${u.color}, ${u.color}99)`,
                        }}>
                            {u.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: "#3d3730" }}>{u.name}</div>
                            <div className="text-[10px]" style={{ color: "#a89f8e" }}>{u.level}</div>
                        </div>
                        <div className="text-sm font-black" style={{ color: "#c8962e" }}>{u.xp.toLocaleString()} XP</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
