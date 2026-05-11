"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { pathsDetailData, fallbackPathDetail, type PathDetail } from "@/data/paths-detail-data";

/* ═══════ localStorage Progress Helpers ═══════ */
type ProgressMap = Record<string, Record<string, number>>;

function loadProgress(pathId: string): ProgressMap {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(`path-progress-${pathId}`) || "{}"); } catch { return {}; }
}
function saveProgress(pathId: string, p: ProgressMap) {
    localStorage.setItem(`path-progress-${pathId}`, JSON.stringify(p));
}
function getTopicProg(progress: ProgressMap, mIdx: number, tIdx: number): number {
    return progress[`m${mIdx}`]?.[`t${tIdx}`] || 0;
}
function calcPathCompletion(path: PathDetail, progress: ProgressMap): number {
    let total = 0, done = 0;
    path.modules.forEach((m, mi) => { m.topics.forEach((_, ti) => { total++; if (getTopicProg(progress, mi, ti) === 100) done++; }); });
    return total === 0 ? 0 : Math.round((done / total) * 100);
}
function isModuleComplete(path: PathDetail, mIdx: number, progress: ProgressMap): boolean {
    return path.modules[mIdx]?.topics.every((_, ti) => getTopicProg(progress, mIdx, ti) === 100) || false;
}

/* ═══════ Main Component ═══════ */
export default function PathDetailPage() {
    const params = useParams();
    const pathId = params.id as string;
    const path = pathsDetailData[pathId] || { ...fallbackPathDetail, title: pathId };

    const [viewMode, setViewMode] = useState<"visual" | "classic">("visual");
    const [studyHours, setStudyHours] = useState(4);
    const [_expandedModule, _setExpandedModule] = useState<number | null>(0);
    const [progress, setProgress] = useState<ProgressMap>({});
    const [scheduleSet, setScheduleSet] = useState(false);

    useEffect(() => {
        setProgress(loadProgress(pathId));
        const sh = localStorage.getItem(`study-hours-${pathId}`);
        if (sh) setStudyHours(parseInt(sh));
        setScheduleSet(!!localStorage.getItem(`schedule-set-${pathId}`));
    }, [pathId]);

    const cycleProgress = useCallback((mIdx: number, tIdx: number) => {
        setProgress(prev => {
            const next = { ...prev };
            if (!next[`m${mIdx}`]) next[`m${mIdx}`] = {};
            const cur = next[`m${mIdx}`][`t${tIdx}`] || 0;
            next[`m${mIdx}`][`t${tIdx}`] = cur >= 100 ? 0 : cur + 25;
            saveProgress(pathId, next);
            return { ...next };
        });
    }, [pathId]);

    const adjustHours = (delta: number) => {
        const h = Math.max(1, Math.min(20, studyHours + delta));
        setStudyHours(h);
        localStorage.setItem(`study-hours-${pathId}`, String(h));
    };

    const setSchedule = () => {
        localStorage.setItem(`schedule-set-${pathId}`, "1");
        setScheduleSet(true);
    };

    const totalLessons = path.modules.reduce((s, m) => s + m.lessons, 0);
    const pathCompletion = calcPathCompletion(path, progress);
    const weeksToComplete = Math.ceil(path.hours / studyHours);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + weeksToComplete * 7);
    const dateStr = completionDate.toLocaleDateString("ar-EG", { day: "numeric", month: "long" });

    // Achievements
    const completedAchievements = path.achievements.filter(a => {
        if (a.moduleIndex === -1) return pathCompletion === 100;
        return isModuleComplete(path, a.moduleIndex, progress);
    }).length;
    const nextAchievement = path.achievements.find(a => {
        if (a.moduleIndex === -1) return pathCompletion < 100;
        return !isModuleComplete(path, a.moduleIndex, progress);
    }) || path.achievements[0];

    return (
        <div style={{ paddingTop: "80px" }}>
            {/* ═══ Hero (preserved) ═══ */}
            <section className="relative overflow-hidden" style={{ background: path.gradient }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
                    <Link href="/paths" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:underline" style={{ color: "rgba(255,255,255,0.7)" }}>→ العودة للمسارات</Link>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl">{path.icon}</span>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white">{path.title}</h1>
                            <p className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.6)" }} dir="ltr">{path.titleEn}</p>
                        </div>
                    </div>
                    <p className="text-base leading-relaxed max-w-2xl mb-6" style={{ color: "rgba(255,255,255,0.85)" }}>{path.desc}</p>
                    <div className="flex flex-wrap gap-4">
                        <span className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>{path.difficulty}</span>
                        <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>📚 {totalLessons} درس</span>
                        <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>⏱️ {path.hours} ساعة</span>
                        <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>📦 {path.modules.length} وحدات</span>
                    </div>
                </div>
            </section>

            {/* ═══ Toggle Bar ═══ */}
            <div style={{ background: "#faf6ee", borderBottom: "1px solid rgba(200,150,46,0.1)" }} className="sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium" style={{ color: "#5c5549" }}>
                            <span>رؤية كلاسيكية</span>
                            <div onClick={() => setViewMode(v => v === "visual" ? "classic" : "visual")}
                                style={{ width: 44, height: 24, borderRadius: 12, background: viewMode === "visual" ? "#c8962e" : "#d4cbb8", position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, transition: "right 0.3s, left 0.3s",
                                    ...(viewMode === "visual" ? { left: 2 } : { left: 22 }) }} />
                            </div>
                        </label>
                    </div>
                    <Link href="/paths" className="btn-primary text-sm px-5 py-2">استكشف المزيد ▶</Link>
                </div>
            </div>

            {/* ═══ Main Layout: Sidebar + Content ═══ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <style>{`
                    .path-grid { display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }
                    @media (max-width: 1024px) { .path-grid { grid-template-columns: 1fr; } .path-sidebar { position: static !important; order: -1; } }
                    .iso-platform { position: relative; width: 88px; height: 88px; display: flex; align-items: center; justify-content: center; }
                    .iso-platform .iso-base { position: absolute; width: 72px; height: 72px; border-radius: 16px; transform: rotate(45deg); bottom: 0; z-index: 0; transition: all 0.3s; }
                    .iso-platform .iso-icon { position: relative; z-index: 1; font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
                    .iso-platform .iso-shadow { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 56px; height: 10px; border-radius: 50%; background: rgba(0,0,0,0.08); filter: blur(3px); }
                    .binary-col { position: absolute; font-family: 'Courier New', monospace; font-size: 9px; line-height: 1.3; color: rgba(200,150,46,0.12); letter-spacing: 1px; pointer-events: none; user-select: none; white-space: pre; writing-mode: vertical-lr; }
                    .module-hdr-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
                    .rec-card { border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; }
                    .rec-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }
                `}</style>
                <div className="path-grid">

                    {/* ─── RIGHT: Main Content ─── */}
                    <div>
                        {viewMode === "visual" ? (
                            /* ═══ Visual Zigzag Roadmap ═══ */
                            <div>
                                {path.modules.map((mod, mIdx) => (
                                    <div key={mIdx}>
                                        {/* Module Header */}
                                        <div style={{ background: "linear-gradient(135deg, #172033, #1e293b)", borderRadius: 14, padding: "20px 24px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>الوحدة {mIdx + 1}</div>
                                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{mod.title}</h3>
                                            </div>
                                            <div className="module-hdr-icon">{mod.icon}</div>
                                        </div>
                                        {/* Zigzag Topics */}
                                        <div style={{ position: "relative", padding: "16px 0", marginBottom: 40 }}>
                                            {/* Binary code decoration columns */}
                                            <div className="binary-col" style={{ top: 0, right: "15%", height: "100%", opacity: 0.7 }}>{'01001010\n10110010\n00101101\n11010010\n01101001\n10010110\n01101011\n10010101\n00110110\n11001010\n01010110\n10101001'.split('\n').join('\n')}</div>
                                            <div className="binary-col" style={{ top: 0, left: "15%", height: "100%", opacity: 0.5 }}>{'10100101\n01011010\n11001011\n00110100\n10101010\n01010101\n11001100\n00110011\n10011001\n01100110'.split('\n').join('\n')}</div>
                                            {mod.topics.map((topic, tIdx) => {
                                                const isRight = tIdx % 2 === 0;
                                                const tp = getTopicProg(progress, mIdx, tIdx);
                                                const _baseColor = topic.isMystery ? "#8b7340" : tp === 100 ? "#2c7a7b" : "#d4cbb8";
                                                return (
                                                    <div key={tIdx}>
                                                        {/* Connector */}
                                                        {tIdx > 0 && (
                                                            <div style={{ height: 56, position: "relative", margin: "0 10%" }}>
                                                                <svg viewBox="0 0 100 56" preserveAspectRatio="none" style={{ width: "100%", height: 56 }}>
                                                                    <path d={`M ${tIdx % 2 === 0 ? 25 : 75} 0 C ${tIdx % 2 === 0 ? 25 : 75} 28, ${tIdx % 2 === 0 ? 75 : 25} 28, ${tIdx % 2 === 0 ? 75 : 25} 56`} stroke="#c8bea8" strokeWidth="1.5" fill="none" strokeDasharray="6,4" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        {/* Topic Node */}
                                                        <div style={{ display: "flex", justifyContent: isRight ? "flex-end" : "flex-start", padding: "0 6%" }}>
                                                            <div onClick={() => cycleProgress(mIdx, tIdx)}
                                                                style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", flexDirection: isRight ? "row" : "row-reverse", transition: "transform 0.2s" }}
                                                                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                                                                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                                                                {/* 3D Isometric Platform */}
                                                                <div className="iso-platform">
                                                                    <div className="iso-base" style={{
                                                                        background: topic.isMystery ? "linear-gradient(135deg, #8b7340, #c8962e)" : tp === 100 ? "rgba(56,178,172,0.12)" : "rgba(200,150,46,0.06)",
                                                                        border: `2px solid ${tp === 100 ? "rgba(56,178,172,0.4)" : topic.isMystery ? "rgba(200,150,46,0.4)" : "rgba(200,150,46,0.12)"}`,
                                                                        boxShadow: `0 6px 20px ${topic.isMystery ? "rgba(200,150,46,0.2)" : tp === 100 ? "rgba(56,178,172,0.15)" : "rgba(0,0,0,0.06)"}`,
                                                                    }} />
                                                                    <div className="iso-shadow" />
                                                                    <span className="iso-icon">{topic.icon}</span>
                                                                    {tp > 0 && tp < 100 && (
                                                                        <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#2c7a7b,#38b2ac)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 10, whiteSpace: "nowrap", zIndex: 2 }}>
                                                                            {tp}%
                                                                        </div>
                                                                    )}
                                                                    {tp === 100 && (
                                                                        <div style={{ position: "absolute", top: 2, right: 2, width: 22, height: 22, borderRadius: "50%", background: "#38b2ac", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", border: "2px solid #fff", zIndex: 2 }}>✓</div>
                                                                    )}
                                                                </div>
                                                                {/* Label */}
                                                                <div style={{ textAlign: isRight ? "right" : "left" }}>
                                                                    <div style={{ fontSize: 14, fontWeight: 600, color: tp === 100 ? "#2c7a7b" : topic.isMystery ? "#8b7340" : "#3d3730" }}>
                                                                        {topic.title}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* ═══ Classic View (Section-Based) ═══ */
                            <div className="space-y-8">
                                {/* مقدمة - Introduction */}
                                <div style={{ background: "#fff", borderRadius: 14, padding: "28px 28px 24px", border: "1px solid rgba(200,150,46,0.08)" }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1612", marginBottom: 12 }}>مقدمة</h3>
                                    <p style={{ fontSize: 14, color: "#5c5549", lineHeight: 1.8, marginBottom: 16 }}>
                                        يهدف هذا المسار المصمم للمبتدئين إلى تقديم مقدمة شاملة لمختلف مجالات {path.title}. ويغطي هذا المسار المفاهيم والتطبيقات الأساسية في المجالات التالية:
                                    </p>
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                        {path.objectives.map((obj, i) => (
                                            <li key={i} style={{ fontSize: 13, color: "#2b6cb0", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ color: "#c8962e", fontSize: 8 }}>●</span>
                                                {obj}
                                            </li>
                                        ))}
                                        {path.skills.map((s, i) => (
                                            <li key={`s-${i}`} style={{ fontSize: 13, color: "#2b6cb0", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ color: "#c8962e", fontSize: 8 }}>●</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Section-based Topic List */}
                                {path.modules.map((mod, mIdx) => (
                                    <div key={mIdx}>
                                        {/* Section Header */}
                                        <div style={{ marginBottom: 4, paddingBottom: 12, borderBottom: "2px solid #1e293b" }}>
                                            <div style={{ fontSize: 12, color: "#7a7164", marginBottom: 2 }}>القسم {mIdx + 1}</div>
                                            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1a1612", margin: 0 }}>{mod.title}</h4>
                                        </div>
                                        {/* Topic Items */}
                                        <div>
                                            {mod.topics.filter(t => !t.isMystery).map((topic, tIdx) => {
                                                const realIdx = mod.topics.indexOf(topic);
                                                const tp = getTopicProg(progress, mIdx, realIdx);
                                                return (
                                                    <div key={tIdx} onClick={() => cycleProgress(mIdx, realIdx)}
                                                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 8px", borderBottom: "1px solid #e8e4dc", cursor: "pointer", transition: "background 0.2s" }}
                                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,150,46,0.02)")}
                                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                                        {/* Square thumbnail icon */}
                                                        <div style={{
                                                            width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                                                            background: tp === 100 ? "rgba(56,178,172,0.08)" : "#f0ece4",
                                                            border: `1px solid ${tp === 100 ? "rgba(56,178,172,0.2)" : "#e0dbd1"}`,
                                                        }}>
                                                            {topic.icon}
                                                        </div>
                                                        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: tp === 100 ? "#2c7a7b" : "#2b6cb0", textDecoration: tp === 100 ? "none" : "none" }}>
                                                            {topic.title}
                                                        </span>
                                                        {tp > 0 && (
                                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 8, background: tp === 100 ? "rgba(56,178,172,0.1)" : "rgba(200,150,46,0.08)", color: tp === 100 ? "#2c7a7b" : "#c8962e" }}>
                                                                {tp}%
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {/* ملخص الموضوع - Topic Summary */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 8px", borderBottom: "1px solid #e8e4dc" }}>
                                                <div style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, background: "#f5f2ec", border: "1px solid #e0dbd1" }}>
                                                    ✏️
                                                </div>
                                                <span style={{ fontSize: 14, fontWeight: 500, color: "#a89f8e" }}>ملخص الموضوع</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── LEFT: Sidebar ─── */}
                    <div className="space-y-5 path-sidebar" style={{ position: "sticky", top: 120 }}>
                        {/* Learning Schedule */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, color: "#1a1612" }}>
                                <span>📅</span> جدول التعلم
                            </h4>
                            <p style={{ fontSize: 13, color: "#5c5549", marginBottom: 16 }}>أخبرنا كم ساعة يمكنك الدراسة أسبوعياً</p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
                                <button onClick={() => adjustHours(-1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #d4cbb8", background: "transparent", cursor: "pointer", fontSize: 18, color: "#5c5549", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                <div style={{ width: 40, height: 40, borderRadius: 8, border: "2px solid #1a1612", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#1a1612" }}>{studyHours}</div>
                                <span style={{ fontSize: 14, color: "#5c5549" }}>ساعات</span>
                                <button onClick={() => adjustHours(1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #d4cbb8", background: "transparent", cursor: "pointer", fontSize: 18, color: "#5c5549", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                            </div>
                            <p style={{ fontSize: 13, color: "#5c5549", textAlign: "center", marginBottom: 8 }}>يكمل هذا المقرر أسبوعياً</p>
                            <div style={{ textAlign: "center", marginBottom: 16 }}>
                                <span style={{ fontSize: 12, color: "#5c5549" }}>بواسطة </span>
                                <span style={{ fontSize: 13, fontWeight: 700, background: "#1a1612", color: "#fff", padding: "4px 12px", borderRadius: 8 }}>{dateStr}</span>
                            </div>
                            <button onClick={setSchedule} disabled={scheduleSet}
                                style={{ width: "100%", padding: "10px 16px", borderRadius: 10, border: scheduleSet ? "1px solid #38b2ac" : "1px solid #d4cbb8", background: scheduleSet ? "rgba(56,178,172,0.05)" : "transparent", cursor: scheduleSet ? "default" : "pointer", fontSize: 13, fontWeight: 600, color: scheduleSet ? "#2c7a7b" : "#5c5549", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                {scheduleSet ? "✅ تم تحديد الموعد" : "حدد موعداً لبدء الدورة ✅"}
                            </button>
                        </div>

                        {/* Certificate Progress */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1a1612", margin: 0 }}>شهادة</h4>
                                <button disabled={pathCompletion < 100}
                                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: "none", background: pathCompletion === 100 ? "#38b2ac" : "#d4cbb8", color: pathCompletion === 100 ? "#fff" : "#a89f8e", cursor: pathCompletion === 100 ? "pointer" : "default", fontWeight: 600 }}>
                                    عرض الشهادة 🎓
                                </button>
                            </div>
                            <p style={{ fontSize: 12, color: "#5c5549", marginBottom: 16 }}>
                                للحصول على شهادتك، يجب عليك إكمال الدورة. تتيح لك الشهادات إثبات تحصيلك العلمي.
                            </p>
                            <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#ece4d4", marginBottom: 8, overflow: "hidden" }}>
                                <div style={{ width: `${pathCompletion}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #2da5c7, #38b2ac)", transition: "width 0.5s ease" }} />
                            </div>
                            <p style={{ fontSize: 12, color: "#a89f8e", textAlign: "center" }}>% {pathCompletion} تقدم المسار</p>
                        </div>

                        {/* Next Achievement */}
                        <div className="glass-card" style={{ padding: 24, background: "rgba(255,248,235,0.8)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1a1612", margin: 0 }}>الإنجاز التالي</h4>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#5c5549" }}>{completedAchievements}/{path.achievements.length}</span>
                            </div>
                            {nextAchievement && (
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #e53e3e, #c53030)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                                        {nextAchievement.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1612" }}>{nextAchievement.title}</div>
                                        <div style={{ fontSize: 12, color: "#7a7164" }}>{nextAchievement.desc}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Path Overview Card */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <div style={{ width: "100%", height: 160, borderRadius: 12, marginBottom: 16, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #172033, #1e293b)" }}>
                                {/* Holographic ring decoration */}
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 120, height: 120, borderRadius: "50%", border: "3px solid rgba(200,150,46,0.3)", boxShadow: "0 0 30px rgba(200,150,46,0.15), inset 0 0 30px rgba(200,150,46,0.1)", animation: "pulse 3s ease-in-out infinite" }} />
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(20deg)", width: 100, height: 100, borderRadius: "50%", border: "2px solid rgba(56,178,172,0.3)", boxShadow: "0 0 20px rgba(56,178,172,0.1)" }} />
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 36 }}>{path.icon}</div>
                            </div>
                            <p style={{ fontSize: 13, color: "#5c5549", lineHeight: 1.7, marginBottom: 12 }}>
                                تعلم كل ما تحتاجه للشروع في مسار وظيفي في مجال {path.title}. هذا المسار هو الأساس لمهنة في هذا المجال.
                            </p>
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px" }}>
                                {path.objectives.slice(0, 4).map((obj, i) => (
                                    <li key={i} style={{ fontSize: 12, color: "#5c5549", padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ color: "#c8962e", fontSize: 7 }}>●</span> {obj}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/paths" style={{ fontSize: 13, fontWeight: 600, color: "#2b6cb0", textDecoration: "none" }}>
                                يتعلم أكثر ←
                            </Link>
                        </div>

                        {/* شهادة إتمام الدورة - Course Completion Certificate */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1a1612", marginBottom: 12 }}>شهادة إتمام الدورة</h4>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #e8dcc8, #d4cbb8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: "1px solid rgba(200,150,46,0.15)" }}>
                                    📜
                                </div>
                                <p style={{ fontSize: 12, color: "#5c5549", lineHeight: 1.6, margin: 0 }}>
                                    أكمل مسار التعلم هذا لتطوير مهاراتك والحصول على شهادة إتمام
                                </p>
                            </div>
                        </div>

                        {/* Professional Certificate Card */}
                        {path.certCard && (
                            <div style={{ background: "linear-gradient(135deg, #1a1612, #2a2520)", borderRadius: 16, padding: "32px 24px", textAlign: "center", border: "1px solid rgba(200,150,46,0.15)" }}>
                                <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${path.certCard.color}40, ${path.certCard.color}20)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 36, border: `2px solid ${path.certCard.color}60` }}>
                                    🛡️
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#38b2ac", letterSpacing: 3, marginBottom: 8, textTransform: "uppercase" }}>CERTIFIED</div>
                                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#e8c068", margin: "0 0 8px" }}>شهادة {path.certCard.name} المهنية</h4>
                                <p style={{ fontSize: 12, color: "#a89f8e", marginBottom: 16, lineHeight: 1.6 }}>{path.certCard.desc}</p>
                                <Link href="/certificates" style={{ display: "inline-block", padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,150,46,0.3)", color: "#e8c068", fontSize: 13, fontWeight: 600, transition: "all 0.3s" }}>
                                    يتعلم لكن
                                </Link>
                            </div>
                        )}

                        {/* Start Button */}
                        <div className="glass-card p-6 text-center">
                            <Link href="/register" className="btn-primary w-full justify-center text-base py-3.5">🚀 ابدأ هذا المسار</Link>
                            <p className="text-[11px] mt-3" style={{ color: "#a89f8e" }}>مجاني — لا يتطلب بطاقة ائتمان</p>
                        </div>

                        {/* Tools */}
                        {path.tools.length > 0 && (
                            <div className="glass-card p-6">
                                <h4 className="font-bold text-sm mb-3" style={{ color: "#1a1612" }}>🔧 الأدوات</h4>
                                <div className="flex flex-wrap gap-2">{path.tools.map((t, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(200,150,46,0.08)", color: "#8b7340", border: "1px solid rgba(200,150,46,0.15)" }}>{t}</span>
                                ))}</div>
                            </div>
                        )}

                        {/* Certs */}
                        {path.certs.length > 0 && (
                            <div className="glass-card p-6">
                                <h4 className="font-bold text-sm mb-3" style={{ color: "#1a1612" }}>📜 الشهادات المرتبطة</h4>
                                <div className="space-y-2">{path.certs.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "#5c5549" }}><span>🏅</span> {c}</div>
                                ))}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Recommended Paths Section ═══ */}
            {(() => {
                const allPathIds = Object.keys(pathsDetailData);
                const otherPaths = allPathIds.filter(id => id !== pathId).slice(0, 4);
                if (otherPaths.length === 0) return null;
                return (
                    <section style={{ background: "rgba(250,246,238,0.5)", borderTop: "1px solid rgba(200,150,46,0.08)", padding: "48px 0 64px" }}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1612", textAlign: "center", marginBottom: 32 }}>جرب مسارات التعلم هذه...</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                                {otherPaths.map(pid => {
                                    const p = pathsDetailData[pid];
                                    if (!p) return null;
                                    return (
                                        <Link key={pid} href={`/paths/${pid}`} className="rec-card" style={{ textDecoration: "none" }}>
                                            <div style={{ background: p.gradient, padding: "28px 20px 20px", position: "relative", minHeight: 150 }}>
                                                <div style={{ position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, background: "#000000", color: "#fff", padding: "3px 10px", borderRadius: 6 }}>
                                                    {p.difficulty}
                                                </div>
                                                <div style={{ position: "absolute", top: 10, right: 16, fontSize: 36, opacity: 0.8 }}>{p.icon}</div>
                                                <div style={{ marginTop: 36 }}>
                                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{p.title}</div>
                                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{p.titleEn}</div>
                                                </div>
                                            </div>
                                            <div style={{ background: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 16, borderTop: "1px solid rgba(200,150,46,0.08)" }}>
                                                <span style={{ fontSize: 11, color: "#5c5549" }}>📦 {p.modules.length} وحدات</span>
                                                <span style={{ fontSize: 11, color: "#5c5549" }}>⏱️ {p.hours}h</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            })()}
        </div>
    );
}
