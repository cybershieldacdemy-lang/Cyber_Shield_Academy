"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProfileAvatar from "./ProfileAvatar";
import { useTheme } from "../ThemeProvider";

// Grouped mega-menu structure
const menuGroups = [
    {
        label: "📚 تعلّم",
        items: [
            { href: "/about", label: "ما هو الأمن السيبراني", icon: "🔐", desc: "مقدمة شاملة" },
            { href: "/courses", label: "الدورات التدريبية", icon: "🎓", desc: "دورات احترافية" },
            { href: "/paths", label: "مسارات التعلم", icon: "🗺️", desc: "14 مسار متخصص" },
            { href: "/terms", label: "قاموس المصطلحات", icon: "📖", desc: "+1,300 مصطلح" },
            { href: "/domains", label: "التخصصات", icon: "🎯", desc: "12 تخصص أمني" },
        ],
    },
    {
        label: "⚔️ تدرّب",
        items: [
            { href: "/labs", label: "المختبرات العملية", icon: "🔬", desc: "بيئة تدريب آمنة" },
            { href: "/ctf", label: "تحديات CTF", icon: "🚩", desc: "اختبر مهاراتك" },
            { href: "/simulations", label: "محاكاة واقعية", icon: "🎮", desc: "سيناريوهات حقيقية" },
            { href: "/threat-map", label: "خريطة الهجمات", icon: "🌍", desc: "هجمات حية" },
        ],
    },
    {
        label: "👥 مجتمع",
        items: [
            { href: "/leaderboard", label: "لوحة المتصدرين", icon: "🏆", desc: "أفضل المتعلمين" },
            { href: "/achievements", label: "الإنجازات", icon: "🏅", desc: "شارات وأوسمة" },
            { href: "/blog", label: "المقالات", icon: "✍️", desc: "محتوى تعليمي" },
            { href: "/news", label: "أخبار الثغرات", icon: "📰", desc: "آخر التهديدات" },
        ],
    },
    {
        label: "💼 مهنة",
        items: [
            { href: "/jobs", label: "الوظائف", icon: "🏢", desc: "فرص عمل" },
            { href: "/certificates", label: "الشهادات", icon: "📜", desc: "شهادات إتمام" },
            { href: "/teachers", label: "المدرّبون", icon: "👨‍🏫", desc: "خبراء معتمدون" },
            { href: "/become-instructor", label: "انضم كمدرّب", icon: "💼", desc: "شارك خبرتك" },
            { href: "/live", label: "جلسات مباشرة", icon: "📹", desc: "تعلم تفاعلي" },
            { href: "/tools", label: "الأدوات", icon: "🛠️", desc: "أدوات أمنية" },
        ],
    },
];

// Flat list for mobile
const allLinks = menuGroups.flatMap((g) => g.items);

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const [user, setUser] = useState<{ name: string; email: string; role: string; avatar?: string } | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();
    
    // Notifications state
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const megaRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
    }, [searchOpen]);

    // Fetch Notifications helper
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setNotificationsLoading(true);
        try {
            const res = await fetch('/api/user/notifications?limit=10');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (e) {
            console.error('Failed to load notifications', e);
        } finally {
            setNotificationsLoading(false);
        }
    }, [user]);

    // Initial fetch for unread count if user
    useEffect(() => {
        if (user) fetchNotifications();
    }, [user, fetchNotifications]);

    // Handle marking notification read
    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/user/notifications/${id}`, { method: 'PUT' });
            // Update local state optimistic
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch('/api/user/notifications', { method: 'PUT' });
            setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    // Keyboard: Escape to close, Ctrl+K to open
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Debounced search
    const performSearch = useCallback(async (query: string) => {
        if (query.trim().length < 2) { setSearchResults([]); return; }
        setSearchLoading(true);
        try {
            const results: any[] = [];
            // Search videos
            const vRes = await fetch(`/api/learning-videos?search=${encodeURIComponent(query)}&limit=5`);
            if (vRes.ok) { const d = await vRes.json(); (d.videos || []).forEach((v: any) => results.push({ type: 'video', title: v.title, desc: v.category, href: '/videos', icon: '🎬', level: v.level })); }
            // Search from site map
            const siteItems = allLinks.filter(l => l.label.includes(query) || l.desc.includes(query));
            siteItems.forEach(l => results.push({ type: 'page', title: l.label, desc: l.desc, href: l.href, icon: l.icon }));
            setSearchResults(results.slice(0, 10));
        } catch { setSearchResults([]); }
        finally { setSearchLoading(false); }
    }, []);

    const handleSearchInput = (val: string) => {
        setSearchQuery(val);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => performSearch(val), 300);
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Check auth state (once on mount — auth state persists across navigations)
    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/auth/me", { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated) setUser(data.user);
                else setUser(null);
            })
            .catch(() => setUser(null));
        return () => controller.abort();
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setOpenGroup(null);
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setNotificationsOpen(false);
    }, [pathname]);

    // Close mega-menu / notifications on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
                setOpenGroup(null);
            }
            // Add a specific check later for notifications if we create a ref,
            // or let the backdrop handle closing.
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <nav
            className="fixed top-0 right-0 left-0 z-50 transition-all duration-500"
            suppressHydrationWarning
            style={{
                background: "var(--color-cyber-950)",
                borderBottom: `1px solid rgba(200, 150, 46, ${scrolled ? 0.2 : 0.08})`,
                boxShadow: scrolled ? "0 4px 24px rgba(0, 0, 0, 0.06)" : "none",
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110"
                            style={{
                                background: "linear-gradient(135deg, #c8962e, #e8c068)",
                                boxShadow: "0 2px 8px rgba(200, 150, 46, 0.3)",
                            }}
                        >
                            🛡️
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-tight" style={{ color: "#c8962e" }}>CyberShield</span>
                            <span className="text-[10px] font-medium leading-tight" style={{ color: "#a89f8e" }}>Academy</span>
                        </div>
                    </Link>

                    {/* Desktop Nav — Mega Menu */}
                    <div className="hidden lg:flex items-center gap-1" ref={megaRef}>
                        {menuGroups.map((group) => (
                            <div key={group.label} className="relative">
                                <button
                                    onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                                    className="px-3 py-2 text-sm rounded-lg transition-all duration-300 flex items-center gap-1.5"
                                    style={{
                                        color: openGroup === group.label ? "#c8962e" : "#3d3730",
                                        fontWeight: openGroup === group.label ? 700 : 500,
                                        background: openGroup === group.label ? "rgba(200, 150, 46, 0.08)" : "transparent",
                                    }}
                                >
                                    {group.label}
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 0.2s", transform: openGroup === group.label ? "rotate(180deg)" : "rotate(0)" }}>
                                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Dropdown */}
                                {openGroup === group.label && (
                                    <div
                                        className="absolute top-full right-0 mt-2 rounded-2xl p-3 min-w-[280px] animate-fade-in"
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid rgba(200, 150, 46, 0.18)",
                                            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
                                        }}
                                    >
                                        {group.items.map((item) => {
                                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item"
                                                    style={{
                                                        background: isActive ? "rgba(200, 150, 46, 0.08)" : "transparent",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive) e.currentTarget.style.background = "rgba(200, 150, 46, 0.05)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive) e.currentTarget.style.background = "transparent";
                                                    }}
                                                    onClick={() => setOpenGroup(null)}
                                                >
                                                    <span className="text-xl">{item.icon}</span>
                                                    <div>
                                                        <div className="text-sm font-semibold" style={{ color: isActive ? "#c8962e" : "#3d3730" }}>
                                                            {item.label}
                                                        </div>
                                                        <div className="text-[11px]" style={{ color: "#a89f8e" }}>{item.desc}</div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Side — Auth / User */}
                    <div className="hidden lg:flex items-center gap-2.5">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: "#5c5549", background: searchOpen ? "rgba(200,150,46,0.08)" : "transparent" }}
                            title="بحث"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                            style={{ 
                                color: "#5c5549", 
                                background: "transparent" 
                            }}
                            title={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
                        >
                            {theme === "light" ? (
                                <span className="text-xl">🌙</span>
                            ) : (
                                <span className="text-xl">☀️</span>
                            )}
                        </button>

                        {user ? (
                            /* Authenticated User */
                            <div className="flex items-center gap-3 relative">
                                {/* Notification Bell */}
                                <button
                                    onClick={() => { setNotificationsOpen(!notificationsOpen); if (!notificationsOpen) fetchNotifications(); }}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center relative transition-all"
                                    style={{
                                        color: "#5c5549",
                                        background: notificationsOpen ? "rgba(200,150,46,0.08)" : "transparent"
                                    }}
                                    title="الإشعارات"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full" style={{ background: "#e53e3e", border: "2px solid #faf6ee" }} />
                                    )}
                                </button>







                                {/* User Avatar */}
                                <div
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                                    style={{ border: "1px solid rgba(200,150,46,0.15)" }}
                                >
                                    <ProfileAvatar 
                                        user={user} 
                                        onAvatarUpdate={(newUrl) => setUser(prev => prev ? { ...prev, avatar: newUrl } : null)}
                                    />
                                    <Link
                                        href="/dashboard"
                                        className="text-sm font-semibold transition-colors hover:opacity-80" 
                                        style={{ color: "#3d3730" }}
                                    >
                                        {user.name?.split(" ")[0]}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Guest */
                            <>
                                <Link
                                    href="/login"
                                    className="px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                                    style={{ color: "#3d3730" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = "#c8962e"; e.currentTarget.style.background = "rgba(200, 150, 46, 0.05)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = "#3d3730"; e.currentTarget.style.background = "transparent"; }}
                                >
                                    تسجيل الدخول
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-6 py-2 text-sm font-bold rounded-xl text-white transition-all duration-300"
                                    style={{
                                        background: "linear-gradient(135deg, #c8962e, #b0831f)",
                                        boxShadow: "0 2px 8px rgba(200, 150, 46, 0.25)",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(200, 150, 46, 0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(200, 150, 46, 0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    ابدأ مجاناً
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-lg transition-all duration-300"
                        style={{ color: "#3d3730", background: isOpen ? "rgba(200, 150, 46, 0.08)" : "transparent" }}
                        aria-label="Toggle menu"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {isOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="4" y1="7" x2="20" y2="7" />
                                    <line x1="4" y1="12" x2="16" y2="12" />
                                    <line x1="4" y1="17" x2="20" y2="17" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className="lg:hidden overflow-y-auto transition-all duration-400"
                style={{
                    maxHeight: isOpen ? "85vh" : "0",
                    opacity: isOpen ? 1 : 0,
                    background: "rgba(250, 246, 238, 0.99)",
                    borderTop: isOpen ? "1px solid rgba(200, 150, 46, 0.1)" : "none",
                }}
            >
                <div className="px-4 py-4 space-y-1">
                    {/* User Info (mobile) */}
                    {user && (
                        <Link href="/dashboard" className="flex items-center gap-3 p-3 mb-3 rounded-xl" style={{ background: "rgba(200,150,46,0.06)", border: "1px solid rgba(200,150,46,0.12)" }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white" style={{ background: "linear-gradient(135deg, #c8962e, #e8c068)" }}>
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 flex justify-between items-center pr-2">
                                <div>
                                    <div className="text-sm font-bold" style={{ color: "#3d3730" }}>{user.name}</div>
                                    <div className="text-[11px] font-bold" style={{ color: "#a89f8e" }}>
                                        👤 لوحتي ←
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Grouped Links */}
                    {menuGroups.map((group) => (
                        <div key={group.label}>
                            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#a89f8e" }}>
                                {group.label}
                            </div>
                            {group.items.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all"
                                        style={{
                                            color: isActive ? "#c8962e" : "#3d3730",
                                            fontWeight: isActive ? 700 : 500,
                                            background: isActive ? "rgba(200, 150, 46, 0.08)" : "transparent",
                                        }}
                                    >
                                        <span className="text-base">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                    {!user && (
                        <div className="pt-3 flex gap-3 mt-3" style={{ borderTop: "1px solid rgba(200, 150, 46, 0.1)" }}>
                            <Link href="/login" className="py-2.5 flex-1 text-center text-sm font-medium rounded-xl transition-all" style={{ color: "#3d3730", border: "1px solid #d4cbb8" }}>
                                تسجيل الدخول
                            </Link>
                            <Link href="/register" className="py-2.5 flex-1 text-center text-sm font-bold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #c8962e, #b0831f)", boxShadow: "0 2px 8px rgba(200, 150, 46, 0.25)" }}>
                                ابدأ مجاناً
                            </Link>
                        </div>
                    )}
                    
                    {/* Mobile Theme Toggle */}
                    <div className="pt-3 pb-2 mt-2 flex justify-center" style={{ borderTop: "1px solid rgba(200, 150, 46, 0.1)" }}>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{ 
                                background: "rgba(200, 150, 46, 0.08)",
                                color: "#5c5549"
                            }}
                        >
                            {theme === "light" ? "🌙 تفعيل الوضع الليلي" : "☀️ تفعيل الوضع النهاري"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ══════ NOTIFICATIONS OVERLAY ══════ */}
            {notificationsOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setNotificationsOpen(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }} // Transparent backdrop just to catch clicks
                    />
                    {/* Panel */}
                    <div
                        className="absolute right-4 mt-2 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up"
                        style={{
                            top: '64px',
                            width: '360px',
                            zIndex: 50,
                            background: "#ffffff",
                            border: "1px solid rgba(200, 150, 46, 0.18)",
                        }}
                    >
                        <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: "1px solid rgba(200, 150, 46, 0.1)" }}>
                            <div className="font-bold text-base" style={{ color: "var(--color-cyber-100)" }}>الإشعارات</div>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs font-semibold hover:underline" style={{ color: "#c8962e" }}>
                                    تحديد الكل كمقروء
                                </button>
                            )}
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {notificationsLoading ? (
                                <div className="p-8 text-center" style={{ color: "var(--color-cyber-400)" }}>
                                    <span className="animate-pulse">⏳ جاري التحميل...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-4xl mb-2">📭</div>
                                    <div className="text-sm font-medium" style={{ color: "var(--color-cyber-400)" }}>لا توجد إشعارات جديدة</div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                if (!notif.read) markAsRead(notif.id);
                                                if (notif.link) { setNotificationsOpen(false); router.push(notif.link); }
                                            }}
                                            className={`p-4 flex gap-3 transition-colors cursor-pointer ${notif.read ? 'opacity-70' : 'bg-[#c8962e08]'}`}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(200, 150, 46, 0.05)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.read ? "transparent" : "rgba(200, 150, 46, 0.03)"; }}
                                        >
                                            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl bg-white shadow-sm" style={{ border: "1px solid rgba(200, 150, 46, 0.2)" }}>
                                                {notif.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate pr-1" style={{ color: "var(--color-cyber-100)" }}>{notif.title}</h4>
                                                    {!notif.read && <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: "#c8962e" }} />}
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed" style={{ color: "var(--color-cyber-300)" }}>{notif.message}</p>
                                                <div className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                                    <span>🕒</span>
                                                    {new Date(notif.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link
                            href="/dashboard?tab=notifications"
                            onClick={() => setNotificationsOpen(false)}
                            className="block w-full text-center py-2.5 text-xs font-bold transition-colors hover:bg-gray-50"
                            style={{ color: "#5c5549", borderTop: "1px solid rgba(200, 150, 46, 0.1)" }}
                        >
                            عرض كل الإشعارات →
                        </Link>
                    </div>
                </>
            )}
            {searchOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 40,
                            background: 'rgba(26, 22, 18, 0.5)',
                            animation: 'fade-in 0.2s ease',
                        }}
                    />
                    {/* Search Panel */}
                    <div style={{
                        position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
                        width: '94%', maxWidth: 640, zIndex: 50,
                        background: '#ffffff', borderRadius: 20,
                        border: '1px solid rgba(200,150,46,0.2)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        animation: 'fade-in-up 0.25s ease',
                    }}>
                        {/* Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(200,150,46,0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8962e" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="ابحث عن دورات، فيديوهات، مصطلحات، مسارات..."
                                value={searchQuery}
                                onChange={e => handleSearchInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        router.push(`/videos?search=${encodeURIComponent(searchQuery.trim())}`);
                                        setSearchOpen(false);
                                    }
                                }}
                                style={{
                                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                                    fontFamily: 'var(--font-family-arabic)', fontSize: '1rem',
                                    color: 'var(--color-cyber-100)',
                                }}
                            />
                            <kbd style={{
                                padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                                background: 'rgba(200,150,46,0.08)', border: '1px solid rgba(200,150,46,0.15)',
                                color: 'var(--color-cyber-400)', fontFamily: 'monospace',
                            }}>ESC</kbd>
                        </div>

                        {/* Results */}
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {searchLoading && (
                                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-cyber-400)', fontSize: '0.9rem' }}>
                                    <span className="animate-pulse">⏳ جاري البحث...</span>
                                </div>
                            )}

                            {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                                <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-cyber-500)' }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                                    <div style={{ fontSize: '0.9rem' }}>لا توجد نتائج لـ &quot;{searchQuery}&quot;</div>
                                </div>
                            )}

                            {!searchLoading && searchResults.length > 0 && (
                                <div style={{ padding: 8 }}>
                                    {searchResults.map((r, i) => (
                                        <Link
                                            key={i}
                                            href={r.href}
                                            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 14,
                                                padding: '12px 16px', borderRadius: 12,
                                                transition: 'background 0.15s', textDecoration: 'none',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,150,46,0.06)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <span style={{
                                                width: 40, height: 40, borderRadius: 12,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 18, flexShrink: 0,
                                                background: r.type === 'video' ? 'rgba(200,150,46,0.1)' : 'rgba(45,165,199,0.1)',
                                            }}>
                                                {r.icon}
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '0.88rem', fontWeight: 600,
                                                    color: 'var(--color-cyber-100)',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {r.title}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-cyber-500)' }}>
                                                    {r.type === 'video' ? '🎬 فيديو' : '📄 صفحة'} — {r.desc}
                                                </div>
                                            </div>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyber-600)" strokeWidth="2" strokeLinecap="round">
                                                <polyline points="15 18 9 12 15 6" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Quick Links when empty */}
                            {!searchLoading && searchQuery.length < 2 && (
                                <div style={{ padding: 16 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cyber-500)', marginBottom: 10, paddingRight: 8 }}>
                                        🔗 روابط سريعة
                                    </div>
                                    {[
                                        { href: '/videos', icon: '🎬', label: 'مكتبة الفيديوهات', desc: '+500 فيديو تعليمي' },
                                        { href: '/courses', icon: '🎓', label: 'الدورات التدريبية', desc: 'دورات احترافية' },
                                        { href: '/paths', icon: '🗺️', label: 'مسارات التعلم', desc: '14 مسار متخصص' },
                                        { href: '/terms', icon: '📖', label: 'قاموس المصطلحات', desc: '+1,300 مصطلح' },
                                        { href: '/labs', icon: '🔬', label: 'المختبرات العملية', desc: 'بيئة تدريب آمنة' },
                                    ].map((l, i) => (
                                        <Link key={i} href={l.href}
                                            onClick={() => { setSearchOpen(false); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '10px 12px', borderRadius: 10,
                                                transition: 'background 0.15s', textDecoration: 'none',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,150,46,0.06)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <span style={{ fontSize: 16 }}>{l.icon}</span>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-cyber-200)' }}>{l.label}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--color-cyber-500)' }}>{l.desc}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div style={{
                            padding: '10px 20px', borderTop: '1px solid rgba(200,150,46,0.08)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: '0.72rem', color: 'var(--color-cyber-600)',
                        }}>
                            <span>اضغط <kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(200,150,46,0.08)', border: '1px solid rgba(200,150,46,0.12)', fontFamily: 'monospace', fontSize: '0.7rem' }}>Enter</kbd> للبحث في الفيديوهات</span>
                            <span><kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(200,150,46,0.08)', border: '1px solid rgba(200,150,46,0.12)', fontFamily: 'monospace', fontSize: '0.7rem' }}>Ctrl+K</kbd> للفتح</span>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
