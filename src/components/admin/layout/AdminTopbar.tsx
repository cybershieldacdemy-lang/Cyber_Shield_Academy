import React from 'react';
import Link from 'next/link';
import LogoutButton from "@/components/LogoutButton";
import { Bell, Search, Menu } from 'lucide-react';
import { TabType } from './AdminSidebar';

interface AdminTopbarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeTab: TabType;
}

export default function AdminTopbar({ sidebarOpen, setSidebarOpen, activeTab }: AdminTopbarProps) {
    
    // Breadcrumb text mapping
    const getTabName = (tab: TabType) => {
        const names: Record<TabType, string> = {
            'overview': 'نظرة عامة',
            'sessions': 'الجلسات المباشرة',
            'instructors': 'المدربين',
            'users': 'المستخدمين',
            'terms': 'المصطلحات',
            'subscriptions': 'الاشتراكات',
            'incidents': 'الحوادث الأمنية',
            'firewall': 'جدار الحماية',
            'ids': 'كشف التسلل',
            'assets': 'سجل الأصول',
            'audit': 'سجل العمليات',
            'compliance': 'معايير الامتثال',
            'vulnerabilities': 'تتبع الثغرات',
            'backup': 'النسخ الاحتياطية',
            'change-control': 'التحكم بالتغيير',
            'settings': 'الإعدادات'
        };
        return names[tab] || tab;
    };

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#0b0e14]/80 backdrop-blur-md border-b border-cyber-800/30 sticky top-0 z-20 w-full shrink-0">
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-lg text-cyber-400 hover:text-white hover:bg-cyber-800/50"
                >
                    <Menu size={20} />
                </button>
                
                {/* Breadcrumbs */}
                <div className="hidden md:flex items-center gap-2 text-sm">
                    <span className="text-cyber-500 font-medium">القيادة المركزية</span>
                    <span className="text-cyber-600">/</span>
                    <span className="text-white font-bold">{getTabName(activeTab)}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
                
                {/* Global Search (Placeholder) */}
                <div className="hidden md:flex items-center bg-cyber-900/50 px-3 py-1.5 rounded-lg border border-cyber-800/50 focus-within:border-accent transition-colors w-64">
                    <Search size={16} className="text-cyber-500 ml-2" />
                    <input 
                        type="text" 
                        placeholder="بحث في لوحة التحكم..." 
                        className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-cyber-600"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-cyber-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <div className="h-6 w-px bg-cyber-800"></div>
                
                {/* Status Indicator */}
                <div className="hidden lg:flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                    <span className="text-[10px] text-green-400 font-mono font-bold uppercase tracking-wider">System Secure</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link href="/" target="_blank" className="text-[11px] px-4 py-2 rounded-lg transition-all bg-cyber-950/80 text-cyber-400 border border-cyber-800 hover:border-accent hover:text-white backdrop-blur-sm">
                        الموقع ↗
                    </Link>
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}
