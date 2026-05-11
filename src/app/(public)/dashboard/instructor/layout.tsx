"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
    LayoutDashboard, 
    Video, 
    Users, 
    FlaskConical, 
    CircleDollarSign, 
    Settings, 
    Bell, 
    LogOut,
    Menu,
    X
} from "lucide-react";

export default function InstructorDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string, avatar: string, role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me').then(res => res.json()).then(data => {
            if (data.authenticated && (data.user.role === 'instructor' || data.user.role === 'admin')) {
                setUser(data.user);
            } else {
                router.push('/login');
            }
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen bg-[#0b0e14] items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const navItems = [
        { name: "الرئيسية", path: "/dashboard/instructor", icon: LayoutDashboard },
        { name: "الجلسات المباشرة", path: "/dashboard/instructor/sessions", icon: Video },
        { name: "إدارة الطلاب", path: "/dashboard/instructor/students", icon: Users },
        { name: "المختبرات والمحتوى", path: "/dashboard/instructor/labs", icon: FlaskConical },
        { name: "الأرباح (مكتسبة)", path: "/dashboard/instructor/earnings", icon: CircleDollarSign },
        { name: "الإعدادات والجدول", path: "/dashboard/instructor/settings", icon: Settings }
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0a0f] text-gray-200" dir="rtl" style={{
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0, 245, 255, 0.05) 0%, transparent 400px), radial-gradient(circle at 90% 80%, rgba(255, 0, 255, 0.03) 0%, transparent 400px)'
        }}>
            
            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-64 border-l border-white/5 bg-[#0b0e14] transition-transform duration-300 md:relative md:translate-x-0 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between p-6 h-20 border-b border-white/5">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all group-hover:shadow-[0_0_25px_rgba(0,245,255,0.6)]">
                                <span className="font-bold text-white text-sm">CS</span>
                            </div>
                            <span className="font-bold text-lg tracking-wide text-white">Cyber Instructor</span>
                        </Link>
                        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                        <div className="relative">
                            <img src={user.avatar || "https://ui-avatars.com/api/?name=" + user.name + "&background=0D8ABC&color=fff"} className="w-10 h-10 rounded-full border border-white/10" alt="avatar" />
                            <span className={`absolute bottom-0 left-0 w-3 h-3 border-2 border-[#0b0e14] rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate cursor-pointer hover:text-cyan-400 transition" onClick={() => setIsOnline(!isOnline)}>{isOnline ? 'متصل ومتاح' : 'بالخارج'}</p>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path || (pathname.startsWith(item.path + '/') && item.path !== '/dashboard/instructor');
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                                        isActive 
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(0,245,255,0.1)]" 
                                        : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300"} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,245,255,0.8)]"></div>}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <Link href="/logout" className="flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                            <LogOut size={20} />
                            <span className="font-medium text-sm">تسجيل الخروج</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-[#0b0e14] border-b border-white/5 flex items-center justify-between px-6 z-30">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-white hidden sm:block tracking-wide">
                            <span className="bg-clip-text text-transparent bg-gradient-to-l from-cyan-400 to-blue-500">لوحة تحكم المدرّب</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <button className="relative text-gray-400 hover:text-white transition">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(255,0,255,0.8)]"></span>
                        </button>
                        <Link href="/" className="px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition">
                            العودة للمنصة 🌍
                        </Link>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-auto custom-scrollbar relative p-4 md:p-8">
                    {children}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
                .glass-panel { background: #161a22; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; }
                .neon-border { box-shadow: 0 0 10px rgba(0, 245, 255, 0.1), inset 0 0 10px rgba(0, 245, 255, 0.05); border: 1px solid rgba(0, 245, 255, 0.2); }
            `}} />
        </div>
    );
}
