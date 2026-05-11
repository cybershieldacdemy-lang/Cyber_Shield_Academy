"use client";
import { useEffect, useState, useRef } from "react";

interface Stats {
    totalUsers: number;
    totalCourses: number;
    totalTerms: number;
    totalLabs: number;
    totalPaths: number;
    totalChallenges: number;
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        if (target === 0) return;
        const duration = 1200;
        let start: number | null = null;

        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out curve for natural feel
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };

        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target]);

    return <span>{count.toLocaleString("ar-SA")}{suffix}</span>;
}

export default function PlatformStats() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch("/api/stats")
            .then((r) => r.json())
            .then(setStats)
            .catch(() => null);
    }, []);

    const items = [
        { icon: "👥", label: "متعلم نشط", value: stats?.totalUsers || 0, suffix: "+", color: "#c8962e" },
        { icon: "🔬", label: "مختبر عملي", value: stats?.totalLabs || 47, suffix: "", color: "#2da5c7" },
        { icon: "🗺️", label: "مسار تعلم", value: stats?.totalPaths || 14, suffix: "", color: "#805ad5" },
        { icon: "🚩", label: "تحدي أمني", value: stats?.totalChallenges || 86, suffix: "+", color: "#e53e3e" },
        { icon: "🎓", label: "دورة تدريبية", value: stats?.totalCourses || 0, suffix: "", color: "#38b2ac" },
        { icon: "📖", label: "مصطلح", value: stats?.totalTerms || 1300, suffix: "+", color: "#d69e2e" },
    ];

    return (
        <section className="relative overflow-hidden" style={{ background: "rgba(200, 150, 46, 0.03)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="glow-dot" />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#a89f8e" }}>
                        إحصائيات المنصة — بيانات حية
                    </span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="text-center p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 group cursor-default"
                            style={{
                                background: "rgba(255,255,255,0.6)",
                                border: "1px solid rgba(200,150,46,0.08)",
                            }}
                        >
                            <div className="text-2xl mb-1 transition-transform group-hover:scale-110">{item.icon}</div>
                            <div className="text-xl md:text-2xl font-black" style={{ color: item.color }}>
                                <AnimatedCounter target={item.value} suffix={item.suffix} />
                            </div>
                            <div className="text-[11px] font-medium mt-1" style={{ color: "#7a7164" }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
