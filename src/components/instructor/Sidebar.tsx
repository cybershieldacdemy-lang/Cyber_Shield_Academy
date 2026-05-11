"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    BookOpen, 
    Users, 
    Video, 
    ClipboardList, 
    MessageSquare, 
    DollarSign, 
    Award, 
    Star, 
    BarChart, 
    Settings,
    LogOut,
    Shield
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
    { title: "الرئيسية", icon: LayoutDashboard, href: "/instructor/dashboard" },
    { title: "دوراتي", icon: BookOpen, href: "/instructor/courses" },
    { title: "الطلاب", icon: Users, href: "/instructor/students" },
    { title: "الجلسات المباشرة", icon: Video, href: "/instructor/live" },
    { title: "الاختبارات والمهام", icon: ClipboardList, href: "/instructor/quizzes" },
    { title: "الشهادات", icon: Award, href: "/instructor/certificates" },
    { title: "التحليلات", icon: BarChart, href: "/instructor/analytics" },
    { title: "الإعدادات", icon: Settings, href: "/instructor/settings" },
];

export default function InstructorSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-[#0B0F19]/95 backdrop-blur-xl border-l border-cyber-800 flex flex-col z-50 text-right font-cairo shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            {/* Logo area */}
            <div className="h-20 flex items-center justify-center border-b border-cyber-800/50">
                <Link href="/instructor/dashboard" className="flex items-center gap-2 group">
                    <Shield className="w-8 h-8 text-cyber-500 group-hover:text-cyber-400 transition-colors" />
                    <span className="text-xl font-bold text-white tracking-wider">
                        Cyber<span className="text-cyber-500">Shield</span>
                    </span>
                </Link>
            </div>

            {/* Menu items */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.02, x: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    isActive 
                                    ? "bg-cyber-500/10 text-cyber-500 font-bold border border-cyber-500/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]" 
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-cyber-500' : 'opacity-70'}`} />
                                <span className="flex-1">{item.title}</span>
                                
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeIndicator"
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyber-500 rounded-l-full shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-cyber-800/50">
                <Link href="/dashboard">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <span>الخروج للوحة العادية</span>
                        <LogOut className="w-4 h-4" />
                    </motion.div>
                </Link>
            </div>
        </aside>
    );
}
