"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
    role: "user" | "model" | "error";
    content: string;
    originalQuery?: string;
}

interface AIChatContext {
    type?: string;
    id?: string;
    title?: string;
    description?: string;
    difficulty?: string;
}

// Quick action chips based on context
const QUICK_ACTIONS: Record<string, { label: string; prompt: string }[]> = {
    general: [
        { label: "🔐 ما هو الأمن السيبراني؟", prompt: "اشرح لي ما هو الأمن السيبراني بشكل مبسط" },
        { label: "🗺️ كيف أبدأ؟", prompt: "كيف أبدأ في تعلم الأمن السيبراني؟ ما المسار المناسب للمبتدئين؟" },
        { label: "🛡️ أنواع الهجمات", prompt: "ما هي أشهر أنواع الهجمات السيبرانية؟" },
        { label: "📝 اختبرني", prompt: "اختبرني بسؤال في الأمن السيبراني" },
    ],
    lesson: [
        { label: "📖 اشرح الدرس", prompt: "اشرح لي محتوى هذا الدرس بشكل مبسط" },
        { label: "❓ لدي سؤال", prompt: "لدي سؤال عن الدرس الحالي" },
        { label: "💡 أمثلة عملية", prompt: "أعطني أمثلة عملية على ما يتم شرحه في هذا الدرس" },
        { label: "📝 اختبرني", prompt: "اختبرني على محتوى هذا الدرس" },
    ],
    lab: [
        { label: "💡 تلميح", prompt: "أعطني تلميحاً لمساعدتي في هذا المختبر" },
        { label: "🤔 أنا عالق", prompt: "أنا عالق في هذا المختبر، ساعدني بدون إعطائي الحل" },
        { label: "📖 اشرح المفهوم", prompt: "اشرح لي المفهوم وراء هذا المختبر" },
        { label: "🔧 ما الأدوات؟", prompt: "ما الأدوات التي يمكنني استخدامها في هذا المختبر؟" },
    ],
    ctf: [
        { label: "💡 تلميح خفيف", prompt: "أعطني تلميحاً خفيفاً عن هذا التحدي بدون إعطائي الحل" },
        { label: "📖 شرح المفهوم", prompt: "اشرح لي المفهوم المطلوب لحل هذا النوع من التحديات" },
        { label: "🔍 من أين أبدأ؟", prompt: "من أين أبدأ في التعامل مع هذا التحدي؟" },
    ],
};

const CONTEXT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    general: { label: "مساعد عام", icon: "🧠", color: "#c8962e" },
    lesson: { label: "مساعد الدرس", icon: "📖", color: "#2da5c7" },
    lab: { label: "مساعد المختبر", icon: "🔬", color: "#805ad5" },
    ctf: { label: "مساعد التحدي", icon: "🚩", color: "#e53e3e" },
    "attack-map": { label: "محلل الهجمات", icon: "🌍", color: "#dd6b20" },
};

/**
 * Format message content — convert markdown-like syntax to styled HTML
 */
function formatContent(text: string) {
    // Process code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
        if (part.startsWith("```")) {
            const lines = part.slice(3, -3).split("\n");
            const lang = lines[0]?.trim() || "";
            const code = lang ? lines.slice(1).join("\n") : lines.join("\n");
            return (
                <div key={i} style={{ margin: "8px 0" }}>
                    {lang && (
                        <div style={{
                            background: "#2d2520", color: "#a89f8e",
                            padding: "4px 12px", borderRadius: "8px 8px 0 0",
                            fontSize: "10px", fontFamily: "monospace",
                        }}>{lang}</div>
                    )}
                    <pre style={{
                        background: "#1a1612", color: "#e8c068",
                        padding: "12px", borderRadius: lang ? "0 0 8px 8px" : "8px",
                        fontSize: "12px", overflowX: "auto",
                        fontFamily: "'Fira Code', 'Consolas', monospace",
                        lineHeight: 1.5, direction: "ltr", textAlign: "left",
                    }}>
                        <code>{code}</code>
                    </pre>
                </div>
            );
        }
        // Process inline formatting
        return (
            <span key={i}>
                {part.split("\n").map((line, j) => {
                    // Bold
                    let processed: any = line.replace(/\*\*(.*?)\*\*/g, "⟪BOLD⟫$1⟪/BOLD⟫");
                    // Inline code
                    processed = processed.replace(/`([^`]+)`/g, "⟪CODE⟫$1⟪/CODE⟫");

                    const segments = processed.split(/(⟪BOLD⟫.*?⟪\/BOLD⟫|⟪CODE⟫.*?⟪\/CODE⟫)/g);
                    return (
                        <span key={j}>
                            {j > 0 && <br />}
                            {segments.map((seg: string, k: number) => {
                                if (seg.startsWith("⟪BOLD⟫")) {
                                    return <strong key={k} style={{ color: "#3d3730" }}>{seg.replace(/⟪\/?BOLD⟫/g, "")}</strong>;
                                }
                                if (seg.startsWith("⟪CODE⟫")) {
                                    return (
                                        <code key={k} style={{
                                            background: "rgba(200,150,46,0.1)", color: "#c8962e",
                                            padding: "1px 6px", borderRadius: "4px",
                                            fontSize: "0.85em", fontFamily: "monospace", direction: "ltr",
                                        }}>{seg.replace(/⟪\/?CODE⟫/g, "")}</code>
                                    );
                                }
                                return seg;
                            })}
                        </span>
                    );
                })}
            </span>
        );
    });
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [context, setContext] = useState<AIChatContext>({ type: "general" });
    const [pulseBtn, setPulseBtn] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Listen for context changes from pages (lesson, lab, etc.)
    useEffect(() => {
        const handler = (e: CustomEvent) => {
            setContext(e.detail);
            // Reset conversation when context changes
            if (e.detail.type !== context.type || e.detail.id !== context.id) {
                setMessages([]);
                setConversationId(null);
            }
        };
        window.addEventListener("ai-context-change" as any, handler);
        return () => window.removeEventListener("ai-context-change" as any, handler);
    }, [context.type, context.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 200);
            setPulseBtn(false);
        }
    }, [isOpen]);

    // Keyboard shortcut: Ctrl+Shift+A
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === "A") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape" && isOpen) setIsOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen]);

    const sendMessage = useCallback(async (text?: string, isRetry: boolean = false) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;

        setInput("");
        
        if (!isRetry) {
            setMessages(prev => [...prev, { role: "user", content: msg }]);
        } else {
            // Remove previous error message when retrying
            setMessages(prev => prev.filter(m => m.role !== 'error'));
        }
        
        setLoading(true);

        try {
            // Setup timeout using AbortController for network hangs
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            console.log("Sending AI request...");
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    conversationId,
                    contextType: context.type,
                    contextId: context.id,
                    contextTitle: context.title,
                    contextDescription: context.description,
                    contextDifficulty: context.difficulty,
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { role: "model", content: data.response }]);
                if (data.conversationId) setConversationId(data.conversationId);
            } else {
                console.error("AI API Error Response:", data);
                let errorMessage = data.message || "❌ الخادم يواجه مشكلة في معالجة طلبك.";
                setMessages(prev => [...prev, {
                    role: "error",
                    content: errorMessage,
                    originalQuery: msg
                }]);
            }
        } catch (err: any) {
            console.error("AI Network Error:", err);
            let errorMessage = "❌ خطأ في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.";
            if (err.name === 'AbortError') {
                errorMessage = "⏳ استغرق الطلب وقتاً أطول من المعتاد. يرجى المحاولة مرة أخرى.";
            }
            setMessages(prev => [...prev, {
                role: "error",
                content: errorMessage,
                originalQuery: msg
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, loading, conversationId, context]);

    const clearChat = () => {
        if (conversationId) {
            fetch(`/api/ai?conversationId=${conversationId}`, { method: "DELETE" }).catch(() => {});
        }
        setMessages([]);
        setConversationId(null);
    };

    const ctxInfo = CONTEXT_LABELS[context.type || "general"] || CONTEXT_LABELS.general;
    const quickActions = QUICK_ACTIONS[context.type || "general"] || QUICK_ACTIONS.general;

    return (
        <>
            {/* ═══ Floating AI Button ═══ */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="فتح المساعد الذكي"
                style={{
                    position: "fixed",
                    bottom: "100px",
                    left: "24px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${ctxInfo.color}, ${ctxInfo.color}cc)`,
                    border: "none",
                    cursor: "pointer",
                    zIndex: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 20px ${ctxInfo.color}60`,
                    transition: "all 0.3s ease",
                    animation: pulseBtn ? "pulse-ring 2s ease-out infinite" : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
                <span style={{ fontSize: "28px", lineHeight: 1 }}>{isOpen ? "✕" : "🧠"}</span>
            </button>

            {/* ═══ Chat Panel ═══ */}
            {isOpen && (
                <div style={{
                    position: "fixed",
                    bottom: "170px",
                    left: "24px",
                    width: "400px",
                    maxWidth: "calc(100vw - 48px)",
                    height: "550px",
                    maxHeight: "calc(100vh - 200px)",
                    borderRadius: "20px",
                    background: "rgba(250, 246, 238, 0.98)",
                    border: `1px solid ${ctxInfo.color}30`,
                    boxShadow: `0 12px 48px rgba(0,0,0,0.12), 0 0 0 1px ${ctxInfo.color}15`,
                    zIndex: 998,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    animation: "scale-in 0.3s ease-out",
                }}>
                    {/* ─── Header ─── */}
                    <div style={{
                        padding: "16px 20px",
                        background: `linear-gradient(135deg, ${ctxInfo.color}12, ${ctxInfo.color}06)`,
                        borderBottom: `1px solid ${ctxInfo.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "12px",
                                background: `linear-gradient(135deg, ${ctxInfo.color}, ${ctxInfo.color}cc)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "18px",
                            }}>
                                {ctxInfo.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1612" }}>
                                    درع — {ctxInfo.label}
                                </div>
                                <div style={{ fontSize: "11px", color: "#a89f8e", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span style={{
                                        width: "6px", height: "6px", borderRadius: "50%",
                                        background: "#38b2ac", display: "inline-block",
                                    }} />
                                    متصل الآن
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                            {messages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    title="محادثة جديدة"
                                    style={{
                                        width: "32px", height: "32px", borderRadius: "10px",
                                        background: "rgba(229,62,62,0.08)", border: "none",
                                        cursor: "pointer", fontSize: "14px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >🗑️</button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    width: "32px", height: "32px", borderRadius: "10px",
                                    background: "rgba(200,150,46,0.08)", border: "none",
                                    cursor: "pointer", fontSize: "16px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                            >✕</button>
                        </div>
                    </div>

                    {/* ─── Context Badge ─── */}
                    {context.title && (
                        <div style={{
                            padding: "8px 20px",
                            background: `${ctxInfo.color}08`,
                            borderBottom: `1px solid ${ctxInfo.color}10`,
                            fontSize: "11px", color: ctxInfo.color,
                            fontWeight: 600,
                            display: "flex", alignItems: "center", gap: "6px",
                        }}>
                            📌 {context.title}
                        </div>
                    )}

                    {/* ─── Messages ─── */}
                    <div style={{
                        flex: 1, overflowY: "auto", padding: "16px 16px 8px",
                        display: "flex", flexDirection: "column", gap: "12px",
                    }}>
                        {messages.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "30px 10px" }}>
                                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧠</div>
                                <div style={{ fontWeight: 700, fontSize: "16px", color: "#1a1612", marginBottom: "6px" }}>
                                    مرحباً! أنا درع
                                </div>
                                <div style={{ fontSize: "13px", color: "#7a7164", marginBottom: "20px", lineHeight: 1.6 }}>
                                    مساعدك الذكي في الأمن السيبراني.<br />
                                    اسألني أي شيء أو جرّب أحد الاقتراحات:
                                </div>
                                {/* Quick Actions */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                                    {quickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(action.prompt)}
                                            style={{
                                                padding: "8px 14px", borderRadius: "20px",
                                                background: "rgba(255,255,255,0.8)",
                                                border: `1px solid ${ctxInfo.color}20`,
                                                fontSize: "12px", fontWeight: 500,
                                                color: "#3d3730", cursor: "pointer",
                                                transition: "all 0.2s",
                                                fontFamily: "var(--font-family-arabic)",
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = `${ctxInfo.color}12`;
                                                e.currentTarget.style.borderColor = `${ctxInfo.color}40`;
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                                                e.currentTarget.style.borderColor = `${ctxInfo.color}20`;
                                            }}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                msg.role === 'error' ? (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0' }}>
                                        <div style={{ 
                                            background: 'rgba(229,62,62,0.1)',
                                            border: '1px solid rgba(229,62,62,0.3)',
                                            color: '#c53030', fontSize: '12px', textAlign: 'center', 
                                            padding: '8px 16px', borderRadius: '8px', marginBottom: '8px' 
                                        }}>
                                            {msg.content}
                                        </div>
                                        {msg.originalQuery && (
                                            <button
                                                onClick={() => sendMessage(msg.originalQuery, true)}
                                                style={{
                                                    padding: "6px 12px", borderRadius: "12px",
                                                    background: "#ffffff", border: "1px solid rgba(229,62,62,0.5)",
                                                    color: "#c53030", fontSize: "11px", cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "6px",
                                                    fontWeight: 600, boxShadow: "0 2px 4px rgba(229,62,62,0.1)"
                                                }}
                                            >
                                                🔄 إرسال مرة أخرى
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: "85%",
                                            padding: "12px 16px",
                                            borderRadius: msg.role === "user"
                                                ? "16px 16px 4px 16px"
                                                : "16px 16px 16px 4px",
                                            background: msg.role === "user"
                                                ? `linear-gradient(135deg, ${ctxInfo.color}, ${ctxInfo.color}dd)`
                                                : "rgba(255,255,255,0.85)",
                                            color: msg.role === "user" ? "white" : "#3d3730",
                                            fontSize: "13px",
                                            lineHeight: 1.7,
                                            border: msg.role === "model" ? "1px solid rgba(200,150,46,0.1)" : "none",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                            wordBreak: "break-word",
                                        }}>
                                            {msg.role === "model" ? formatContent(msg.content) : msg.content}
                                        </div>
                                    </div>
                                )
                            ))
                        )}

                        {/* Loading / Typing indicator */}
                        {loading && (
                            <div style={{ display: "flex", justifyContent: "flex-start", animation: "fade-in 0.3s ease" }}>
                                <div style={{
                                    padding: "12px 20px", borderRadius: "16px 16px 16px 4px",
                                    background: "rgba(255,255,255,0.85)",
                                    border: "1px solid rgba(200,150,46,0.1)",
                                    display: "flex", gap: "8px", alignItems: "center",
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} style={{
                                            width: "6px", height: "6px", borderRadius: "50%",
                                            background: ctxInfo.color,
                                            opacity: 0.6,
                                            animation: `bounce-subtle 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        }} />
                                    ))}
                                    <span style={{ fontSize: "12px", color: "#8a8174", marginRight: "4px", fontWeight: 500 }}>
                                        جاري الكتابة...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ─── Input Area ─── */}
                    <div style={{
                        padding: "12px 16px 16px",
                        borderTop: "1px solid rgba(200,150,46,0.1)",
                        background: "rgba(250,246,238,0.6)",
                    }}>
                        <form
                            onSubmit={e => { e.preventDefault(); sendMessage(); }}
                            style={{
                                display: "flex", gap: "8px", alignItems: "flex-end",
                            }}
                        >
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="اكتب سؤالك هنا..."
                                rows={1}
                                disabled={loading}
                                style={{
                                    flex: 1, resize: "none",
                                    padding: "10px 14px",
                                    borderRadius: "14px",
                                    border: `1px solid rgba(200,150,46,0.15)`,
                                    background: loading ? "rgba(240,240,240,0.8)" : "rgba(255,255,255,0.8)",
                                    fontSize: "13px",
                                    lineHeight: 1.5,
                                    fontFamily: "var(--font-family-arabic)",
                                    color: "#1a1612",
                                    outline: "none",
                                    direction: "rtl",
                                    maxHeight: "100px",
                                    overflowY: "auto",
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? "not-allowed" : "text",
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = `${ctxInfo.color}40`; }}
                                onBlur={e => { e.currentTarget.style.borderColor = "rgba(200,150,46,0.15)"; }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                style={{
                                    width: "42px", height: "42px",
                                    borderRadius: "14px",
                                    background: (input.trim() && !loading)
                                        ? `linear-gradient(135deg, ${ctxInfo.color}, ${ctxInfo.color}cc)`
                                        : "rgba(200,150,46,0.1)",
                                    border: "none",
                                    cursor: (input.trim() && !loading) ? "pointer" : "default",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                    transition: "all 0.2s",
                                    flexShrink: 0,
                                    opacity: loading ? 0.5 : 1,
                                }}
                            >
                                {loading ? (
                                    <span style={{ 
                                        width: '16px', height: '16px', 
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTop: '2px solid white', borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                ) : "⬆️"}
                            </button>
                        </form>
                        <div style={{
                            textAlign: "center", marginTop: "8px",
                            fontSize: "10px", color: "#a89f8e",
                        }}>
                            Ctrl+Shift+A للفتح/الإغلاق • مدعوم بـ Google Gemini
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
